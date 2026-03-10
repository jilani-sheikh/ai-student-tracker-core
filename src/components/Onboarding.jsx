import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        full_name: '',
        education_level: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const handleNext = () => setStep(step + 1);
    
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        console.log("Submitting to Appwrite:", data);
        try {
            const success = await onComplete(data);
            if (success) {
                // Reactive redirect to break modal UI hold IMMEDIATELY
                window.location.href = '/'; 
            } else {
                toast.error("Failed to update profile. Check connection.");
                setSubmitting(false); // Only unset if failed to allow retry
            }
        } catch (error) {
            console.error("Onboarding submission failed:", error);
            toast.error("An error occurred during onboarding.");
            setSubmitting(false);
        }
    };
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] p-6">
            {/* Morphing background blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] animate-pulse rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] animate-pulse rounded-full" />
            </div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full relative z-10 glass-card p-12 rounded-[2.5rem] border-white/5 shadow-2xl backdrop-blur-3xl"
            >
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6 animate-float">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-3">
                        {step === 1 ? "Who's learning?" : "What's the path?"}
                    </h2>
                    <p className="text-gray-400 font-medium">
                        {step === 1 ? "Tell us your name to personalize the experience." : "Choose your level to unlock the curriculum."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="relative flex items-center">
                                <User className="absolute left-4 text-gray-400" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Your Full Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-500 font-bold"
                                    value={data.full_name}
                                    onChange={(e) => setData({...data, full_name: e.target.value})}
                                />
                            </div>
                            <button 
                                disabled={!data.full_name}
                                onClick={handleNext}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-[60px] rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                Continue
                                <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-4"
                        >
                            {[
                                { id: 'college', label: 'College Student', desc: 'Java, Python, Frontend Dev' },
                                { id: 'higher_grade', label: 'Higher Grade', desc: 'Physics, Chemistry, Math' }
                            ].map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => setData({...data, education_level: level.id})}
                                    className={`w-full p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                                        data.education_level === level.id 
                                        ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${data.education_level === level.id ? 'bg-purple-600' : 'bg-white/5'}`}>
                                        <GraduationCap size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{level.label}</h4>
                                        <p className="text-xs text-gray-500">{level.desc}</p>
                                    </div>
                                </button>
                            ))}
                            <button 
                                disabled={!data.education_level || submitting}
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 h-[60px] rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
                            >
                                {submitting ? "Processing..." : "Enter Pulse Learn"}
                                {!submitting && <Sparkles size={20} />}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
