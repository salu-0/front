import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [todos, setTodos] = useState([]);   // To store the list of todos
  const [inputValue, setInputValue] = useState(''); // To store the input value for the new todo
  const [loading, setLoading] = useState(false); // To handle loading state while adding a todo

  // Fetch todos from the server when the component loads
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);  // Set the fetched todos to state
    } catch (error) {
      console.error('Error fetching todos:', error);  // Log any errors
    }
  };

  // Add a new todo
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent form from reloading page
    if (inputValue.trim() === '') return;  // Do nothing if input is empty

    setLoading(true);  // Set loading to true while adding todo
    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        text: inputValue,
        completed: false
      });
      setTodos([...todos, response.data]);  // Add new todo to the list
      setInputValue('');  // Clear the input field
    } catch (error) {
      console.error('Error adding todo:', error);  // Log any errors
    } finally {
      setLoading(false);  // Reset loading state after the request
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);  // Delete todo from server
      setTodos(todos.filter(todo => todo._id !== id));  // Remove deleted todo from state
    } catch (error) {
      console.error('Error deleting todo:', error);  // Log any errors
    }
  };

  // Edit a todo
  const handleEdit = async (id) => {
    const updatedValue = prompt('Edit todo:', '');  // Prompt user for new value
    if (updatedValue !== null && updatedValue.trim() !== '') {
      try {
        const response = await axios.put(`http://localhost:5000/api/todos/${id}`, {
          text: updatedValue
        });
        setTodos(todos.map(todo => todo._id === id ? response.data : todo));  // Update todo in state
      } catch (error) {
        console.error('Error updating todo:', error);  // Log any errors
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
          onChange={(e) => setInputValue(e.target.value)}  // Update input value
          placeholder="Enter a task"
          disabled={loading}  // Disable input while loading
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}  {/* Show loading text while adding */}
        </button>
      </form>

      {/* Display list of todos */}
      <div className="data-list">
        {todos.map((todo) => (
          <div key={todo._id} className="data-item">
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
