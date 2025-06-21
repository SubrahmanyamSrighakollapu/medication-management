const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || "your_secret_key";

exports.signup = (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, role],
    function (err) {
      if (err) return res.status(400).json({ error: "User exists or bad input." });
      res.json({ id: this.lastID, username, role });
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "User not found" });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
};
