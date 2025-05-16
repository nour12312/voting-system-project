import React, { useState } from 'react';
import order from '../Assets/order.png';
import axios from 'axios';

function Order() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerNumber: '',
    deliveryAddress: '',
    foodOrder: ''
  });

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/order', formData);

      setStatus(res.data.status);
      setMessage('Order placed successfully!');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerNumber: '',
        deliveryAddress: '',
        foodOrder: ''
      });
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
      setStatus('');
    }
  };

  return (
    <section className="order" id="order">
      <h1 className="heading"><span>Order</span> Now</h1>

      <div className="row">
        <div className="image">
          <img src={order} alt="Order now" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inputBox">
            <input
              type="text"
              placeholder="Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="inputBox">
            <input
              type="tel"
              placeholder="Number"
              name="customerNumber"
              value={formData.customerNumber}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Food name"
              name="foodOrder"
              value={formData.foodOrder}
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            placeholder="Address"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            cols="30"
            rows="10"
            required
          />

          <input type="submit" value="Order now" className="btn" />

          {message && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'green' }}>{message}</p>
              {status === 'ongoing' && (
                <p style={{ color: 'blue' }}>Your order is being prepared!</p>
              )}
              {status === 'queued' && (
                <p style={{ color: 'orange' }}>
                  All chefs are busy! Your order is in the queue and will start soon.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default Order;
