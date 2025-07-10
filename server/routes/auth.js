const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/Users');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
    console.log('📩 /api/signup hit with:', req.body);
    const { email, password } = req.body;

    try {
    const existing = await User.findOne({ email });
    if (existing) {
        return res.json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true });
    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Signup error' });
    }
});

router.get('/ping', (req, res) => {
  res.json({ message: 'Auth routes are connected!' });
});

module.exports = router;
