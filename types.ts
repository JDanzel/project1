export enum Category {
  PHYSICAL = 'Physical',
  INTELLECT = 'Intellect',
  HEALTH = 'Health',
  PROFESSIONAL = 'Professional'
}

export enum TaskType {
  BASIC = 'Basic',
  CONSTANT = 'Constant',
  TEMPORARY = 'Temporary',
  NEGATIVE = 'Negative'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EPIC = 'Epic'
}

export interface UserProfile {
  name: string;
  age: number;
  characterClassId: string;
  characterClassName: string;
}

export interface TaskStage {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  difficulty: Difficulty;
  dependsOn?: string; // ID of the stage that must be completed first
  isCompleted?: boolean; // Helper for UI, state lives in DayLog
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  affectedCategories: Category[];
  isCustom?: boolean;
  difficulty?: Difficulty;
  stages?: TaskStage[];
  description?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  completedTaskIds: string[];
}

export interface UserStats {
  level: number;
  xp: number;
  [Category.PHYSICAL]: number;
  [Category.INTELLECT]: number;
  [Category.HEALTH]: number;
  [Category.PROFESSIONAL]: number;
}

// Challenge / Quest System Types
export type ChallengeType = 'streak' | 'avoidance'; // Streak (do X days in a row), Avoidance (don't do X for Y days)

export type ChallengeStatus = 'available' | 'active' | 'completed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetTaskId: string; // ID of the task to track or avoid
  durationDays: number;
  rewardXP: number;
  status: ChallengeStatus;
  startDate?: string; // ISO Date string
  progress: number; // Current days completed
}