import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [todos, setTodos] = useState([]);   // To store the list of todos
  const [inputValue, setInputValue] = useState(''); // To store the input value for the new todo
  const [loading, setLoading] = useState(false); // To handle loading state while adding a todo
  const [error, setError] = useState(null); // To store and display fetch errors

  // Fetch todos from the server when the component loads
  useEffect(() => {
    fetchTodos();
  }, []); // Only fetch on mount to avoid infinite loop

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setError(null); // Clear any previous errors
      const response = await axios.get('https://back-lts2.onrender.com/api/todos');
      setTodos(response.data);  // Set the fetched todos to state
    } catch (error) {
      if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch todos');
      }
      console.error('Error fetching todos:', error);  // Log any errors
    }
  };

  // Add a new todo
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent form from reloading page
    if (inputValue.trim() === '') return;  // Do nothing if input is empty

    setLoading(true);  // Set loading to true while adding todo
    try {
      // Create a temporary todo with a temporary ID
      const tempTodo = {
        _id: Date.now(), // Temporary ID
        text: inputValue,
        completed: false
      };
      
      // Optimistically add the todo to the UI
      setTodos(prevTodos => [tempTodo, ...prevTodos]);
      setInputValue('');  // Clear the input field immediately

      // Make the API call
      const response = await axios.post('https://back-lts2.onrender.com/api/todos', {
        text: inputValue,
        completed: false
      });

      // Replace the temporary todo with the real one from the server
      setTodos(prevTodos => prevTodos.map(todo => 
        todo._id === tempTodo._id ? response.data : todo
      ));
    } catch (error) {
      // If there's an error, remove the temporary todo
      setTodos(prevTodos => prevTodos.filter(todo => todo._id !== tempTodo._id));
      if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to add todo');
      }
      console.error('Error adding todo:', error);  // Log any errors
    } finally {
      setLoading(false);  // Reset loading state after the request
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://back-lts2.onrender.com/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter(todo => todo._id !== id));  // Use prevTodos for a safer update
    } catch (error) {
      console.error('Error deleting todo:', error.response ? error.response.data : error.message);
    }
  };
  
  // Edit a todo
  const handleEdit = async (id) => {
    const updatedValue = prompt('Edit todo:', '');  // Prompt user for new value
    if (updatedValue !== null && updatedValue.trim() !== '') {
      try {
        const response = await axios.put(`https://back-lts2.onrender.com/api/todos/${id}`, {
          text: updatedValue
        });
        // Only update UI after successful edit
        setTodos(prevTodos => prevTodos.map(todo => todo._id === id ? response.data : todo));
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
          onChange={(e) => setInputValue(e.target.value)}  // Update input value
          placeholder="Enter a task"
          disabled={loading}  // Disable input while loading
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}  {/* Show loading text while adding */}
        </button>
      </form>

      {/* Display error message if there is one */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Display list of todos */}
      <div className="data-list">
        {todos.map((todo, index) => (
          <div key={todo._id || index} className="data-item">
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
