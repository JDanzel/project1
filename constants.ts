import { Category, Task, TaskType, Difficulty, Challenge } from './types';

export const XP_PER_TASK = 10;
export const XP_TO_LEVEL_UP = 100;

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

export const LEVEL_RANKS = [
  { minLevel: 1, title: 'Новобранец', color: 'text-stone-500' },
  { minLevel: 5, title: 'Младший', color: 'text-stone-400' },
  { minLevel: 10, title: 'Опытный', color: 'text-emerald-600' },
  { minLevel: 20, title: 'Закаленный', color: 'text-blue-600' },
  { minLevel: 35, title: 'Элитный', color: 'text-indigo-600' },
  { minLevel: 50, title: 'Высший', color: 'text-purple-600' },
  { minLevel: 75, title: 'Великий', color: 'text-amber-600' },
  { minLevel: 100, title: 'Божественный', color: 'text-red-600' },
];

export const SPECIALIZATIONS: Record<Category | 'BALANCED', { name: string, color: string }> = {
  [Category.PHYSICAL]: { name: 'Атлет', color: 'text-red-600' },
  [Category.INTELLECT]: { name: 'Эрудит', color: 'text-amber-500' },
  [Category.HEALTH]: { name: 'Стоик', color: 'text-emerald-600' },
  [Category.PROFESSIONAL]: { name: 'Мастер', color: 'text-blue-600' },
  'BALANCED': { name: 'Авантюрист', color: 'text-stone-500' }
};

export const PREDEFINED_TASKS: Task[] = [
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

export const PREDEFINED_CHALLENGES: Challenge[] = [
  {
    id: 'chal_sugar_detox',
    title: 'Сахарный Детокс',
    description: 'Продержись 5 дней без сахара и сладкого.',
    type: 'avoidance',
    targetTaskId: 'neg_sugar',
    durationDays: 5,
    rewardXP: 150,
    status: 'available',
    progress: 0
  },
  {
    id: 'chal_runner',
    title: 'Путь Ветра',
    description: 'Выходи на пробежку 3 дня подряд.',
    type: 'streak',
    targetTaskId: 'const_run',
    durationDays: 3,
    rewardXP: 100,
    status: 'available',
    progress: 0
  },
  {
    id: 'chal_scholar',
    title: 'Мудрец',
    description: 'Читай книги 4 дня подряд.',
    type: 'streak',
    targetTaskId: 'const_read',
    durationDays: 4,
    rewardXP: 120,
    status: 'available',
    progress: 0
  },
  {
    id: 'chal_morning',
    title: 'Утренний Страж',
    description: 'Делай утреннюю зарядку 7 дней подряд.',
    type: 'streak',
    targetTaskId: 'basic_charge',
    durationDays: 7,
    rewardXP: 200,
    status: 'available',
    progress: 0
  }
];