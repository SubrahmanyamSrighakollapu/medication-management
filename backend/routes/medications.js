const express = require('express');
const router = express.Router();
const db = require('../db');

// Add a medication
router.post('/', (req, res) => {
  const { user_id, name, dosage, frequency } = req.body;
  const created_at = new Date().toISOString();

  const query = `
    INSERT INTO medications (user_id, name, dosage, frequency, created_at)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [user_id, name, dosage, frequency, created_at], function (err) {
    if (err) {
      console.error('Error inserting medication:', err);
      return res.status(500).json({ error: 'Failed to add medication' });
    }
    return res.status(201).json({ id: this.lastID });
  });
});
// ✅ Get all medications for a user with today’s `taken` status
router.get('/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const today = new Date().toLocaleDateString('sv-SE'); 


  const query = `
    SELECT m.*, 
           COALESCE(l.taken, 0) AS taken
    FROM medications m
    LEFT JOIN logs l 
      ON m.id = l.medication_id AND l.date = ?
    WHERE m.user_id = ?
  `;

  db.all(query, [today, userId], (err, rows) => {
    if (err) {
      console.error('Error fetching medications with taken status:', err);
      return res.status(500).json({ error: 'Failed to fetch medications' });
    }
    res.json(rows);
  });
});

// Mark a medication as taken for today
router.patch('/:id/mark-taken', (req, res) => {
  const medicationId = req.params.id;
  const today = new Date().toLocaleDateString('sv-SE'); 


  // Check if already logged for today
  db.get(
    'SELECT * FROM logs WHERE medication_id = ? AND date = ?',
    [medicationId, today],
    (err, row) => {
      if (err) {
        console.error('Error checking log:', err);
        return res.status(500).json({ error: 'Error checking medication log' });
      }

      if (row) {
        // Update existing log
        db.run(
          'UPDATE logs SET taken = 1 WHERE id = ?',
          [row.id],
          (err) => {
            if (err) {
              console.error('Error updating log:', err);
              return res.status(500).json({ error: 'Failed to update log' });
            }
            res.json({ message: 'Marked as taken' });
          }
        );
      } else {
        // Insert new log
        db.run(
          'INSERT INTO logs (medication_id, date, taken) VALUES (?, ?, 1)',
          [medicationId, today],
          (err) => {
            if (err) {
              console.error('Error inserting log:', err);
              return res.status(500).json({ error: 'Failed to log medication' });
            }
            res.json({ message: 'Marked as taken' });
          }
        );
      }
    }
  );
});

// Get adherence percentage for a medication
router.get('/:id/adherence', (req, res) => {
  const medicationId = req.params.id;

  db.get('SELECT created_at FROM medications WHERE id = ?', [medicationId], (err, medRow) => {
    if (err || !medRow) {
      console.error('Error fetching medication start date:', err);
      return res.status(500).json({ error: 'Failed to fetch medication' });
    }

    const createdAt = new Date(medRow.created_at);
    const today = new Date();
    const msInDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((today - createdAt) / msInDay) + 1;

    db.get(
      'SELECT COUNT(*) as takenCount FROM logs WHERE medication_id = ? AND taken = 1',
      [medicationId],
      (err2, logRow) => {
        if (err2) {
          console.error('Error fetching logs:', err2);
          return res.status(500).json({ error: 'Failed to calculate adherence' });
        }

        const takenCount = logRow.takenCount;
        const adherence = totalDays > 0 ? Math.round((takenCount / totalDays) * 100) : 0;

        res.json({
          adherence: `${adherence}%`,
          takenCount,
          totalDays,
        });
      }
    );
  });
});

// GET /medications/:id/history
router.get('/:id/history', (req, res) => {
  const medicationId = req.params.id;
  db.all('SELECT date, taken FROM logs WHERE medication_id = ? ORDER BY date DESC', [medicationId], (err, rows) => {
    if (err) {
      console.error('Error fetching history:', err);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
    res.json(rows);
  });
});

// Update a medication
router.put('/:id', (req, res) => {
  const medicationId = req.params.id;
  const { name, dosage, frequency } = req.body;

  const query = `
    UPDATE medications 
    SET name = ?, dosage = ?, frequency = ? 
    WHERE id = ?
  `;

  db.run(query, [name, dosage, frequency, medicationId], function (err) {
    if (err) {
      console.error('Error updating medication:', err);
      return res.status(500).json({ error: 'Failed to update medication' });
    }

    return res.json({ message: 'Medication updated successfully' });
  });
});

// Delete a medication and its logs
router.delete('/:id', (req, res) => {
  const medicationId = req.params.id;

  // First delete associated logs (if required)
  db.run('DELETE FROM logs WHERE medication_id = ?', [medicationId], function (err) {
    if (err) {
      console.error('Error deleting logs:', err);
      return res.status(500).json({ error: 'Failed to delete logs' });
    }

    // Then delete the medication
    db.run('DELETE FROM medications WHERE id = ?', [medicationId], function (err2) {
      if (err2) {
        console.error('Error deleting medication:', err2);
        return res.status(500).json({ error: 'Failed to delete medication' });
      }

      return res.json({ message: 'Medication deleted successfully' });
    });
  });
});



module.exports = router;



