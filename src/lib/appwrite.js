import { Client, Databases, Account, ID } from 'appwrite';

const client = new Client();

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

// Auth Functions
export const authService = {
    async signup(email, password, name) {
        try {
            // 1. Create Account
            const user = await account.create(ID.unique(), email, password, name);
            
            // 2. Immediate Login (Required to have session for DB write)
            await this.login(email, password);
            
            // 3. Create initial user stats
            await databases.createDocument(
                DATABASE_ID,
                import.meta.env.VITE_APPWRITE_STATS_COLLECTION_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    xp: 0,
                    level: 1,
                    pace_score: 1.0,
                    badges: '[]'
                }
            );
            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    async login(email, password) {
        return await account.createEmailPasswordSession(email, password);
    },

    async logout() {
        return await account.deleteSession('current');
    },

    async getCurrentUser() {
        try {
            return await account.get();
        } catch {
            return null;
        }
    }
};

// Table IDs from environment variables
export const TABLES = {
    USER_STATS: import.meta.env.VITE_APPWRITE_STATS_COLLECTION_ID,
    LEARNING_PROGRESS: import.meta.env.VITE_APPWRITE_PROGRESS_COLLECTION_ID,
    QUIZZES: import.meta.env.VITE_APPWRITE_QUIZ_COLLECTION_ID,
    CHAT_HISTORY: import.meta.env.VITE_APPWRITE_CHAT_COLLECTION_ID
};

export default client;
