import React, { useEffect, useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');

  const fetchTodos = () => {
    fetch('/todos')
      .then(res => res.json())
      .then(setTodos)
      .catch(console.error);
  };

  useEffect(fetchTodos, []);

  const handleAddTodo = e => {
    e.preventDefault();
    if (!newTask.trim()) return;

    fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Task: newTask })
    })
      .then(() => {
        setNewTask('');
        fetchTodos();
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>TODO Lista</h1>
      <form onSubmit={handleAddTodo}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} />
        <button type="submit">Lisää</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.Id}>
            {todo.Task} {todo.IsDone ? '✔️' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
