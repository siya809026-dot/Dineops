// Menu Items for Pindi Junction franchises
export const MENU_ITEMS = [
  { id: 'item-1', name: 'Butter Chicken', category: 'hot_food', basePrice: 280 },
  { id: 'item-2', name: 'Dal Makhani', category: 'hot_food', basePrice: 220 },
  { id: 'item-3', name: 'Paneer Tikka', category: 'hot_food', basePrice: 250 },
  { id: 'item-4', name: 'Chicken Biryani', category: 'hot_food', basePrice: 260 },
  { id: 'item-5', name: 'Cold Coffee', category: 'cold_drinks', basePrice: 120 },
  { id: 'item-6', name: 'Fresh Lime Soda', category: 'cold_drinks', basePrice: 80 },
  { id: 'item-7', name: 'Masala Chai', category: 'hot_drinks', basePrice: 40 },
  { id: 'item-8', name: 'Gulab Jamun', category: 'desserts', basePrice: 90 },
];

export const FRANCHISES = [
  { id: 'franchise-1', name: 'Pindi Junction - Sector 15', location: 'Sector 15, Faridabad' },
  { id: 'franchise-2', name: 'Pindi Junction - NIT', location: 'NIT Chowk, Faridabad' },
  { id: 'franchise-3', name: 'Pindi Junction - Ballabgarh', location: 'Ballabgarh, Faridabad' },
];

export const DAY_OF_WEEK_FACTORS: Record<string, number> = {
  monday: 1.00,
  tuesday: 0.98,
  wednesday: 1.00,
  thursday: 1.03,
  friday: 1.08,
  saturday: 1.15,
  sunday: 1.12,
};

export const FESTIVALS = [
  { id: 'fest-1', name: 'Diwali', date: '2026-11-01', multiplier: 1.8 },
  { id: 'fest-2', name: 'Holi', date: '2026-03-14', multiplier: 1.5 },
  { id: 'fest-3', name: 'Eid', date: '2026-03-21', multiplier: 1.6 },
  { id: 'fest-4', name: 'Gurupurab', date: '2026-11-05', multiplier: 1.4 },
  { id: 'fest-5', name: 'New Year', date: '2026-01-01', multiplier: 1.7 },
  { id: 'fest-6', name: 'Independence Day', date: '2026-08-15', multiplier: 1.3 },
  { id: 'fest-7', name: 'Republic Day', date: '2026-01-26', multiplier: 1.3 },
];

export const DEMO_USERS = [
  {
    id: 'user-admin',
    name: 'Rajesh Kumar',
    email: 'admin@dineops.demo',
    password: 'Admin@12345',
    role: 'admin' as const,
    franchiseId: null,
  },
  {
    id: 'user-mgr1',
    name: 'Amit Sharma',
    email: 'manager1@dineops.demo',
    password: 'Manager@12345',
    role: 'manager' as const,
    franchiseId: 'franchise-1',
  },
  {
    id: 'user-mgr2',
    name: 'Priya Singh',
    email: 'manager2@dineops.demo',
    password: 'Manager@12345',
    role: 'manager' as const,
    franchiseId: 'franchise-2',
  },
  {
    id: 'user-mgr3',
    name: 'Vikram Yadav',
    email: 'manager3@dineops.demo',
    password: 'Manager@12345',
    role: 'manager' as const,
    franchiseId: 'franchise-3',
  },
];

export const STATUS_THRESHOLDS = {
  onTrack: 8,
  warning: 15,
};
