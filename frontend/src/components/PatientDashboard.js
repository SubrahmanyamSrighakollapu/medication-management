import React, { useEffect, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Card, Row, Col, Container, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

function PatientDashboard() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [calendarLogs, setCalendarLogs] = useState([]);
  const [missedLogs, setMissedLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [userId] = useState(localStorage.getItem('user_id'));
  const [todayTaken, setTodayTaken] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

 const fetchMedications = useCallback(async () => {
  try {
    const res = await api.get(`/medications/${userId}`);
    setMedications(res.data);

    // ✅ Check logs for today's date only
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const takenToday = res.data.some(med => med.taken && med.taken_date === todayStr);
    setTodayTaken(takenToday);
  } catch {
    toast.error('Failed to fetch medications');
  }
}, [userId]);


  const fetchCalendarLogs = async () => {
    try {
      const takenDates = [];
      const missedDates = [];
      for (const med of medications) {
        const res = await api.get(`/medications/${med.id}/history`);
        res.data.forEach(entry => {
          if (entry.taken) takenDates.push(entry.date);
          else missedDates.push(entry.date);
        });
      }
      setCalendarLogs([...new Set(takenDates)]);
      setMissedLogs([...new Set(missedDates)]);
    } catch {
      toast.error('Error loading calendar data');
    }
  };

const getStatusLabel = (date = new Date()) => {
    const dateStr = date.toLocaleDateString('sv-SE');
    if (calendarLogs.includes(dateStr)) return '✅ Completed';
    if (missedLogs.includes(dateStr)) return '❌ Missed';
    return '⏳ Pending';
  };
  const calculateStreak = () => {
    let streak = 0;
    const takenSet = new Set(calendarLogs);
    for (let i = 0; ; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('sv-SE');
      if (takenSet.has(dateStr)) streak++;
      else break;
    }
    return streak;
  };

  const calculateMonthlyRate = () => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const totalDays = new Date().getDate();
    const count = calendarLogs.filter(date => date.startsWith(thisMonth)).length;
    return Math.round((count / totalDays) * 100);
  };

  const markAllAsTaken = async () => {
    try {
      for (const med of medications) {
        if (!med.taken) {
          await api.patch(`/medications/${med.id}/mark-taken`);
        }
      }
      setTodayTaken(true);
      toast.success('All medications marked as taken');
      fetchMedications();
      fetchCalendarLogs();
    } catch {
      toast.error('Failed to mark medications');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      toast.warning('Please fill in all fields before saving.');
      return;
    }
    try {
      if (editingMed) {
        await api.put(`/medications/${editingMed.id}`, { name, dosage, frequency });
        toast.success('Medication updated');
      } else {
        await api.post(`/medications/`, { user_id: userId, name, dosage, frequency });
        toast.success('Medication added');
      }
      setShowModal(false);
      setName('');
      setDosage('');
      setFrequency('');
      setEditingMed(null);
      fetchMedications();
    } catch {
      toast.error('Error saving medication');
    }
  };

  const handleEdit = (med) => {
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setEditingMed(med);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medications/${id}`);
      toast.success('Medication deleted');
      fetchMedications();
    } catch {
      toast.error('Failed to delete medication');
    }
  };

  const renderCalendarTile = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = date.toLocaleDateString('sv-SE');
    const todayStr = new Date().toLocaleDateString('sv-SE');
    if (calendarLogs.includes(dateStr)) return <div className="bg-success rounded-circle mx-auto mt-1" style={{ width: 10, height: 10 }}></div>;
    if (missedLogs.includes(dateStr)) return <div className="bg-danger rounded-circle mx-auto mt-1" style={{ width: 10, height: 10 }}></div>;
    if (dateStr === todayStr) return <div className="border border-primary rounded-circle mx-auto mt-1" style={{ width: 10, height: 10 }}></div>;
    return null;
  };

  const switchToCaretaker = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.activeRole = 'caretaker';
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard/caretaker');
  };

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    if (medications.length > 0) fetchCalendarLogs();
  }, [medications]);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good Morning!');
    else if (currentHour < 17) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');
  }, []);

  const renderStatusCard = () => {
    const dateStr = selectedDate.toLocaleDateString('sv-SE');
    const todayStr = new Date().toLocaleDateString('sv-SE');

    if (medications.length === 0) {
      return <Card className="text-center shadow-sm p-3"><Card.Body>No medications added. Please add medications to get started.</Card.Body></Card>;
    }

    if (dateStr === todayStr && todayTaken) {
      return (
        <Card className="border-success text-success shadow-sm p-3">
          <Card.Body>
            <h5>✅ Medication Completed!</h5>
            <p>You’ve taken your medications for today.</p>
          </Card.Body>
        </Card>
      );
    }

    if (calendarLogs.includes(dateStr)) {
      return (
        <Card className="border-success text-success shadow-sm p-3">
          <Card.Body>
            <h5>✅ Medications Taken</h5>
            <p>You took medications on {selectedDate.toDateString()}.</p>
          </Card.Body>
        </Card>
      );
    }

    if (missedLogs.includes(dateStr)) {
      return (
        <Card className="border-danger text-danger shadow-sm p-3">
          <Card.Body>
            <h5>❌ Medications Missed</h5>
            <p>You missed medications on {selectedDate.toDateString()}.</p>
          </Card.Body>
        </Card>
      );
    }

    if (dateStr === todayStr) {
      return (
        <>
          {medications.map((med) => (
            <Card key={med.id} className="mb-3 shadow-sm">
              <Card.Body className="d-flex justify-content-between">
                <div>
                  <Card.Title>{med.name}</Card.Title>
                  <Card.Text className="text-muted">{med.dosage} | {med.frequency}</Card.Text>
                </div>
                <div>
                  <Button size="sm" variant="outline-primary" onClick={() => handleEdit(med)}><FaEdit /></Button>{' '}
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(med.id)}><FaTrash /></Button>
                </div>
              </Card.Body>
            </Card>
          ))}
          <div className="text-center mt-3">
            <Button variant="outline-info" className="mb-2">📷 Take Proof Photo</Button><br />
            <Button variant="success" onClick={markAllAsTaken}>✓ Mark All as Taken</Button>
          </div>
        </>
      );
    }

    return (
      <Card className="border-warning text-warning shadow-sm p-3">
        <Card.Body>
          <h5>⚠️ No Records</h5>
          <p>No data for {selectedDate.toDateString()}.</p>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-4">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      <Row className="mb-3 align-items-center">
        <Col><h3>Patient Dashboard</h3></Col>
        <Col className="text-end">
          <Button
            variant="outline-primary me-2"
            onClick={() => {
              if (todayTaken) {
                toast.warning('Today medication is already completed');
                return;
              }
              setShowModal(true);
            }}
          >
            + Add Medication
          </Button>
          <Button variant="outline-secondary" onClick={switchToCaretaker}>Switch to Caretaker</Button>
        </Col>
      </Row>

      <Card className="bg-primary text-white p-4 mb-4 shadow-sm">
        <h4>{greeting}</h4>
        <p>Ready to stay on track with your medication?</p>
        <Row className="text-center fw-bold mt-3">
          <Col>📅 {calculateStreak()}<br />Day Streak</Col>
          <Col>{getStatusLabel(new Date())}<br />Today's Status</Col>
          <Col>📈 {calculateMonthlyRate()}%<br />Monthly Rate</Col>
        </Row>
      </Card>

      <Row>
        <Col md={8}>
          <h5>{selectedDate.toDateString()} Medication</h5>
          {renderStatusCard()}
        </Col>
        <Col md={4}>
          <h5>Medication Calendar</h5>
          <Calendar
            tileContent={renderCalendarTile}
            className="w-100 border rounded shadow-sm"
            onClickDay={setSelectedDate}
          />
          <div className="mt-3 small">
            <p><span className="badge bg-success me-2">●</span> Taken</p>
            <p><span className="badge bg-danger me-2">●</span> Missed</p>
            <p><span className="badge bg-primary me-2">●</span> Today</p>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingMed(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingMed ? 'Edit Medication' : 'Add Medication'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tablet Name</Form.Label>
              <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dosage</Form.Label>
              <Form.Control value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Control value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditingMed(null); }}>Cancel</Button>
          <Button variant="success" onClick={handleSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PatientDashboard;
