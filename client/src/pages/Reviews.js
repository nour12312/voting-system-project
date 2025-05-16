import React, { useState } from 'react';
import yassin from '../Assets/yassin.png';
import omar from '../Assets/omar.png';
import moaz from '../Assets/moaz.png';
import axios from 'axios';

function Reviews() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerNumber: '',
    comment: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/review', formData);
      setMessage('Review submitted successfully!');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerNumber: '',
        comment: ''
      });
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <section className="review" id="review">
      <section className="order">
        <h1 className="heading"><span>Submit </span> Review</h1>

        <div className="row">
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
            </div>

            <textarea
              placeholder="Comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              cols="30"
              rows="10"
              required
            ></textarea>

            <input type="submit" value="Submit Review" className="btn" />
            {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
          </form>
        </div>
      </section>

      <h1 className="heading">Our customers <span>reviews</span> </h1>

      <div className="box-container">
        <div className="box">
          <img src={yassin} alt="" />
          <h3>Yassin Nader</h3>
          <div className="stars">
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
          </div>
          <p>Hands down one of the best burgers I’ve ever had! The smash technique gives it that perfect crispy edge, and the seasoning is on point. The bun was soft, the cheese was melty, and the pickles added just the right tang. Super chill vibe and quick service too — will definitely be back!</p>
        </div>

        <div className="box">
          <img src={omar} alt="" />
          <h3>Omar Tamer</h3>
          <div className="stars">
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="far fa-star" />
          </div>
          <p>An absolute flavor bomb. The Maillard crust on the smash patty adds a beautiful depth, complemented by a perfectly balanced blend of cheese, onions, and house sauce. The bun holds everything together without getting soggy — a small detail, but it makes a huge difference. This place is elevating the smash burger game.</p>
        </div>

        <div className="box">
          <img src={moaz} alt="" />
          <h3>Moaz Mahmoud</h3>
          <div className="stars">
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="far fa-star" />
          </div>
          <p>Yo, this place SLAPS! The smash burger is juicy, crispy, and absolutely loaded with flavor. Took one bite and I was hooked. Fries were fire too, and don’t even get me started on the sauce — next level. If you haven’t been here yet, stop sleeping and go eat one NOW!</p>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
