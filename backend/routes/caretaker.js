const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all patients
router.get('/patients', authenticateToken, (req, res) => {
  db.all("SELECT id, username FROM users WHERE role = 'patient'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch patients' });
    res.json(rows);
  });
});

// Get medications for a specific patient
router.get('/medications/:user_id', authenticateToken, (req, res) => {
  const userId = req.params.user_id;
  db.all('SELECT * FROM medications WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch medications' });
    res.json(rows);
  });
});



module.exports = router;