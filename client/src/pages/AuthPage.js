import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ Name: '', Email: '', Password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? 'http://localhost:5000/user/login'
      : 'http://localhost:5000/user/register';

    try {
      const res = await axios.post(url, form);
      const token = res.data.token;

      if (isLogin && token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userName', res.data.user.Name);
        onAuthSuccess(token);
        navigate('/'); 
      } else {
        setMessage('Registered successfully! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred');
    }
  };

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '80px auto',
      padding: '30px',
      border: '2px solid red',
      borderRadius: '10px',
      backgroundColor: '#fbeaea',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      color: 'red',
      textAlign: 'center',
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid red',
      borderRadius: '6px',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: 'red',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    toggle: {
      marginTop: '20px',
      textAlign: 'center',
      color: '#c0392b',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    message: {
      marginTop: '15px',
      textAlign: 'center',
      color: '#444',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            style={styles.input}
            type="text"
            name="Name"
            placeholder="Name"
            value={form.Name}
            onChange={handleChange}
            required
          />
        )}
        <input
          style={styles.input}
          type="email"
          name="Email"
          placeholder="Email"
          value={form.Email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="password"
          name="Password"
          placeholder="Password"
          value={form.Password}
          onChange={handleChange}
          required
        />
        <button style={styles.button} type="submit">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div style={styles.toggle} onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have an account? Register"
          : 'Already have an account? Login'}
      </div>
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
};

export default AuthPage;