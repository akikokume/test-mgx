// src/components/TaskList.jsx
import React, { useState } from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, addTask }) => {
  const [taskInput, setTaskInput] = useState('');

  const handleAddTask = () => {
    if (taskInput) {
      addTask({ text: taskInput, completed: false });
      setTaskInput('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        placeholder="新しいタスクを追加"
        className="border p-2"
      />
      <button onClick={handleAddTask} className="bg-blue-500 text-white p-2">追加</button>
      <ul>
        {tasks.map((task, index) => (
          <TaskItem key={index} task={task} />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
