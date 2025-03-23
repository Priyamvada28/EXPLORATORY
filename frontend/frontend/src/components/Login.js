// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './Login.css';

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !status) {
//       setError('Please fill all required fields');
//       return;
//     }

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/login/', { email, status });

//       const { token } = response.data; // Extract token properly
//       localStorage.setItem('token', token); // Store token in localStorage
  
//       onLogin(response.data); // Set user data
//       navigate('/lab'); // Redirect to the lab page
//     } catch (err) {
//       setError(err.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Login</h2>
//       {error && <div className="error-message">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Email</label>
//           <input 
//             type="email" 
//             value={email} 
//             onChange={(e) => setEmail(e.target.value)} 
//             required 
//           />
//         </div>
//         <div>
//           <label>Status</label>
//           <select value={status} onChange={(e) => setStatus(e.target.value)} required>
//             <option value="">Select Status</option>
//             <option value="Student">Student</option>
//             <option value="Professor">Professor</option>
//           </select>
//         </div>
//         <button type="submit">Login</button>
//       </form>
//       <p>Don't have an account? <a href="/signup">Sign up</a></p>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !status) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { email, status });

      const { token, userData } = response.data; // Extract token and user data properly

      // Store email and token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('email', email); // Store email separately

      // Ensure email is included in the user object
      onLogin({ ...userData, email }); 

      navigate('/lab'); // Redirect to the lab page
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">Select Status</option>
            <option value="Student">Student</option>
            <option value="Professor">Professor</option>
          </select>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
  );
};

export default Login;



