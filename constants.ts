import { Category, Task, TaskType, Difficulty } from './types';

export const XP_PER_TASK = 10; // Fallback default
export const XP_TO_LEVEL_UP = 100;

// Specific penalties for negative habits
export const TASK_PENALTIES: Record<string, number> = {
  'neg_sugar': 30,
  'neg_fastfood': 20,
  'neg_doomscrolling': 20
};
export const DEFAULT_PENALTY = 15;

export const XP_RATES: Record<Difficulty, number> = {
  [Difficulty.EASY]: 5,
  [Difficulty.MEDIUM]: 10,
  [Difficulty.HARD]: 25,
  [Difficulty.EPIC]: 50
};

export const TASK_DURATIONS: Record<string, number> = {
  'basic_charge': 20 * 60,
  'const_run': 60 * 60,
  'const_strength': 60 * 60,
  'const_read': 25 * 60
};

export const PREDEFINED_TASKS: Task[] = [
  // Basic Tasks
  {
    id: 'basic_charge',
    name: 'Утренняя зарядка',
    type: TaskType.BASIC,
    affectedCategories: [Category.PHYSICAL]
  },
  {
    id: 'basic_food',
    name: 'Здоровое питание',
    type: TaskType.BASIC,
    affectedCategories: [Category.HEALTH]
  },
  {
    id: 'basic_sleep',
    name: 'Полноценный сон',
    type: TaskType.BASIC,
    affectedCategories: [Category.INTELLECT, Category.HEALTH]
  },
  {
    id: 'basic_calm',
    name: 'Успокоение / Медитация',
    type: TaskType.BASIC,
    affectedCategories: [Category.HEALTH]
  },
  
  // Constant Tasks
  {
    id: 'const_run',
    name: 'Бег',
    type: TaskType.CONSTANT,
    affectedCategories: [Category.PHYSICAL]
  },
  {
    id: 'const_strength',
    name: 'Силовая тренировка',
    type: TaskType.CONSTANT,
    affectedCategories: [Category.PHYSICAL]
  },
  {
    id: 'const_read',
    name: 'Чтение',
    type: TaskType.CONSTANT,
    affectedCategories: [Category.INTELLECT]
  },
  {
    id: 'const_aikido',
    name: 'Айкидо',
    type: TaskType.CONSTANT,
    affectedCategories: [Category.PHYSICAL]
  },
  {
    id: 'const_lang',
    name: 'Иностранные языки',
    type: TaskType.CONSTANT,
    affectedCategories: [Category.INTELLECT]
  },

  // Negative Habits
  {
    id: 'neg_sugar',
    name: 'Сахар / Сладкое',
    type: TaskType.NEGATIVE,
    affectedCategories: [Category.PHYSICAL, Category.INTELLECT, Category.HEALTH]
  },
  {
    id: 'neg_fastfood',
    name: 'Фастфуд',
    type: TaskType.NEGATIVE,
    affectedCategories: [Category.HEALTH]
  },
  {
    id: 'neg_doomscrolling',
    name: 'Думскроллинг',
    type: TaskType.NEGATIVE,
    affectedCategories: [Category.INTELLECT]
  }
];