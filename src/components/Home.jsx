import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch todos when component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        text: inputValue,
        completed: false
      });
      setItems([...items, response.data]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    const itemToEdit = items.find(item => item.id === id);
    const updatedValue = prompt('Edit item:', itemToEdit.text);
    
    if (updatedValue !== null && updatedValue.trim() !== '') {
      try {
        const response = await axios.put(`http://localhost:5000/api/todos/${id}`, {
          text: updatedValue
        });
        setItems(items.map(item =>
          item.id === id ? response.data : item
        ));
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your task"
          className="form-input"
          disabled={loading}
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      <div className="data-list">
        {items.map((item) => (
          <div key={item._id} className="data-item">
            <span className="item-text">{item.text}</span>
            <div className="button-group">
              <button
                onClick={() => handleEdit(item._id)}
                className="edit-button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
