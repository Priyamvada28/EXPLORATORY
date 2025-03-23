import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !status) {
      setError('Please fill all required fields');
      return;
    }
    if (status === 'Student' && !year) {
      setError('Please select your year');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/signup/', {
        name, email, status, year: status === 'Student' ? year : null
      });
      setSuccess(response.data.message);
      setError('');
      setTimeout(() => navigate('/'), 2000); // Redirect after 2 sec
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setSuccess('');
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">Select Status</option>
            <option value="Student">Student</option>
            <option value="Professor">Professor</option>
          </select>
        </div>
        {status === 'Student' && (
          <div>
            <label>Year</label>
            <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        )}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;