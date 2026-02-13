import { useState, useEffect, useCallback } from 'react';
import { QuizSetup } from './components/QuizSetup';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import type { QuizState, Question, QuizConfig } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Load questions from JSON
  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then((data: Question[]) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load questions:', err);
        setLoading(false);
      });
  }, []);

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start quiz with configuration
  const startQuiz = useCallback((config: QuizConfig) => {
    setQuizConfig(config);
    
    // Filter questions by range
    const startIndex = Math.max(0, config.startQuestion - 1);
    const endIndex = Math.min(questions.length, config.endQuestion);
    let filtered = questions.slice(startIndex, endIndex);
    
    // Shuffle if requested
    if (config.shuffle) {
      filtered = shuffleArray(filtered);
    }
    
    setSelectedQuestions(filtered);
    setQuizState('quiz');
  }, [questions]);

  // Finish quiz and show results
  const finishQuiz = useCallback(() => {
    setQuizState('results');
  }, []);

  // Restart quiz
  const restartQuiz = useCallback(() => {
    setQuizState('setup');
    setQuizConfig(null);
    setSelectedQuestions([]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-emerald-800 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {quizState === 'setup' && (
          <QuizSetup 
            totalQuestions={questions.length} 
            onStart={startQuiz} 
          />
        )}
        
        {quizState === 'quiz' && quizConfig && (
          <QuizScreen
            questions={selectedQuestions}
            mode={quizConfig.mode}
            onFinish={finishQuiz}
          />
        )}
        
        {quizState === 'results' && quizConfig && (
          <ResultsScreen
            questions={selectedQuestions}
            onRestart={restartQuiz}
            mode={quizConfig.mode}
          />
        )}
      </div>
    </div>
  );
}

export default App;
