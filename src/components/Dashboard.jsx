import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Book, Leaf, BarChart3, Bell, Award, TrendingUp, ChevronRight } from 'lucide-react';
import Leaderboard from './Leaderboard';

const SUBJECTS = {
    college: [
        { name: 'Java', icon: '☕', desc: 'Enterprise Grade Apps' },
        { name: 'Python', icon: '🐍', desc: 'Data Science & AI' },
        { name: 'C++', icon: '⚙️', desc: 'System Performance' },
        { name: 'Frontend Dev', icon: '🎨', desc: 'Modern Web Design' }
    ],
    higher_grade: [
        { name: 'Physics', icon: '⚛️', desc: 'Laws of Nature' },
        { name: 'Chemistry', icon: '🧪', desc: 'Matter & Reactions' },
        { name: 'Math', icon: '📐', desc: 'Logic & Calculus' },
        { name: 'Biology', icon: '🧬', desc: 'Life Sciences' }
    ]
};

export default function Dashboard({ stats, progress, onStartQuiz }) {
    const paceConfig = {
        '🌿': { color: 'text-green-400', label: 'Steady Pace', bg: 'bg-green-400/10' },
        '📖': { color: 'text-blue-400', label: 'Balanced Pace', bg: 'bg-blue-400/10' },
        '⚡': { color: 'text-yellow-400', label: 'Rapid Pace', bg: 'bg-yellow-400/10' }
    };

    const currentPace = stats.pace_score < 0.8 ? '🌿' : stats.pace_score > 1.2 ? '⚡' : '📖';
    const config = paceConfig[currentPace];
    const currentSubjects = SUBJECTS[stats.education_level] || SUBJECTS.college;

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{stats.full_name || 'Learner'}</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Your learning pulse is healthy. You've earned {stats.xp} XP total!</p>
                </div>
                <div className="flex gap-4">
                    <button className="glass p-4 rounded-2xl hover:bg-white/5 transition-all relative">
                        <Bell size={24} className="text-gray-400" />
                        <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
                    </button>
                    <div className="glass flex items-center gap-4 px-6 py-4 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
                            {stats.full_name ? stats.full_name[0] : stats.level}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold leading-none mb-1">{stats.full_name || `Lvl ${stats.level} Learner`}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{stats.education_level?.replace('_', ' ') || 'PRO STUDENT'}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bento-grid">
                {/* Pace Status */}
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="glass-card md:col-span-2 flex items-center justify-between overflow-hidden relative"
                >
                    <div className="space-y-2 z-10">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Pace</span>
                        <h3 className={`text-4xl font-black ${config.color}`}>{config.label}</h3>
                        <p className="text-sm text-gray-400">Adaptive Multiplier: {stats.pace_score.toFixed(1)}x</p>
                    </div>
                    <div className={`w-32 h-32 rounded-full absolute -right-6 -bottom-6 ${config.bg} blur-3xl opacity-50`} />
                    <div className={`w-20 h-20 rounded-3xl ${config.bg} flex items-center justify-center text-5xl animate-float z-10`}>
                        {currentPace}
                    </div>
                </motion.div>

                {/* XP Stats */}
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <Trophy className="text-yellow-500" />
                        <span className="text-xs font-bold text-gray-500">XP Total</span>
                    </div>
                    <div className="mt-4 text-left">
                        <h3 className="text-3xl font-black">{stats.xp}</h3>
                        <p className="text-sm text-gray-400">Experience Points</p>
                    </div>
                </motion.div>

                {/* Badges */}
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex flex-col gap-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm text-gray-400">
                        <Award size={16} /> ACHIEVEMENTS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.badges.map(badge => (
                            <span key={badge} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                                {badge}
                            </span>
                        ))}
                        {stats.badges.length === 0 && <span className="text-xs text-gray-600 italic">No badges earned yet.</span>}
                    </div>
                </motion.div>

                <Leaderboard />
            </div>

            {/* Curriculum Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <Book className="text-purple-500" />
                        Learning Curriculum
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentSubjects.map((subject, idx) => (
                        <motion.div 
                            key={subject.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card hover:border-purple-500/30 transition-all p-8 relative group overflow-hidden cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl translate-x-4 -translate-y-4">
                                {subject.icon}
                            </div>
                            <div className="text-4xl mb-6">{subject.icon}</div>
                            <h3 className="text-2xl font-black mb-2">{subject.name}</h3>
                            <p className="text-sm text-gray-500 mb-8 font-medium">{subject.desc}</p>
                            <button 
                                onClick={() => onStartQuiz(subject.name)}
                                className="w-full bg-white/5 hover:bg-purple-600 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 group-hover:text-white"
                            >
                                Start Module
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
