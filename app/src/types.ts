export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export type QuizMode = 'practice' | 'exam';
export type QuizState = 'setup' | 'quiz' | 'results';

export interface QuizConfig {
  mode: QuizMode;
  shuffle: boolean;
  startQuestion: number;
  endQuestion: number;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timestamp: number;
}
