import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Award, Zap, Leaf, BookOpen } from 'lucide-react';

export default function Quiz({ quizData, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    // Support both the AI-Generated format and the legacy sample format
    const questions = quizData?.quiz_data?.map(q => ({
        text: q.question,
        options: q.options,
        correctIndex: q.correct
    })) || quizData?.questions || [];
    
    const currentQuestion = questions[currentStep];

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        
        if (index === currentQuestion.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedOption(null);
        } else {
            const lastCorrect = selectedOption === currentQuestion.correctIndex ? 1 : 0;
            const fs = Math.round(((score + lastCorrect) / questions.length) * 100);
            setFinalScore(fs);
            setIsFinished(true);
            onComplete(fs);
        }
    };

    if (isFinished) {
        const isFastLearner = finalScore > 80;
        const isSteadyLearner = finalScore < 60;
        const isPerfect = finalScore === 100;

        const paceLabel = isPerfect
            ? { icon: <Award className="text-yellow-400" size={28} />, label: 'Perfect Scholar', desc: '100% correct! You have mastered this topic!', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
            : isFastLearner
            ? { icon: <Zap className="text-green-400" size={28} />, label: 'Fast Learner ⚡', desc: 'Excellent work! You can tackle advanced topics next.', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
            : isSteadyLearner
            ? { icon: <Leaf className="text-blue-400" size={28} />, label: 'Steady Learner 🌿', desc: 'Good effort! Revisiting the fundamentals will help you grow.', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' }
            : { icon: <BookOpen className="text-purple-400" size={28} />, label: 'Balanced Learner 📖', desc: `You scored ${finalScore}%. Keep up the consistent pace!`, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' };
        
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card text-center py-12 max-w-xl mx-auto"
            >
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
                <p className="text-5xl font-black text-purple-400 mb-6">{finalScore}%</p>

                {/* Learner Type Badge */}
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border mb-6 ${paceLabel.bg}`}>
                    {paceLabel.icon}
                    <div className="text-left">
                        <p className={`font-black text-lg ${paceLabel.color}`}>{paceLabel.label}</p>
                        <p className="text-xs text-gray-400">{paceLabel.desc}</p>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-8">Your pace multiplier and XP have been updated. Check your dashboard!</p>
                <button 
                    onClick={() => { setIsFinished(false); }}
                    className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                    Back to Dashboard
                </button>
            </motion.div>
        );
    }

    return (
        <div className="glass-card max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <span className="text-sm text-gray-400 font-mono">Question {currentStep + 1} of {questions.length}</span>
                <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold leading-tight">{currentQuestion?.text}</h2>
                    
                    <div className="space-y-3">
                        {currentQuestion?.options.map((option, index) => {
                            const isCorrect = index === currentQuestion.correctIndex;
                            const isSelected = selectedOption === index;
                            
                            let statusClass = "border-white/10 hover:border-purple-500/50 hover:bg-white/5";
                            if (selectedOption !== null) {
                                if (isCorrect) statusClass = "border-green-500/50 bg-green-500/10 text-green-400";
                                else if (isSelected) statusClass = "border-red-500/50 bg-red-500/10 text-red-400";
                                else statusClass = "opacity-50 border-white/5";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={selectedOption !== null}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${statusClass}`}
                                >
                                    <span>{option}</span>
                                    {selectedOption !== null && isCorrect && <CheckCircle2 size={20} />}
                                    {selectedOption !== null && isSelected && !isCorrect && <XCircle size={20} />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-6 py-2 rounded-xl transition-all"
                >
                    {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
