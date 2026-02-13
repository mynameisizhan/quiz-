import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BookOpen, Shuffle, GraduationCap, ClipboardCheck, AlertCircle } from 'lucide-react';
import type { QuizConfig, QuizMode } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizSetupProps {
  totalQuestions: number;
  onStart: (config: QuizConfig) => void;
}

export function QuizSetup({ totalQuestions, onStart }: QuizSetupProps) {
  const [mode, setMode] = useState<QuizMode>('practice');
  const [shuffle, setShuffle] = useState(false);
  const [startQuestion, setStartQuestion] = useState(1);
  const [endQuestion, setEndQuestion] = useState(Math.min(50, totalQuestions));
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    // Validation
    if (startQuestion < 1 || startQuestion > totalQuestions) {
      setError(`Start question must be between 1 and ${totalQuestions}`);
      return;
    }
    if (endQuestion < 1 || endQuestion > totalQuestions) {
      setError(`End question must be between 1 and ${totalQuestions}`);
      return;
    }
    if (startQuestion > endQuestion) {
      setError('Start question must be less than or equal to end question');
      return;
    }
    if (endQuestion - startQuestion + 1 < 5) {
      setError('Please select at least 5 questions');
      return;
    }

    setError(null);
    onStart({
      mode,
      shuffle,
      startQuestion,
      endQuestion
    });
  };

  const selectedCount = endQuestion - startQuestion + 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          EVSS Unit 1 Quiz
        </h1>
        <p className="text-gray-600">
          Environmental Science & Sustainability - NMIT
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
          {totalQuestions} Questions Available
        </div>
      </div>

      {/* Setup Card */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="text-xl">Quiz Configuration</CardTitle>
          <CardDescription className="text-emerald-100">
            Customize your quiz experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Quiz Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">Quiz Mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as QuizMode)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="practice"
                  id="practice"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="practice"
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-emerald-300 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50"
                >
                  <GraduationCap className="w-8 h-8 mb-2 text-emerald-600" />
                  <span className="font-semibold text-gray-900">Practice Mode</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    See answers immediately
                  </span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="exam"
                  id="exam"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="exam"
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-emerald-300 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50"
                >
                  <ClipboardCheck className="w-8 h-8 mb-2 text-emerald-600" />
                  <span className="font-semibold text-gray-900">Exam Mode</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Answers shown at the end
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Shuffle Option */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Shuffle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <Label htmlFor="shuffle" className="font-semibold text-gray-900 cursor-pointer">
                  Shuffle Questions
                </Label>
                <p className="text-sm text-gray-500">
                  Randomize question order
                </p>
              </div>
            </div>
            <Switch
              id="shuffle"
              checked={shuffle}
              onCheckedChange={setShuffle}
            />
          </div>

          {/* Question Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900">Question Range</Label>
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              {/* Start Question */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-600">From Question</Label>
                  <span className="text-lg font-bold text-emerald-600">{startQuestion}</span>
                </div>
                <Slider
                  value={[startQuestion]}
                  onValueChange={(value) => {
                    setStartQuestion(value[0]);
                    if (value[0] > endQuestion) {
                      setEndQuestion(value[0]);
                    }
                  }}
                  min={1}
                  max={totalQuestions}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* End Question */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-600">To Question</Label>
                  <span className="text-lg font-bold text-emerald-600">{endQuestion}</span>
                </div>
                <Slider
                  value={[endQuestion]}
                  onValueChange={(value) => {
                    setEndQuestion(value[0]);
                    if (value[0] < startQuestion) {
                      setStartQuestion(value[0]);
                    }
                  }}
                  min={1}
                  max={totalQuestions}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Selected Count */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selected Questions:</span>
                  <span className="text-xl font-bold text-emerald-600">{selectedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Environmental Science & Sustainability - NMIT Unit 1</p>
      </div>
    </div>
  );
}
