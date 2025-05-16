const express = require('express');
const router = express.Router();
const Order = require('../models/orderSchema.js');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Create new order
router.post('/', async (req, res) => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    await Order.updateMany(
      { status: 'ongoing', startedAt: { $lt: thirtyMinsAgo } },
      { status: 'completed' }
    );

    const ongoingOrders = await Order.countDocuments({ status: 'ongoing' });

    let orderData = req.body;

    if (ongoingOrders < 5) {
      orderData.status = 'ongoing';
      orderData.startedAt = new Date();
    } else {
      orderData.status = 'queued';
      orderData.startedAt = null;
    }

    const order = new Order(orderData);
    const saved = await order.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ongoing orders
router.get('/ongoing', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, status: 'ongoing' });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ongoing orders' });
  }
});

// Get past orders
router.get('/past', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, status: 'completed' });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch past orders' });
  }
});

// Cancel an order
router.delete('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'ongoing') {
      return res.status(400).json({ message: 'Only ongoing orders can be canceled' });
    }

    order.status = 'canceled';
    await order.save();

    res.json({ message: 'Order canceled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel the order' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    await Order.updateMany(
      { status: 'ongoing', startedAt: { $lt: thirtyMinsAgo } },
      { status: 'completed' }
    );

    const ongoingOrders = await Order.countDocuments({ status: 'ongoing' });

    let orderData = req.body;

    if (ongoingOrders < 5) {
      orderData.status = 'ongoing';
      orderData.startedAt = new Date();
    } else {
      orderData.status = 'queued';
      orderData.startedAt = null;
    }

    // 👇 Attach the authenticated user's ID
    orderData.userId = req.user._id;

    const order = new Order(orderData);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your orders' });
  }
});

module.exports = router;
