import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Lock, Mail } from 'lucide-react';
import { getGeminiModel } from '../lib/gemini';
import { databases, TABLES, DATABASE_ID } from '../lib/appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';

export default function AIChat({ userId, paceScore, educationLevel, subject, fullName, onQuizGenerated }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true); 
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const [aiConnectionStatus, setAiConnectionStatus] = useState('connected');

    // Initial greeting based on context
    useEffect(() => {
        if (messages.length === 0) {
            const greeting = subject 
                ? `Hello! I'm your PulseAI tutor. Let's dive into ${subject}. Ready to explore?`
                : "Welcome to the Learning Lab! What subject should we explore today?";
            setMessages([{ role: 'assistant', message: greeting, timestamp: new Date().toISOString() }]);
        }
    }, [subject]);
    
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
                toast.success("Voice captured");
            };

            recognition.current.onerror = (e) => {
                setIsListening(false);
                toast.error("Speech recognition error: " + e.error);
            };
            recognition.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleListening = () => {
        try {
            if (isListening) {
                recognition.current?.stop();
            } else {
                recognition.current?.start();
                setIsListening(true);
            }
        } catch (e) {
            toast.error("Microphone access failed.");
        }
    };

    const speak = (text) => {
        if (!isSpeaking) return;
        if (synth.speaking) synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {};
        synth.speak(utterance);
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const currentInput = input;
        const userMsg = { role: 'user', message: currentInput, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            setAiConnectionStatus('connected');
            // Save user message
            await databases.createDocument(DATABASE_ID, TABLES.CHAT_HISTORY, ID.unique(), {
                userId,
                role: 'user',
                message: currentInput,
                timestamp: new Date().toISOString()
            });

            const model = getGeminiModel(paceScore, educationLevel, subject, fullName);
            const result = await model.generateContent(currentInput);
            const responseText = result.response.text();
            console.log("AI Response received:", responseText);

            // Try to extract JSON quiz block from the AI string
            let quizPayload = null;
            try {
                const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, responseText];
                const cleanJson = jsonMatch[1].trim().replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
                const parsed = JSON.parse(cleanJson);
                if (parsed.quiz_data) {
                    quizPayload = parsed;
                }
            } catch (e) {
                // Not JSON, continue as normal chat
            }

            if (quizPayload && onQuizGenerated) {
                toast.success('Topic completed! Generating Assessment...');
                onQuizGenerated(quizPayload);
                setLoading(false);
                return; // Stop processing, we are moving to the Quiz UI
            }

            const assistantMsg = { role: 'assistant', message: responseText, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, assistantMsg]);

            // Save assistant message
            await databases.createDocument(DATABASE_ID, TABLES.CHAT_HISTORY, ID.unique(), {
                userId,
                role: 'assistant',
                message: responseText,
                timestamp: new Date().toISOString()
            });

            // Mission Requirement: Auto-TTS
            speak(responseText);

        } catch (error) {
            console.error('Chat error:', error);
            
            // Render a simple offline message
            toast.error("AI is offline");
            setAiConnectionStatus('error');
            
            setMessages(prev => prev.filter(m => m !== userMsg)); // Remove failed message
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card flex flex-col h-[650px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                         <Bot className="text-purple-400" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{subject || 'PulseAI Tutor'}</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                                {educationLevel?.replace('_', ' ') || 'GENERAL'}
                            </p>
                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-black">
                                {paceScore < 0.8 ? 'Analogy Mode' : paceScore > 1.2 ? 'Deep Dive' : 'Standard'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSpeaking(!isSpeaking)}
                        className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}
                        title="Toggle Auto-TTS"
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
                            <div className={`max-w-[85%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                    disabled={loading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
