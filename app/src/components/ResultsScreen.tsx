import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import type { Question, UserAnswer } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ResultsScreenProps {
  questions: Question[];
  mode: string;
  onRestart: () => void;
}

export function ResultsScreen({ questions, mode: _mode, onRestart }: ResultsScreenProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

  // Get answers from localStorage (saved during quiz)
  const answers = useMemo(() => {
    const saved = localStorage.getItem('quizAnswers');
    if (saved) {
      return JSON.parse(saved) as Record<number, UserAnswer>;
    }
    return {};
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const answered = Object.keys(answers).length;
    const correct = Object.values(answers).filter(a => a.isCorrect).length;
    const incorrect = answered - correct;
    const unanswered = total - answered;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      answered,
      correct,
      incorrect,
      unanswered,
      percentage
    };
  }, [questions, answers]);

  // Get performance message
  const getPerformanceMessage = () => {
    if (stats.percentage >= 90) return { text: 'Excellent!', color: 'text-green-600', bg: 'bg-green-100' };
    if (stats.percentage >= 75) return { text: 'Great Job!', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (stats.percentage >= 60) return { text: 'Good Effort!', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (stats.percentage >= 40) return { text: 'Keep Practicing!', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { text: 'Need More Practice', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performance = getPerformanceMessage();

  // Toggle question expansion
  const toggleExpand = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Filter questions for review
  const reviewQuestions = useMemo(() => {
    if (showOnlyIncorrect) {
      return questions.filter(q => {
        const answer = answers[q.id];
        return answer && !answer.isCorrect;
      });
    }
    return questions;
  }, [questions, answers, showOnlyIncorrect]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz Complete!
        </h1>
        <p className="text-gray-600">
          Here's how you performed
        </p>
      </div>

      {/* Score Card */}
      <Card className="shadow-xl border-0 mb-6 overflow-hidden">
        <div className={`p-6 ${performance.bg}`}>
          <div className="text-center">
            <p className={`text-lg font-semibold ${performance.color} mb-2`}>
              {performance.text}
            </p>
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {stats.percentage}%
            </div>
            <p className="text-gray-600">
              {stats.correct} correct out of {stats.total} questions
            </p>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
              <div className="text-sm text-green-600">Correct</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{stats.incorrect}</div>
              <div className="text-sm text-red-600">Incorrect</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Target className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">{stats.answered}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">{stats.unanswered}</div>
              <div className="text-sm text-amber-600">Unanswered</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Accuracy</span>
              <span className="font-semibold text-gray-900">{stats.percentage}%</span>
            </div>
            <Progress value={stats.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Review Section */}
      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Review Answers</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
                className={showOnlyIncorrect ? "bg-red-50 text-red-700 border-red-200" : ""}
              >
                {showOnlyIncorrect ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Show All
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Show Incorrect Only
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {reviewQuestions.map((question, index) => {
              const answer = answers[question.id];
              const isCorrect = answer?.isCorrect;
              const isExpanded = expandedQuestions.has(question.id);
              
              return (
                <Collapsible
                  key={question.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(question.id)}
                >
                  <div className={`border rounded-xl overflow-hidden ${
                    isCorrect === true 
                      ? 'border-green-200 bg-green-50/30' 
                      : isCorrect === false 
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-gray-200 bg-gray-50/30'
                  }`}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isCorrect === true && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                          {isCorrect === false && (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          {answer === undefined && (
                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900 line-clamp-2">
                            Q{index + 1}. {question.question}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isCorrect ? "default" : "destructive"} className={
                            isCorrect 
                              ? "bg-green-100 text-green-700 hover:bg-green-100" 
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }>
                            {answer?.selectedOption || '-'}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-8 space-y-2">
                          {(['A', 'B', 'C', 'D'] as const).map((option) => {
                            const isSelected = answer?.selectedOption === option;
                            const isCorrectOption = question.correctAnswer === option;
                            
                            return (
                              <div
                                key={option}
                                className={`p-3 rounded-lg flex items-center gap-2 ${
                                  isCorrectOption
                                    ? 'bg-green-100 text-green-800'
                                    : isSelected && !isCorrectOption
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <span className="font-semibold">{option})</span>
                                <span className="flex-1">{question.options[option]}</span>
                                {isCorrectOption && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                                {isSelected && !isCorrectOption && (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-3 pl-8 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm text-emerald-800">
                            <span className="font-semibold">Correct Answer: {question.correctAnswer}</span>
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
          
          {reviewQuestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No incorrect answers! Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restart Button */}
      <Button
        onClick={onRestart}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Take Another Quiz
      </Button>
    </div>
  );
}
