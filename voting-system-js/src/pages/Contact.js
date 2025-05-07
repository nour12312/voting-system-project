import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('All fields are required.');
      return;
    }
    // Simulate saving to localStorage
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push(form);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    setSubmitted(true);
    setError('');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container">
      <h1>Contact Us</h1>
      {submitted && <p style={{ color: 'green' }}>Thank you for your message!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label>Message:</label>
          <textarea name="message" value={form.message} onChange={handleChange} />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Contact; 