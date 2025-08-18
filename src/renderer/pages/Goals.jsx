import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AnnualGoals from './goals/AnnualGoals';
import MonthlyGoals from './goals/MonthlyGoals';
import WeeklyGoals from './goals/WeeklyGoals';

function Goals() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="annual" replace />} />
      <Route path="annual" element={<AnnualGoals />} />
      <Route path="monthly" element={<MonthlyGoals />} />
      <Route path="weekly" element={<WeeklyGoals />} />
    </Routes>
  );
}

export default Goals;