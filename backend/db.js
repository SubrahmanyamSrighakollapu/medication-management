const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'medication.db'), (err) => {
  if (err) {
    console.error("DB Connection failed", err);
  } else {
    console.log("Connected to SQLite");
  }
});

module.exports = db;
