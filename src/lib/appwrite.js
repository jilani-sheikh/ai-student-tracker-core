import { Client, Databases, Account } from 'appwrite';

const client = new Client();

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

// Table IDs from environment variables
export const TABLES = {
    USER_STATS: import.meta.env.VITE_APPWRITE_STATS_COLLECTION_ID,
    LEARNING_PROGRESS: import.meta.env.VITE_APPWRITE_PROGRESS_COLLECTION_ID,
    QUIZZES: import.meta.env.VITE_APPWRITE_QUIZ_COLLECTION_ID,
    CHAT_HISTORY: import.meta.env.VITE_APPWRITE_CHAT_COLLECTION_ID
};

export default client;
