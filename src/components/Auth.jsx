import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../lib/appwrite';
import { toast } from 'sonner';

export default function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await authService.login(formData.email, formData.password);
                toast.success('Welcome back!');
            } else {
                await authService.signup(formData.email, formData.password, formData.name);
                toast.success('Account created! Welcome to Pulse Learn.');
            }
            const user = await authService.getCurrentUser();
            onAuthSuccess(user);
        } catch (error) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-8 rounded-[2rem] border-white/5 shadow-2xl backdrop-blur-3xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 animate-float">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                            {isLogin ? 'Pulse Learn' : 'Join the Pulse'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isLogin ? 'Enter your credentials to continue' : 'Start your adaptive learning journey'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="relative flex items-center h-[52px]"
                                >
                                    <div className="absolute left-4 text-gray-400 pointer-events-none">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative flex items-center h-[52px]">
                            <div className="absolute left-4 text-gray-400 pointer-events-none">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-500"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="relative flex items-center h-[52px]">
                            <div className="absolute left-4 text-gray-400 pointer-events-none">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-500"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-[52px] rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
