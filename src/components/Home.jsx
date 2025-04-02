import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

const API_BASE_URL = "http://localhost:3000"; // Change this if your backend is deployed

function Home() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos when the component loads
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add a new todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/todos`, {
        text: inputValue,
        completed: false,
      });
      setTodos([...todos, response.data]);
      setInputValue("");
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Edit a todo
  const handleEdit = async (id) => {
    const updatedValue = prompt("Edit todo:", "");
    if (!updatedValue.trim()) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/api/todos/${id}`, {
        text: updatedValue,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (error) {
      console.error("Error updating todo:", error);
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
          placeholder="Enter a task"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
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
