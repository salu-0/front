import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setError(null);
      const response = await axios.get('https://back-lts2.onrender.com/api/todos');
      setTodos(response.data);
    } catch (error) {
      if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch todos');
      }
      console.error('Error fetching todos:', error);
    }
  };

  // Add new todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    setLoading(true);
    try {
      const response = await axios.post('https://back-lts2.onrender.com/api/todos', {
        text: inputValue,
        completed: false
      });

      // Use actual data from server
      setTodos(prevTodos => [response.data, ...prevTodos]);
      setInputValue('');
    } catch (error) {
      if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to add todo');
      }
      console.error('Error adding todo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://back-lts2.onrender.com/api/todos/${id}`);
      setTodos(prevTodos => prevTodos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error.response?.data || error.message);
    }
  };

  // Edit todo
  const handleEdit = async (id) => {
    const updatedValue = prompt('Edit todo:', '');
    if (updatedValue !== null && updatedValue.trim() !== '') {
      try {
        const response = await axios.put(`https://back-lts2.onrender.com/api/todos/${id}`, {
          text: updatedValue
        });
        setTodos(prevTodos =>
          prevTodos.map(todo => (todo._id === id ? response.data : todo))
        );
      } catch (error) {
        if (error.response?.status === 500) {
          setError('Server error occurred. Please try again later.');
        } else {
          setError(error.response?.data?.message || error.message || 'Failed to update todo');
        }
        console.error('Error updating todo:', error);
      }
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>

      {/* Form to add a new todo */}
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a task"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Todo List */}
      <div className="data-list">
        {todos.map((todo, index) => (
          <div key={todo._id?.toString() || index} className="data-item">
            <span>{todo.text}</span>
            <button onClick={() => handleEdit(todo._id)}>Edit</button>
            <button onClick={() => handleDelete(todo._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
