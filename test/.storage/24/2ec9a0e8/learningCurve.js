// src/utils/learningCurve.js
export const calculateNextReminder = (task) => {
  // Implement the SM-2 algorithm or any learning curve logic
  const { completed } = task;
  let interval = completed ? 1 : 0; // Example logic
  const nextReminder = new Date();
  nextReminder.setDate(nextReminder.getDate() + interval);
  return nextReminder;
};
