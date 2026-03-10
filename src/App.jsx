import { useState, useEffect } from 'react';
import { useAdaptivePace } from './hooks/useAdaptivePace';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import Quiz from './components/Quiz';
import Auth from './components/Auth';
import { authService } from './lib/appwrite';
import { Sparkles, LayoutDashboard, MessageSquare, GraduationCap, LogOut, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [xpToasts, setXpToasts] = useState([]);
  const { stats, loading, updatePace, addXP } = useAdaptivePace(user?.$id);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleQuizComplete = async (score) => {
    await updatePace(score);
    const xpGained = Math.round(score * 2);
    await addXP(xpGained);
    
    const id = Date.now();
    setXpToasts(prev => [...prev, { id, amount: xpGained }]);
    setTimeout(() => {
      setXpToasts(prev => prev.filter(t => t.id !== id));
      setIsQuizActive(false);
      setActiveTab('dashboard');
    }, 3000);
  };

  if (checkingSession) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  // Mock progress data
  const progressData = [
    { topic_id: '1', topic_name: 'Quantum Mechanics', avg_score: 75 },
    { topic_id: '2', topic_name: 'Neural Networks', avg_score: 92 },
    { topic_id: '3', topic_name: 'Organic Chemistry', avg_score: 45 }
  ];

  // Mock quiz data
  const sampleQuiz = {
    questions: [
      {
        text: "What is the primary function of a Transformer's self-attention mechanism?",
        options: [
          "To weight the importance of different words in a sequence",
          "To compress data for faster training",
          "To replace recurrent neural networks entirely",
          "To visualize the hidden layers"
        ],
        correctIndex: 0
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 glass border-r border-white/5 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="hidden md:block font-black text-2xl tracking-tighter italic">PULSE</span>
        </div>

        <div className="flex-1 px-4 py-8 space-y-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'chat', icon: MessageSquare, label: 'Learning Lab' },
            { id: 'progress', icon: GraduationCap, label: 'Curriculum' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsQuizActive(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon size={22} />
              <span className="hidden md:block font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold"
          >
            <LogOut size={22} />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-4 md:p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isQuizActive ? (
              <Quiz key="quiz" quizData={sampleQuiz} onComplete={handleQuizComplete} />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    stats={stats} 
                    progress={progressData} 
                    onStartQuiz={() => setIsQuizActive(true)} 
                  />
                )}
                {activeTab === 'chat' && (
                  <AIChat userId={user.$id} paceScore={stats.pace_score} />
                )}
                {activeTab === 'progress' && (
                  <div className="glass-card py-20 text-center rounded-[2rem]">
                    <GraduationCap className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-500">Curriculum features coming soon</h2>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Gamification Overlays */}
      <AnimatePresence>
        {xpToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-[100]"
          >
            <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-black shadow-2xl flex items-center gap-2">
              <Trophy size={18} />
              XP +{toast.amount}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
