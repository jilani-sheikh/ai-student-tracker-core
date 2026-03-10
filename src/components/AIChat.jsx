import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { getGeminiModel } from '../lib/gemini';
import { databases, TABLES, DATABASE_ID } from '../lib/appwrite';
import { ID } from 'appwrite';

export default function AIChat({ userId, paceScore }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    
    const recognition = useRef(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognition.current.onerror = () => setIsListening(false);
            recognition.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
        } else {
            recognition.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        synth.speak(utterance);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', message: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Save user message to Appwrite
            await databases.createDocument(DATABASE_ID, TABLES.CHAT_HISTORY, ID.unique(), {
                userId,
                role: 'user',
                message: input,
                timestamp: new Date().toISOString()
            });

            const model = getGeminiModel(paceScore);
            const result = await model.generateContent(input);
            const responseText = result.response.text();

            const assistantMsg = { role: 'assistant', message: responseText, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, assistantMsg]);

            // Save assistant message to Appwrite
            await databases.createDocument(DATABASE_ID, TABLES.CHAT_HISTORY, ID.unique(), {
                userId,
                role: 'assistant',
                message: responseText,
                timestamp: new Date().toISOString()
            });

            if (isSpeaking) speak(responseText);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card flex flex-col h-[600px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <Bot className="text-purple-400" />
                    <h2 className="text-xl font-bold">PulseAI Tutor</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSpeaking(!isSpeaking)}
                        className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10'}`}
                    >
                        {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button 
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10'}`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 p-2 rounded-xl transition-all active:scale-95"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
