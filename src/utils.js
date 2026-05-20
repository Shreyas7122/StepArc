import { foodDatabase, workoutDatabase, STEP_CALORIES_MULTIPLIER } from './data';

export function computeTotals(foodLogs, workoutLogs, cardioLogs, steps) {
  let p = 0, c = 0, f = 0, calIn = 0, fibre = 0;
  (foodLogs || []).forEach(log => {
    if (log.aiMacros) {
      p     += Number(log.aiMacros.protein)  || 0;
      c     += Number(log.aiMacros.carbs)    || 0;
      f     += Number(log.aiMacros.fats)     || 0;
      calIn += Number(log.aiMacros.calories) || 0;
      fibre += Number(log.aiMacros.fibre)    || 0;
    } else {
      const item = foodDatabase.find(food => food.id === log.foodId);
      if (item) {
        const mult = log.amount / 100;
        p     += item.protein          * mult;
        c     += item.carbs            * mult;
        f     += item.fats             * mult;
        calIn += item.calories         * mult;
        fibre += (item.fibre || 0)     * mult;
      }
    }
  });
  let calOut = (steps || 0) * STEP_CALORIES_MULTIPLIER;
  (workoutLogs || []).forEach(log => {
    const item = workoutDatabase.find(w => w.id === log.workoutId);
    if (item) calOut += item.calPerSet * log.sets;
  });
  (cardioLogs || []).forEach(log => { calOut += Number(log.aiCalories) || 0; });
  return {
    p: Math.round(p), c: Math.round(c), f: Math.round(f),
    calIn: Math.round(calIn), calOut: Math.round(calOut),
    fibre: Math.round(fibre * 10) / 10,
  };
}

export function getApiBase() {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Detect if we are on Android
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    if (url.includes('localhost')) {
      return url.replace('localhost', '10.0.2.2');
    }
    if (url.includes('127.0.0.1')) {
      return url.replace('127.0.0.1', '10.0.2.2');
    }
  }
  return url;
}
