import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Award } from 'lucide-react';

export default function Quiz({ quizData, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const questions = quizData?.questions || [];
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
            setIsFinished(true);
            const finalScore = ((score + (selectedOption === currentQuestion.correctIndex ? 1 : 0)) / questions.length) * 100;
            onComplete(finalScore);
        }
    };

    if (isFinished) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card text-center py-12"
            >
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                <p className="text-4xl font-black text-purple-400 mb-6">{Math.round((score / questions.length) * 100)}%</p>
                <p className="text-gray-400 mb-8">You've earned {score * 10} XP</p>
                <button 
                    onClick={() => window.location.reload()}
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
