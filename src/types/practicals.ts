// Practical Laboratory Types

export interface PracticalQuestion {
  question: string;
  answer: string;
}

export interface PracticalStep {
  stepNumber: number;
  title: string;
  instruction: string;
  rosCommand?: string;
  expectedOutput?: string;
  autoActionText?: string;
  actionId?: string;
}

export interface Practical {
  id: string;
  number: number;
  title: string;
  aim: string;
  theory: string;
  requirements: string[];
  procedure: PracticalStep[];
  rosCommands: string[];
  expectedResult: string;
  vivaQuestions: PracticalQuestion[];
  environment: 'turtlebot3_world' | 'turtlebot3_house' | 'indoor_lab' | 'obstacle_course' | 'empty_world';
}

