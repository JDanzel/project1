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

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  affectedCategories: Category[];
  isCustom?: boolean;
  difficulty?: Difficulty;
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