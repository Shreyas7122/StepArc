import { useState, useMemo, useEffect, useRef } from 'react';
import { foodDatabase, workoutDatabase } from './data';
import './index.css';

import { supabase } from './supabase';
import { loadSettings, saveSettings, loadTodayLogs, saveTodayLogs, pruneOldLogs, DEFAULT_SETTINGS } from './db';
import { computeTotals } from './utils';

import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import FoodTab from './components/FoodTab';
import DraftMealReview from './components/DraftMealReview';
import WorkoutTab from './components/WorkoutTab';
import DraftWorkoutReview from './components/DraftWorkoutReview';
import LogList from './components/LogList';
import AIInput from './components/AIInput';
import AIAdvisor from './components/AIAdvisor';
import HistoryTab from './components/HistoryTab';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  const [authUser, setAuthUser]   = useState(null);
  const [authReady, setAuthReady] = useState(false); // waiting for supabase session check
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalKey, setProfileModalKey]   = useState(0);

  const [settings, setSettings]     = useState(DEFAULT_SETTINGS);
  const [foodLogs, setFoodLogs]     = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [steps, setSteps]           = useState(0);

  const [selectedFoodId, setSelectedFoodId]     = useState(foodDatabase[0].id);
  const [foodAmount, setFoodAmount]             = useState('');
  const [draftMeal, setDraftMeal]               = useState(null);
  const [draftAddId, setDraftAddId]             = useState(foodDatabase[0].id);
  const [draftAddAmount, setDraftAddAmount]     = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workoutDatabase[0].id);
  const [workoutSets, setWorkoutSets]           = useState('');
  const [draftWorkout, setDraftWorkout]         = useState(null);
  const [draftAddWorkoutId, setDraftAddWorkoutId]   = useState(workoutDatabase[0].id);
  const [draftAddWorkoutSets, setDraftAddWorkoutSets] = useState('');
  const [stepsInput, setStepsInput]             = useState('');

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data after auth is confirmed
  useEffect(() => {
    if (!authUser) return;
    setIsLoading(true);
    Promise.all([loadSettings(authUser.id), loadTodayLogs(authUser.id)]).then(([s, d]) => {
      setSettings(s);
      setFoodLogs(d.food_logs || []);
      setWorkoutLogs(d.workout_logs || []);
      setCardioLogs(d.cardio_logs || []);
      setSteps(d.steps || 0);
      setIsLoading(false);
    });
    pruneOldLogs(authUser.id);
  }, [authUser]);

  // Debounced save
  const saveTimer = useRef(null);
  useEffect(() => {
    if (isLoading || !authUser) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTodayLogs(authUser.id, { food_logs: foodLogs, workout_logs: workoutLogs, cardio_logs: cardioLogs, steps });
    }, 800);
  }, [foodLogs, workoutLogs, cardioLogs, steps, isLoading, authUser]);

  const totals = useMemo(
    () => computeTotals(foodLogs, workoutLogs, cardioLogs, steps),
    [foodLogs, workoutLogs, cardioLogs, steps]
  );

  const goals       = { calories: settings.calorie_goal, protein: settings.protein_goal, carbs: settings.carbs_goal, fats: settings.fats_goal };
  const userProfile = { age: settings.age, heightCm: settings.height_cm, weightKg: settings.weight_kg };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setSettings(DEFAULT_SETTINGS);
    setFoodLogs([]); setWorkoutLogs([]); setCardioLogs([]); setSteps(0);
  };

  const handleSaveProfile = async (updated) => {
    const merged = { ...settings, ...updated };
    setSettings(merged);
    setShowProfileModal(false);
    await saveSettings(authUser.id, merged);
  };

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodAmount || isNaN(foodAmount) || Number(foodAmount) <= 0) return;
    setFoodLogs(prev => [...prev, { id: Date.now(), foodId: Number(selectedFoodId), amount: Number(foodAmount), name: foodDatabase.find(f => f.id === Number(selectedFoodId)).name }]);
    setFoodAmount('');
    setActiveTab('dashboard');
  };

  const handleStartQuickLog = (meal) => {
    setDraftMeal({ name: meal.name, items: meal.items.map((it, idx) => ({ tempId: Date.now() + idx, foodId: it.foodId, amount: it.amount })) });
  };
  const handleUpdateDraftAmount = (tempId, newAmount) => {
    setDraftMeal(prev => ({ ...prev, items: prev.items.map(it => it.tempId === tempId ? { ...it, amount: newAmount === '' ? '' : Number(newAmount) } : it) }));
  };
  const handleRemoveDraftItem = (tempId) => {
    setDraftMeal(prev => ({ ...prev, items: prev.items.filter(it => it.tempId !== tempId) }));
  };
  const handleAddDraftItem = (e) => {
    e.preventDefault();
    if (!draftAddAmount || Number(draftAddAmount) <= 0) return;
    setDraftMeal(prev => ({ ...prev, items: [...prev.items, { tempId: Date.now(), foodId: Number(draftAddId), amount: Number(draftAddAmount) }] }));
    setDraftAddAmount('');
  };
  const handleConfirmDraftMeal = () => {
    const validItems = draftMeal.items.filter(it => it.amount && Number(it.amount) > 0);
    const newLogs = validItems.map(it => ({ id: Date.now() + Math.random(), foodId: it.foodId, amount: Number(it.amount), name: `${draftMeal.name.split(':')[0]} - ${foodDatabase.find(f => f.id === it.foodId).name}` }));
    setFoodLogs(prev => [...prev, ...newLogs]);
    setDraftMeal(null);
    setActiveTab('dashboard');
  };

  const handleUpdateFoodLog  = (id, newAmount) => {
    if (newAmount <= 0) { setFoodLogs(prev => prev.filter(log => log.id !== id)); return; }
    setFoodLogs(prev => prev.map(log => log.id === id ? { ...log, amount: newAmount } : log));
  };
  const handleDeleteFoodLog  = (id) => setFoodLogs(prev => prev.filter(log => log.id !== id));
  const handleAILog = ({ name, aiMacros }) => { setFoodLogs(prev => [...prev, { id: Date.now(), name, aiMacros }]); setActiveTab('dashboard'); };

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!workoutSets || isNaN(workoutSets) || Number(workoutSets) <= 0) return;
    setWorkoutLogs(prev => [...prev, { id: Date.now(), workoutId: Number(selectedWorkoutId), sets: Number(workoutSets) }]);
    setWorkoutSets('');
    setActiveTab('dashboard');
  };
  const handleStartQuickLogWorkout = (workout) => {
    setDraftWorkout({ name: workout.name, items: workout.items.map((it, idx) => ({ tempId: Date.now() + idx, exerciseId: it.exerciseId, sets: it.sets })) });
  };
  const handleUpdateDraftWorkoutSets = (tempId, newSets) => {
    setDraftWorkout(prev => ({ ...prev, items: prev.items.map(it => it.tempId === tempId ? { ...it, sets: newSets === '' ? '' : Number(newSets) } : it) }));
  };
  const handleRemoveDraftWorkoutItem = (tempId) => {
    setDraftWorkout(prev => ({ ...prev, items: prev.items.filter(it => it.tempId !== tempId) }));
  };
  const handleAddDraftWorkoutItem = (e) => {
    e.preventDefault();
    if (!draftAddWorkoutSets || Number(draftAddWorkoutSets) <= 0) return;
    setDraftWorkout(prev => ({ ...prev, items: [...prev.items, { tempId: Date.now(), exerciseId: Number(draftAddWorkoutId), sets: Number(draftAddWorkoutSets) }] }));
    setDraftAddWorkoutSets('');
  };
  const handleConfirmDraftWorkout = () => {
    const validItems = draftWorkout.items.filter(it => it.sets && Number(it.sets) > 0);
    const newLogs = validItems.map(it => ({ id: Date.now() + Math.random(), workoutId: it.exerciseId, sets: Number(it.sets) }));
    setWorkoutLogs(prev => [...prev, ...newLogs]);
    setDraftWorkout(null);
    setActiveTab('dashboard');
  };

  const handleUpdateSteps = (e) => {
    e.preventDefault();
    if (!stepsInput || isNaN(stepsInput) || Number(stepsInput) < 0) return;
    setSteps(Number(stepsInput));
    setStepsInput('');
    setActiveTab('dashboard');
  };

  const handleUpdateWorkoutLog = (id, newSets) => {
    if (newSets <= 0) { setWorkoutLogs(prev => prev.filter(log => log.id !== id)); return; }
    setWorkoutLogs(prev => prev.map(log => log.id === id ? { ...log, sets: newSets } : log));
  };
  const handleDeleteWorkoutLog  = (id) => setWorkoutLogs(prev => prev.filter(log => log.id !== id));
  const handleAICardioLog = ({ name, durationMins, aiCalories }) => {
    setCardioLogs(prev => [...prev, { id: Date.now(), name, durationMins, aiCalories, cardioId: null }]);
    setActiveTab('dashboard');
  };
  const handleDeleteCardioLog = (id) => setCardioLogs(prev => prev.filter(log => log.id !== id));
  const handleResetDrafts = () => { setDraftMeal(null); setDraftWorkout(null); };

  // Waiting for Supabase to resolve session
  if (!authReady) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="spinner" style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--gold-500)', display: 'inline-block' }} />
      </div>
    );
  }

  // Not logged in
  if (!authUser) {
    return <AuthScreen onAuth={setAuthUser} />;
  }

  // Loading user data
  if (isLoading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--gold-500)', display: 'inline-block' }} />
          <div style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold-500)', fontSize: '0.75rem', marginTop: 16 }}>
            Loading…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        onOpenProfile={() => { setProfileModalKey(k => k + 1); setShowProfileModal(true); }}
        onSignOut={handleSignOut}
        userEmail={authUser.email}
      />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} onResetDrafts={handleResetDrafts} />

      {activeTab === 'dashboard' && (
        <>
          <Dashboard totals={totals} steps={steps} goals={goals} />
          <AIAdvisor foodLogs={foodLogs} workoutLogs={workoutLogs} cardioLogs={cardioLogs} steps={steps} totals={totals} userProfile={userProfile} goals={goals} />
          <AIInput caloriesLoggedToday={totals.calIn} calorieGoal={goals.calories} onLogMeal={handleAILog} />
        </>
      )}

      {activeTab === 'history' && <HistoryTab userId={authUser.id} goals={goals} />}

      {activeTab === 'logs' && (
        <LogList foodLogs={foodLogs} workoutLogs={workoutLogs} cardioLogs={cardioLogs}
          onUpdateFoodLog={handleUpdateFoodLog} onDeleteFoodLog={handleDeleteFoodLog}
          onUpdateWorkoutLog={handleUpdateWorkoutLog} onDeleteWorkoutLog={handleDeleteWorkoutLog}
          onDeleteCardioLog={handleDeleteCardioLog} />
      )}

      {activeTab === 'food' && !draftMeal && (
        <FoodTab onStartQuickLog={handleStartQuickLog} selectedFoodId={selectedFoodId}
          setSelectedFoodId={setSelectedFoodId} foodAmount={foodAmount}
          setFoodAmount={setFoodAmount} onAddFood={handleAddFood}
          customMeals={settings.diet_plan?.meals} />
      )}

      {activeTab === 'food' && draftMeal && (
        <DraftMealReview draftMeal={draftMeal} draftAddId={draftAddId} draftAddAmount={draftAddAmount}
          setDraftAddId={setDraftAddId} setDraftAddAmount={setDraftAddAmount}
          onCancel={() => setDraftMeal(null)} onUpdateAmount={handleUpdateDraftAmount}
          onRemoveItem={handleRemoveDraftItem} onAddItem={handleAddDraftItem} onConfirm={handleConfirmDraftMeal} />
      )}

      {activeTab === 'workout' && !draftWorkout && (
        <WorkoutTab onStartQuickLogWorkout={handleStartQuickLogWorkout} stepsInput={stepsInput}
          setStepsInput={setStepsInput} onUpdateSteps={handleUpdateSteps}
          selectedWorkoutId={selectedWorkoutId} setSelectedWorkoutId={setSelectedWorkoutId}
          workoutSets={workoutSets} setWorkoutSets={setWorkoutSets}
          onAddWorkout={handleAddWorkout} onLogCardio={handleAICardioLog}
          customDays={settings.workout_plan?.days}
          stepGoal={settings.step_goal} />
      )}

      {activeTab === 'workout' && draftWorkout && (
        <DraftWorkoutReview draftWorkout={draftWorkout} draftAddWorkoutId={draftAddWorkoutId}
          draftAddWorkoutSets={draftAddWorkoutSets} setDraftAddWorkoutId={setDraftAddWorkoutId}
          setDraftAddWorkoutSets={setDraftAddWorkoutSets} onCancel={() => setDraftWorkout(null)}
          onUpdateSets={handleUpdateDraftWorkoutSets} onRemoveItem={handleRemoveDraftWorkoutItem}
          onAddItem={handleAddDraftWorkoutItem} onConfirm={handleConfirmDraftWorkout} />
      )}

      {showProfileModal && (
        <UserProfileModal key={profileModalKey} settings={settings} onSave={handleSaveProfile} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
