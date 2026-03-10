import { useState, useEffect } from 'react';
import { databases, TABLES, DATABASE_ID } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { toast } from 'sonner';

export const useAdaptivePace = (userId) => {
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        pace_score: 1.0,
        badges: [],
        full_name: '',
        education_level: ''
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
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
                    full_name: doc.full_name || '',
                    education_level: doc.education_level || '',
                    $id: doc.$id // Store the Appwrite document ID
                });
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
            // toast.error('Failed to connect to Pulse servers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [userId]);

    const updatePace = async (quizScore) => {
        if (!stats.$id) return;

        let paceAdjustment = 0;
        if (quizScore > 80) paceAdjustment = 0.1;
        else if (quizScore < 50) paceAdjustment = -0.1;

        if (paceAdjustment === 0) return;

        const newPace = Math.round(Math.max(0.1, Math.min(2.0, stats.pace_score + paceAdjustment)) * 10) / 10;
        
        try {
            await databases.updateDocument(
                DATABASE_ID,
                TABLES.USER_STATS,
                stats.$id,
                { pace_score: newPace }
            );
            setStats(prev => ({ ...prev, pace_score: newPace }));
            toast.success(`Pace adjusted: ${newPace}`);
        } catch (error) {
            console.error('Error updating pace:', error);
            toast.error('Could not sync pace to cloud.');
        }
    };

    const addXP = async (amount) => {
        if (!stats.$id) return false;

        const newXP = stats.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        
        // Badge logic
        let newBadges = [...stats.badges];
        if (newXP >= 100 && !newBadges.includes('Novice')) newBadges.push('Novice');
        if (newXP >= 500 && !newBadges.includes('Expert')) newBadges.push('Expert');
        if (newXP >= 1000 && !newBadges.includes('Master')) newBadges.push('Master');

        try {
            await databases.updateDocument(
                DATABASE_ID,
                TABLES.USER_STATS,
                stats.$id,
                { 
                    xp: newXP, 
                    level: newLevel,
                    badges: JSON.stringify(newBadges)
                }
            );
            setStats(prev => ({ ...prev, xp: newXP, level: newLevel, badges: newBadges }));
            toast.info(`Got ${amount} XP!`);
            return true;
        } catch (error) {
            console.error('Error adding XP:', error);
            toast.error('Progress sync failed.');
            return false;
        }
    };

    const updateProfile = async (data) => {
        try {
            let currentId = stats.$id;
            if (currentId) {
                await databases.updateDocument(
                    DATABASE_ID,
                    TABLES.USER_STATS,
                    currentId,
                    data
                );
            } else {
                // Fallback: Create document if it doesn't exist
                const newDoc = await databases.createDocument(
                    DATABASE_ID,
                    TABLES.USER_STATS,
                    ID.unique(),
                    {
                        userId,
                        xp: 0,
                        level: 1,
                        pace_score: 1.0,
                        ...data
                    }
                );
                currentId = newDoc.$id;
            }
            setStats(prev => ({ ...prev, ...data, $id: currentId }));
            toast.success('Profile updated!');
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(`Failed to save profile: ${error.message}`);
            return false;
        }
    };

    return {
        stats,
        loading,
        updatePace,
        addXP,
        updateProfile,
        refresh: fetchStats
    };
};
