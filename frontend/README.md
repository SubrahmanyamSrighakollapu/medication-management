
# Caretaker-Patient Medication Tracker

A full-stack web application for managing and tracking medication adherence between patients and caretakers.

## Features

- Signup/Login with role-based access (Patient or Caretaker)
- Patient dashboard to mark medications as taken
- Caretaker dashboard to monitor multiple patients’ adherence
- View patient medication history
- Role-switching between caretaker and patient
- Responsive and styled with Bootstrap

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/caretaker-dashboard.git
cd caretaker-dashboard
```

### 2. Install Dependencies
```bash
# For frontend
cd frontend
npm install

# For backend
cd backend
npm install
```

### 3. Configure Environment
Ensure you have a `db.sqlite3` file in the root or set up the database based on `server/db.js`.

### 4. Start the Application
```bash
# Terminal 1: Backend
cd frontend
node server.js

# Terminal 2: Frontend
cd backend
npm start
```

The app runs on `http://localhost:3000`.

---

## ✅ Form Validation & Error Messages

### Signup Validation
- Username is **required** and must be at least 3 characters.
- Password is **required** and must be at least 6 characters.
- Role must be selected (`patient` or `caretaker`).

### Login Validation
- Username and Password are both required.
- On error (e.g., wrong credentials), shows "Login failed. Please check your credentials."

---

## 🧪 Testing (with Vitest)

Sample tests included:
- Validating form input rules (min length, required)
- Testing API call success/failure states
- Role-based redirection logic

To run tests:
```bash
npm run test
```

---

## 💡 Git Best Practices

Use meaningful commit messages, such as:
- `feat: add caretaker dashboard with patient overview`
- `fix: improve signup validation with error messages`
- `test: add vitest tests for login form`

---

## 🔐 Auth

- JWT is used for authentication.
- Token is stored in `localStorage`.
- Protected routes using middleware (`authMiddleware.js`).

---

## 🧩 Technologies Used

- **Frontend**: React, React Router, Axios, Bootstrap
- **Backend**: Express, SQLite3
- **Testing**: Vitest