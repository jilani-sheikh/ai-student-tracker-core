import { useState, useEffect } from 'react';
import { databases, TABLES, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

export const useAdaptivePace = (userId) => {
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        pace_score: 1.0,
        badges: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchStats = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TABLES.USER_STATS,
                    [Query.equal('userId', userId)]
                );
                
                if (response.documents.length > 0) {
                    const doc = response.documents[0];
                    setStats({
                        xp: doc.xp,
                        level: doc.level,
                        pace_score: doc.pace_score,
                        badges: JSON.parse(doc.badges || '[]'),
                        $id: doc.$id
                    });
                }
            } catch (error) {
                console.error('Error fetching user stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    const updatePace = async (quizScore) => {
        let paceAdjustment = 0;
        if (quizScore > 80) paceAdjustment = 0.1;
        else if (quizScore < 50) paceAdjustment = -0.1;

        if (paceAdjustment === 0) return;

        const newPace = Math.max(0.1, Math.min(2.0, stats.pace_score + paceAdjustment));
        
        try {
            await databases.updateDocument(
                DATABASE_ID,
                TABLES.USER_STATS,
                stats.$id,
                { pace_score: newPace }
            );
            setStats(prev => ({ ...prev, pace_score: newPace }));
        } catch (error) {
            console.error('Error updating pace:', error);
        }
    };

    const addXP = async (amount) => {
        const newXP = stats.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;

        try {
            await databases.updateDocument(
                DATABASE_ID,
                TABLES.USER_STATS,
                stats.$id,
                { xp: newXP, level: newLevel }
            );
            setStats(prev => ({ ...prev, xp: newXP, level: newLevel }));
            return true;
        } catch (error) {
            console.error('Error adding XP:', error);
            return false;
        }
    };

    const getPaceIcon = () => {
        if (stats.pace_score < 0.8) return '🌿';
        if (stats.pace_score > 1.2) return '⚡';
        return '📖';
    };

    const getPaceLabel = () => {
        if (stats.pace_score < 0.8) return 'Steady';
        if (stats.pace_score > 1.2) return 'Rapid';
        return 'Balanced';
    };

    return {
        stats,
        loading,
        updatePace,
        addXP,
        getPaceIcon,
        getPaceLabel
    };
};
