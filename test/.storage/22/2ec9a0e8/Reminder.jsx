// src/components/Reminder.jsx
import React, { useEffect } from 'react';
import { calculateNextReminder } from '../utils/learningCurve';

const Reminder = ({ task }) => {
  useEffect(() => {
    const nextReminder = calculateNextReminder(task);
    // Logic to set a reminder based on nextReminder
  }, [task]);

  return <div>リマインダー設定中...</div>;
};

export default Reminder;
