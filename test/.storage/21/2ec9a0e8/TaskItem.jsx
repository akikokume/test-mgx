// src/components/TaskItem.jsx
import React from 'react';

const TaskItem = ({ task }) => {
  return (
    <li className="flex items-center">
      <input type="checkbox" checked={task.completed} />
      <span className="ml-2">{task.text}</span>
    </li>
  );
};

export default TaskItem;
