// src/App.jsx
import React, { useState } from 'react';
import TaskList from './components/TaskList';
import StudyContent from './components/StudyContent';

function App() {
  const [tasks, setTasks] = useState([]);
  
  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">学習リマインダーToDoアプリ</h1>
      <TaskList tasks={tasks} addTask={addTask} />
      <StudyContent />
    </div>
  );
}

export default App;
