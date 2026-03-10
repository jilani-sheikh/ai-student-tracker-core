import { useState, useEffect } from 'react';
import { databases, TABLES, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TABLES.USER_STATS,
                    [
                        Query.orderDesc('xp'),
                        Query.limit(5)
                    ]
                );
                setLeaders(response.documents);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                if (error.code === 401) {
                    setLeaders([]); // Clear if unauthorized
                    // Optional: set a specific 'login required' state if you want to show a message
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    return (
        <div className="glass-card">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-yellow-500">
                <Crown size={20} />
                Global Leaderboard
            </h3>
            <div className="space-y-4">
                {leaders.map((user, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={user.$id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-mono w-4">{index + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                                {(user.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm">{user.full_name || `User ${user.userId.substring(0, 5)}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-400">{user.xp} XP</span>
                             {index === 0 && <Medal size={16} className="text-yellow-400" />}
                        </div>
                    </motion.div>
                ))}
                {loading && <div className="animate-pulse flex space-y-4 flex-col">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl" />)}
                </div>}
            </div>
        </div>
    );
}
