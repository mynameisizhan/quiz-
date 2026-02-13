import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  Flag,
  Eye,
  EyeOff,
  AlertCircle,
  SkipForward
} from 'lucide-react';
import type { Question, QuizMode, UserAnswer } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface QuizScreenProps {
  questions: Question[];
  mode: QuizMode;
  onFinish: () => void;
}

export function QuizScreen({ questions, mode, onFinish }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Skip current question (move to next without answering)
  const handleSkip = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  // Toggle flag for current question
  const toggleFlag = useCallback(() => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  }, [currentQuestion.id]);

  // Check if all questions are answered
  const allAnswered = answeredCount === totalQuestions;

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
    }
  }, [answers]);

  // Also save when component unmounts
  useEffect(() => {
    return () => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem('quizAnswers', JSON.stringify(answers));
      }
    };
  }, [answers]);

  // Clear timer when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer, currentIndex]);

  // Handle answer selection - auto advance to next question
  const handleAnswer = useCallback((option: 'A' | 'B' | 'C' | 'D') => {
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOption: option,
        isCorrect,
        timestamp: Date.now()
      }
    }));

    // Auto-advance to next question after delay
    // In practice mode, wait longer to show feedback; in exam mode, advance quickly
    const delay = mode === 'practice' ? 1500 : 500;
    
    const timer = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, delay);
    
    setAutoAdvanceTimer(timer);
  }, [currentQuestion, currentIndex, totalQuestions, mode]);

  // Handle finish click
  const handleFinishClick = useCallback(() => {
    // Clear any pending timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    // Save answers before finishing
    localStorage.setItem('quizAnswers', JSON.stringify(answers));
    if (!allAnswered) {
      setShowConfirmDialog(true);
    } else {
      onFinish();
    }
  }, [allAnswered, onFinish, answers, autoAdvanceTimer]);

  // Get current answer
  const currentAnswer = answers[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined;
  const isFlagged = flaggedQuestions.has(currentQuestion.id);

  // Get option style based on state
  const getOptionStyle = (option: 'A' | 'B' | 'C' | 'D') => {
    const baseStyle = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-start gap-3";
    
    if (mode === 'practice' && isAnswered) {
      // Practice mode - show correct/incorrect immediately
      if (option === currentQuestion.correctAnswer) {
        return `${baseStyle} border-green-500 bg-green-50 text-green-900`;
      }
      if (currentAnswer.selectedOption === option && option !== currentQuestion.correctAnswer) {
        return `${baseStyle} border-red-500 bg-red-50 text-red-900`;
      }
      return `${baseStyle} border-gray-200 bg-gray-50 text-gray-400`;
    }
    
    // Exam mode or unanswered in practice
    if (isAnswered && currentAnswer.selectedOption === option) {
      return `${baseStyle} border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600 ring-offset-2`;
    }
    
    return `${baseStyle} border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 bg-white text-gray-700`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Stats */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <span className="font-bold text-emerald-600">{currentIndex + 1}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-gray-600">{totalQuestions}</span>
          </Badge>
          
          {mode === 'exam' && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              <EyeOff className="w-3 h-3 mr-1" />
              Exam Mode
            </Badge>
          )}
          
          {mode === 'practice' && (
            <Badge variant="outline" className="text-sm px-3 py-1 bg-emerald-50">
              <Eye className="w-3 h-3 mr-1" />
              Practice Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {flaggedCount > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Flag className="w-3 h-3 mr-1" />
              {flaggedCount} Flagged
            </Badge>
          )}
          <Badge variant="outline" className={answeredCount === totalQuestions ? "text-green-600 border-green-300" : ""}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {answeredCount}/{totalQuestions} Answered
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="shadow-lg border-0 mb-6">
        <CardContent className="p-6">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed pr-4">
              Q{currentIndex + 1}. {currentQuestion.question}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFlag}
              className={isFlagged ? "text-amber-500 hover:text-amber-600" : "text-gray-400 hover:text-amber-500"}
            >
              <Flag className={`w-5 h-5 ${isFlagged ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={mode === 'practice' && isAnswered}
                className={getOptionStyle(option)}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
                  {option}
                </span>
                <span className="flex-1">{currentQuestion.options[option]}</span>
                
                {mode === 'practice' && isAnswered && (
                  <>
                    {option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {currentAnswer.selectedOption === option && option !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Practice Mode - Show Correct Answer */}
          {mode === 'practice' && isAnswered && (
            <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                <CheckCircle2 className="w-5 h-5" />
                Correct Answer: {currentQuestion.correctAnswer}
              </div>
              <p className="text-green-700 text-sm">
                {currentAnswer.isCorrect 
                  ? "Correct! Well done!" 
                  : `You selected ${currentAnswer.selectedOption}. The correct answer is ${currentQuestion.correctAnswer}.`
                }
              </p>
              <p className="text-green-600 text-xs mt-2">
                Moving to next question automatically...
              </p>
            </div>
          )}

          {/* Exam Mode - Auto advance indicator */}
          {mode === 'exam' && isAnswered && (
            <div className="mt-4 text-center text-sm text-emerald-600">
              Moving to next question...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Question Navigator Dots */}
        <div className="hidden sm:flex items-center gap-1">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isFlagged = flaggedQuestions.has(q.id);
            const isCurrent = idx === currentIndex;
            
            return (
              <button
                key={q.id}
                onClick={() => {
                  if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
                  setCurrentIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isCurrent 
                    ? "bg-emerald-600 w-6" 
                    : isAnswered 
                      ? "bg-emerald-400" 
                      : isFlagged 
                        ? "bg-amber-400"
                        : "bg-gray-300 hover:bg-gray-400"
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Skip Button (only show if not on last question) */}
        {currentIndex < totalQuestions - 1 ? (
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            Skip
            <SkipForward className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinishClick}
            className={`flex items-center gap-2 ${
              allAnswered 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {allAnswered ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finish
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Finish Anyway
              </>
            )}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Finish Quiz?
            </DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {totalQuestions - answeredCount > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  {totalQuestions - answeredCount} question(s) remain unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Continue Quiz
            </Button>
            <Button onClick={onFinish} className="bg-amber-600 hover:bg-amber-700">
              Finish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
