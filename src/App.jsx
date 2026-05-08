import React, { useState, useMemo } from 'react';
import { foodDatabase, workoutDatabase, STEP_CALORIES_MULTIPLIER } from './data';
import './index.css';

import Header from './components/Header';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import FoodTab from './components/FoodTab';
import DraftMealReview from './components/DraftMealReview';
import WorkoutTab from './components/WorkoutTab';
import DraftWorkoutReview from './components/DraftWorkoutReview';
import LogList from './components/LogList';
import AIInput from './components/AIInput';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for logs
  const [foodLogs, setFoodLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [steps, setSteps] = useState(0);

  // State for manual food form
  const [selectedFoodId, setSelectedFoodId] = useState(foodDatabase[0].id);
  const [foodAmount, setFoodAmount] = useState('');
  
  // State for Draft Meal
  const [draftMeal, setDraftMeal] = useState(null);
  const [draftAddId, setDraftAddId] = useState(foodDatabase[0].id);
  const [draftAddAmount, setDraftAddAmount] = useState('');

  // State for manual workout form
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workoutDatabase[0].id);
  const [workoutSets, setWorkoutSets] = useState('');

  // State for Draft Workout
  const [draftWorkout, setDraftWorkout] = useState(null);
  const [draftAddWorkoutId, setDraftAddWorkoutId] = useState(workoutDatabase[0].id);
  const [draftAddWorkoutSets, setDraftAddWorkoutSets] = useState('');
  
  // State for steps
  const [stepsInput, setStepsInput] = useState('');

  // Calculations
  const totals = useMemo(() => {
    let p = 0, c = 0, f = 0, calIn = 0;
    foodLogs.forEach(log => {
      const item = foodDatabase.find(food => food.id === log.foodId);
      if (item) {
        const multiplier = log.amount / 100;
        p += item.protein * multiplier;
        c += item.carbs * multiplier;
        f += item.fats * multiplier;
        calIn += item.calories * multiplier;
      }
    });

    let calOut = steps * STEP_CALORIES_MULTIPLIER;
    workoutLogs.forEach(log => {
      const item = workoutDatabase.find(w => w.id === log.workoutId);
      if (item) {
        calOut += item.calPerSet * log.sets;
      }
    });

    return { p: Math.round(p), c: Math.round(c), f: Math.round(f), calIn: Math.round(calIn), calOut: Math.round(calOut) };
  }, [foodLogs, workoutLogs, steps]);


  // --- FOOD METHODS ---
  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodAmount || isNaN(foodAmount) || Number(foodAmount) <= 0) return;
    setFoodLogs([...foodLogs, { id: Date.now(), foodId: Number(selectedFoodId), amount: Number(foodAmount), name: foodDatabase.find(f => f.id === Number(selectedFoodId)).name }]);
    setFoodAmount('');
    setActiveTab('dashboard');
  };

  const handleStartQuickLog = (meal) => {
    setDraftMeal({
      name: meal.name,
      items: meal.items.map((it, idx) => ({ tempId: Date.now() + idx, foodId: it.foodId, amount: it.amount }))
    });
  };

  const handleUpdateDraftAmount = (tempId, newAmount) => {
    setDraftMeal(prev => ({
      ...prev,
      items: prev.items.map(it => it.tempId === tempId ? { ...it, amount: newAmount === '' ? '' : Number(newAmount) } : it)
    }));
  };

  const handleRemoveDraftItem = (tempId) => {
    setDraftMeal(prev => ({
      ...prev,
      items: prev.items.filter(it => it.tempId !== tempId)
    }));
  };

  const handleAddDraftItem = (e) => {
    e.preventDefault();
    if(!draftAddAmount || Number(draftAddAmount) <= 0) return;
    setDraftMeal(prev => ({
      ...prev,
      items: [...prev.items, { tempId: Date.now(), foodId: Number(draftAddId), amount: Number(draftAddAmount) }]
    }));
    setDraftAddAmount('');
  };

  const handleConfirmDraftMeal = () => {
    const validItems = draftMeal.items.filter(it => it.amount && Number(it.amount) > 0);
    const newLogs = validItems.map(it => ({
      id: Date.now() + Math.random(),
      foodId: it.foodId,
      amount: Number(it.amount),
      name: `${draftMeal.name.split(':')[0]} - ${foodDatabase.find(f => f.id === it.foodId).name}`
    }));
    setFoodLogs([...foodLogs, ...newLogs]);
    setDraftMeal(null);
    setActiveTab('dashboard');
  };

  const handleUpdateFoodLog = (id, newAmount) => {
    if (newAmount <= 0) {
      handleDeleteFoodLog(id);
      return;
    }
    setFoodLogs(prev => prev.map(log => log.id === id ? { ...log, amount: newAmount } : log));
  };

  const handleDeleteFoodLog = (id) => {
    setFoodLogs(prev => prev.filter(log => log.id !== id));
  };


  // --- WORKOUT METHODS ---
  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!workoutSets || isNaN(workoutSets) || Number(workoutSets) <= 0) return;
    setWorkoutLogs([...workoutLogs, { id: Date.now(), workoutId: Number(selectedWorkoutId), sets: Number(workoutSets) }]);
    setWorkoutSets('');
    setActiveTab('dashboard');
  };

  const handleStartQuickLogWorkout = (workout) => {
    setDraftWorkout({
      name: workout.name,
      items: workout.items.map((it, idx) => ({ tempId: Date.now() + idx, exerciseId: it.exerciseId, sets: it.sets }))
    });
  };

  const handleUpdateDraftWorkoutSets = (tempId, newSets) => {
    setDraftWorkout(prev => ({
      ...prev,
      items: prev.items.map(it => it.tempId === tempId ? { ...it, sets: newSets === '' ? '' : Number(newSets) } : it)
    }));
  };

  const handleRemoveDraftWorkoutItem = (tempId) => {
    setDraftWorkout(prev => ({
      ...prev,
      items: prev.items.filter(it => it.tempId !== tempId)
    }));
  };

  const handleAddDraftWorkoutItem = (e) => {
    e.preventDefault();
    if(!draftAddWorkoutSets || Number(draftAddWorkoutSets) <= 0) return;
    setDraftWorkout(prev => ({
      ...prev,
      items: [...prev.items, { tempId: Date.now(), exerciseId: Number(draftAddWorkoutId), sets: Number(draftAddWorkoutSets) }]
    }));
    setDraftAddWorkoutSets('');
  };

  const handleConfirmDraftWorkout = () => {
    const validItems = draftWorkout.items.filter(it => it.sets && Number(it.sets) > 0);
    const newLogs = validItems.map(it => ({
      id: Date.now() + Math.random(),
      workoutId: it.exerciseId,
      sets: Number(it.sets)
    }));
    setWorkoutLogs([...workoutLogs, ...newLogs]);
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
    if (newSets <= 0) {
      handleDeleteWorkoutLog(id);
      return;
    }
    setWorkoutLogs(prev => prev.map(log => log.id === id ? { ...log, sets: newSets } : log));
  };

  const handleDeleteWorkoutLog = (id) => {
    setWorkoutLogs(prev => prev.filter(log => log.id !== id));
  };


  const handleResetDrafts = () => {
    setDraftMeal(null);
    setDraftWorkout(null);
  };

  // --- RENDER ---
  return (
    <div className="app-container">
      <Header />
      
      <TabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onResetDrafts={handleResetDrafts} 
      />

      {activeTab === 'dashboard' && (
        <>
          <Dashboard totals={totals} steps={steps} />
          <AIInput />
          <LogList 
            foodLogs={foodLogs} 
            workoutLogs={workoutLogs} 
            onUpdateFoodLog={handleUpdateFoodLog}
            onDeleteFoodLog={handleDeleteFoodLog}
            onUpdateWorkoutLog={handleUpdateWorkoutLog}
            onDeleteWorkoutLog={handleDeleteWorkoutLog}
          />
        </>
      )}

      {activeTab === 'food' && !draftMeal && (
        <FoodTab
          onStartQuickLog={handleStartQuickLog}
          selectedFoodId={selectedFoodId}
          setSelectedFoodId={setSelectedFoodId}
          foodAmount={foodAmount}
          setFoodAmount={setFoodAmount}
          onAddFood={handleAddFood}
        />
      )}

      {activeTab === 'food' && draftMeal && (
        <DraftMealReview
          draftMeal={draftMeal}
          draftAddId={draftAddId}
          draftAddAmount={draftAddAmount}
          setDraftAddId={setDraftAddId}
          setDraftAddAmount={setDraftAddAmount}
          onCancel={() => setDraftMeal(null)}
          onUpdateAmount={handleUpdateDraftAmount}
          onRemoveItem={handleRemoveDraftItem}
          onAddItem={handleAddDraftItem}
          onConfirm={handleConfirmDraftMeal}
        />
      )}

      {activeTab === 'workout' && !draftWorkout && (
        <WorkoutTab
          onStartQuickLogWorkout={handleStartQuickLogWorkout}
          stepsInput={stepsInput}
          setStepsInput={setStepsInput}
          onUpdateSteps={handleUpdateSteps}
          selectedWorkoutId={selectedWorkoutId}
          setSelectedWorkoutId={setSelectedWorkoutId}
          workoutSets={workoutSets}
          setWorkoutSets={setWorkoutSets}
          onAddWorkout={handleAddWorkout}
        />
      )}

      {activeTab === 'workout' && draftWorkout && (
        <DraftWorkoutReview
          draftWorkout={draftWorkout}
          draftAddWorkoutId={draftAddWorkoutId}
          draftAddWorkoutSets={draftAddWorkoutSets}
          setDraftAddWorkoutId={setDraftAddWorkoutId}
          setDraftAddWorkoutSets={setDraftAddWorkoutSets}
          onCancel={() => setDraftWorkout(null)}
          onUpdateSets={handleUpdateDraftWorkoutSets}
          onRemoveItem={handleRemoveDraftWorkoutItem}
          onAddItem={handleAddDraftWorkoutItem}
          onConfirm={handleConfirmDraftWorkout}
        />
      )}

    </div>
  );
}
