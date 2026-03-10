import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Book, Leaf, BarChart3, Bell, Award, TrendingUp } from 'lucide-react';
import Leaderboard from './Leaderboard';

export default function Dashboard({ stats, progress, onStartQuiz }) {
    const paceConfig = {
        '🌿': { color: 'text-green-400', label: 'Steady Pace', bg: 'bg-green-400/10' },
        '📖': { color: 'text-blue-400', label: 'Balanced Pace', bg: 'bg-blue-400/10' },
        '⚡': { color: 'text-yellow-400', label: 'Rapid Pace', bg: 'bg-yellow-400/10' }
    };

    const currentPace = stats.pace_score < 0.8 ? '🌿' : stats.pace_score > 1.2 ? '⚡' : '📖';
    const config = paceConfig[currentPace];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Welcome back, Learner.
                    </h1>
                    <p className="text-gray-400 mt-2">Your AI tutor is ready for the next session.</p>
                </div>
                <div className="flex gap-4">
                    <button className="glass p-3 rounded-xl hover:bg-white/10 transition-colors">
                        <Bell size={20} />
                    </button>
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                            {stats.level}
                        </div>
                        <span className="font-bold">Lvl {stats.level}</span>
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
                        <span className="text-xs font-bold text-gray-500">XP Progress</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-black">{stats.xp}</h3>
                        <p className="text-sm text-gray-400">Total Experience Points</p>
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

                {/* Progress Overview */}
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card md:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Target size={18} className="text-purple-400" />
                            Curriculum
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {progress.map((topic) => (
                            <div key={topic.topic_id} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">{topic.topic_name}</span>
                                    <span className="text-purple-400 font-mono">{topic.avg_score}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${topic.avg_score}%` }}
                                        className="h-full bg-purple-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <Leaderboard />

                {/* Quick Action */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="glass-card bg-purple-600 hover:bg-purple-500 cursor-pointer group flex flex-col justify-between"
                    onClick={onStartQuiz}
                >
                    <Zap className="group-hover:fill-current transition-all text-white" />
                    <div>
                        <h3 className="text-xl font-bold text-white">Start Challenge</h3>
                        <p className="text-purple-200 text-sm">Boost your pace score now</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
