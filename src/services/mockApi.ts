import { MENU_ITEMS, FRANCHISES, FESTIVALS, DAY_OF_WEEK_FACTORS, DEMO_USERS } from '../utils/constants';
import { toDateString, getDayName } from '../utils/formatters';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'admin';
  franchiseId: string | null;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rain: number;
  condition: string;
  source: string;
}

export interface Recommendation {
  itemId: string;
  itemName: string;
  category: string;
  baseDemand: number;
  weatherMultiplier: number;
  festivalMultiplier: number;
  dayOfWeekFactor: number;
  suggestedQty: number;
  status: 'green' | 'amber' | 'red';
}

export interface WasteLog {
  id: string;
  itemId: string;
  itemName: string;
  franchiseId: string;
  date: string;
  qtyPrepared: number;
  qtyLeftover: number;
  wastagePercent: number;
}

export interface FranchiseComparison {
  franchiseId: string;
  franchiseName: string;
  location: string;
  totalPrepared: number;
  totalLeftover: number;
  wastagePercent: number;
  status: 'green' | 'amber' | 'red';
}

// Weather fallback data for Faridabad
const getWeatherData = (): WeatherData => {
  const today = new Date();
  const month = today.getMonth();
  
  // Simulate seasonal weather for Faridabad
  let temp: number, humidity: number, rain: number, condition: string;
  
  if (month >= 3 && month <= 6) { // Summer
    temp = 38 + Math.floor(Math.random() * 5);
    humidity = 35 + Math.floor(Math.random() * 20);
    rain = 0;
    condition = 'Clear';
  } else if (month >= 6 && month <= 9) { // Monsoon
    temp = 30 + Math.floor(Math.random() * 5);
    humidity = 75 + Math.floor(Math.random() * 15);
    rain = Math.random() > 0.5 ? 5 + Math.floor(Math.random() * 10) : 0;
    condition = rain > 0 ? 'Rain' : 'Cloudy';
  } else if (month >= 10 && month <= 11) { // Autumn
    temp = 25 + Math.floor(Math.random() * 8);
    humidity = 50 + Math.floor(Math.random() * 20);
    rain = 0;
    condition = 'Clear';
  } else { // Winter
    temp = 12 + Math.floor(Math.random() * 10);
    humidity = 60 + Math.floor(Math.random() * 20);
    rain = 0;
    condition = 'Clear';
  }

  return { temp, humidity, rain, condition, source: 'fallback' };
};

// Generate historical sales data
const generateSalesHistory = (franchiseId: string, days: number = 45): Record<string, Record<string, number>> => {
  const history: Record<string, Record<string, number>> = {};
  const today = new Date();

  MENU_ITEMS.forEach(item => {
    history[item.id] = {};
    for (let i = days; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = toDateString(date);
      
      // Base quantity varies by item category
      let baseQty: number;
      switch (item.category) {
        case 'hot_food': baseQty = 30 + Math.floor(Math.random() * 20); break;
        case 'cold_drinks': baseQty = 20 + Math.floor(Math.random() * 15); break;
        case 'hot_drinks': baseQty = 40 + Math.floor(Math.random() * 25); break;
        case 'desserts': baseQty = 15 + Math.floor(Math.random() * 10); break;
        default: baseQty = 20 + Math.floor(Math.random() * 10);
      }
      
      // Add franchise variation
      const franchiseMultiplier = franchiseId === 'franchise-1' ? 1.0 : franchiseId === 'franchise-2' ? 0.85 : 0.7;
      const qtySold = Math.round(baseQty * franchiseMultiplier * (0.85 + Math.random() * 0.3));
      history[item.id][dateStr] = qtySold;
    }
  });

  return history;
};

// Generate waste logs for the past week
const generateWasteLogs = (franchiseId: string): WasteLog[] => {
  const logs: WasteLog[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = toDateString(date);

    MENU_ITEMS.forEach(item => {
      let basePrepared: number;
      switch (item.category) {
        case 'hot_food': basePrepared = 35 + Math.floor(Math.random() * 15); break;
        case 'cold_drinks': basePrepared = 25 + Math.floor(Math.random() * 10); break;
        case 'hot_drinks': basePrepared = 45 + Math.floor(Math.random() * 15); break;
        case 'desserts': basePrepared = 18 + Math.floor(Math.random() * 8); break;
        default: basePrepared = 22 + Math.floor(Math.random() * 8);
      }

      // Franchise-specific waste patterns
      const wasteRate = franchiseId === 'franchise-1' ? 0.06 + Math.random() * 0.04 :
                        franchiseId === 'franchise-2' ? 0.08 + Math.random() * 0.06 :
                        0.12 + Math.random() * 0.08;

      const qtyPrepared = Math.round(basePrepared * (franchiseId === 'franchise-1' ? 1.0 : franchiseId === 'franchise-2' ? 0.85 : 0.7));
      const qtyLeftover = Math.round(qtyPrepared * wasteRate);
      const wastagePercent = Math.round((qtyLeftover / qtyPrepared) * 10000) / 100;

      logs.push({
        id: `waste-${franchiseId}-${item.id}-${dateStr}`,
        itemId: item.id,
        itemName: item.name,
        franchiseId,
        date: dateStr,
        qtyPrepared,
        qtyLeftover,
        wastagePercent,
      });
    });
  }

  return logs;
};

// Recommendation engine
const calculateRecommendation = (
  itemId: string,
  franchiseId: string,
  salesHistory: Record<string, Record<string, number>>,
  weather: WeatherData,
  todayFestival: typeof FESTIVALS[0] | null,
): Recommendation => {
  const item = MENU_ITEMS.find(m => m.id === itemId)!;
  const today = new Date();
  const dayName = getDayName(today);

  // Base demand: average of last 45 days
  const itemHistory = salesHistory[itemId] || {};
  const values = Object.values(itemHistory);
  const baseDemand = values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 20;

  // Day of week factor
  const dayOfWeekFactor = DAY_OF_WEEK_FACTORS[dayName] || 1.0;

  // Weather multiplier
  let weatherMultiplier = 1.0;
  if (item.category === 'cold_drinks') {
    if (weather.rain > 0) weatherMultiplier = 0.7;
    else if (weather.humidity > 80) weatherMultiplier = 0.8;
    else if (weather.temp > 35) weatherMultiplier = 1.2;
  } else if (item.category === 'hot_food') {
    if (weather.rain > 0) weatherMultiplier = 1.15;
    else if (weather.temp < 15) weatherMultiplier = 1.1;
  } else if (item.category === 'hot_drinks') {
    if (weather.temp < 20) weatherMultiplier = 1.2;
    else if (weather.temp > 35) weatherMultiplier = 0.85;
  }

  // Festival multiplier
  const festivalMultiplier = todayFestival ? todayFestival.multiplier : 1.0;

  // Final calculation
  const suggestedQty = Math.max(1, Math.round(baseDemand * weatherMultiplier * festivalMultiplier * dayOfWeekFactor));

  // Status based on historical waste patterns
  const status: 'green' | 'amber' | 'red' = suggestedQty > 60 ? 'red' : suggestedQty > 45 ? 'amber' : 'green';

  return {
    itemId,
    itemName: item.name,
    category: item.category,
    baseDemand: Math.round(baseDemand),
    weatherMultiplier,
    festivalMultiplier,
    dayOfWeekFactor,
    suggestedQty,
    status,
  };
};

// Storage keys
const STORAGE_KEYS = {
  wasteLogs: 'dineops_waste_logs',
  customFestivals: 'dineops_custom_festivals',
  authUser: 'dineops_auth_user',
};

// Mock API Service
class MockApiService {
  private salesHistory: Record<string, Record<string, Record<string, number>>> = {};
  private wasteLogs: WasteLog[] = [];
  private customFestivals: typeof FESTIVALS = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Generate sales history for each franchise
    FRANCHISES.forEach(f => {
      this.salesHistory[f.id] = generateSalesHistory(f.id);
    });

    // Load or generate waste logs
    const storedLogs = localStorage.getItem(STORAGE_KEYS.wasteLogs);
    if (storedLogs) {
      this.wasteLogs = JSON.parse(storedLogs);
    } else {
      FRANCHISES.forEach(f => {
        this.wasteLogs.push(...generateWasteLogs(f.id));
      });
      this.saveWasteLogs();
    }

    // Load custom festivals
    const storedFestivals = localStorage.getItem(STORAGE_KEYS.customFestivals);
    if (storedFestivals) {
      this.customFestivals = JSON.parse(storedFestivals);
    }
  }

  private saveWasteLogs() {
    localStorage.setItem(STORAGE_KEYS.wasteLogs, JSON.stringify(this.wasteLogs));
  }

  private saveCustomFestivals() {
    localStorage.setItem(STORAGE_KEYS.customFestivals, JSON.stringify(this.customFestivals));
  }

  // Auth
  async login(email: string, password: string): Promise<User | null> {
    await this.delay(500);
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const authUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        franchiseId: user.franchiseId,
      };
      localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(authUser));
      return authUser;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    await this.delay(100);
    const stored = localStorage.getItem(STORAGE_KEYS.authUser);
    if (stored) return JSON.parse(stored);
    return null;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  }

  // Weather
  async getWeather(): Promise<WeatherData> {
    await this.delay(300);
    return getWeatherData();
  }

  // Recommendations
  async getRecommendations(franchiseId: string): Promise<Recommendation[]> {
    await this.delay(400);
    const weather = getWeatherData();
    const allFestivals = [...FESTIVALS, ...this.customFestivals];
    const todayStr = toDateString(new Date());
    const todayFestival = allFestivals.find(f => f.date === todayStr) || null;
    const history = this.salesHistory[franchiseId] || {};

    return MENU_ITEMS.map(item =>
      calculateRecommendation(item.id, franchiseId, history, weather, todayFestival)
    );
  }

  // Today's festival
  getTodayFestival(): typeof FESTIVALS[0] | null {
    const allFestivals = [...FESTIVALS, ...this.customFestivals];
    const todayStr = toDateString(new Date());
    return allFestivals.find(f => f.date === todayStr) || null;
  }

  // Waste logging
  async logWaste(franchiseId: string, itemId: string, qtyPrepared: number, qtyLeftover: number): Promise<WasteLog> {
    await this.delay(300);
    const item = MENU_ITEMS.find(m => m.id === itemId)!;
    const wastagePercent = Math.round((qtyLeftover / qtyPrepared) * 10000) / 100;
    
    const log: WasteLog = {
      id: `waste-${Date.now()}-${itemId}`,
      itemId,
      itemName: item.name,
      franchiseId,
      date: toDateString(new Date()),
      qtyPrepared,
      qtyLeftover,
      wastagePercent,
    };

    this.wasteLogs.push(log);
    this.saveWasteLogs();
    return log;
  }

  // Weekly report
  async getWeeklyReport(franchiseId: string): Promise<{
    dailyWastage: { date: string; wastagePercent: number }[];
    beforeDineOps: number;
    currentWastage: number;
    logs: WasteLog[];
  }> {
    await this.delay(400);
    const franchiseLogs = this.wasteLogs.filter(l => l.franchiseId === franchiseId);
    const today = new Date();
    const dailyWastage: { date: string; wastagePercent: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = toDateString(date);
      const dayLogs = franchiseLogs.filter(l => l.date === dateStr);
      
      if (dayLogs.length > 0) {
        const avgWastage = dayLogs.reduce((sum, l) => sum + l.wastagePercent, 0) / dayLogs.length;
        dailyWastage.push({ date: dateStr, wastagePercent: Math.round(avgWastage * 100) / 100 });
      }
    }

    const currentWastage = dailyWastage.length > 0
      ? dailyWastage.reduce((sum, d) => sum + d.wastagePercent, 0) / dailyWastage.length
      : 0;

    // Before DineOps baseline (simulated as 18%)
    const beforeDineOps = 18;

    return {
      dailyWastage,
      beforeDineOps,
      currentWastage: Math.round(currentWastage * 100) / 100,
      logs: franchiseLogs,
    };
  }

  // Admin comparison
  async getFranchiseComparison(): Promise<FranchiseComparison[]> {
    await this.delay(400);
    
    return FRANCHISES.map(f => {
      const franchiseLogs = this.wasteLogs.filter(l => l.franchiseId === f.id);
      const totalPrepared = franchiseLogs.reduce((sum, l) => sum + l.qtyPrepared, 0);
      const totalLeftover = franchiseLogs.reduce((sum, l) => sum + l.qtyLeftover, 0);
      const wastagePercent = totalPrepared > 0 
        ? Math.round((totalLeftover / totalPrepared) * 10000) / 100 
        : 0;

      const status: 'green' | 'amber' | 'red' = 
        wastagePercent <= 8 ? 'green' : wastagePercent <= 15 ? 'amber' : 'red';

      return {
        franchiseId: f.id,
        franchiseName: f.name,
        location: f.location,
        totalPrepared,
        totalLeftover,
        wastagePercent,
        status,
      };
    });
  }

  // Festivals
  async getAllFestivals(): Promise<typeof FESTIVALS> {
    await this.delay(200);
    return [...FESTIVALS, ...this.customFestivals].sort((a, b) => a.date.localeCompare(b.date));
  }

  async addFestival(name: string, date: string, multiplier: number): Promise<void> {
    await this.delay(300);
    this.customFestivals.push({
      id: `custom-${Date.now()}`,
      name,
      date,
      multiplier,
    });
    this.saveCustomFestivals();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new MockApiService();
