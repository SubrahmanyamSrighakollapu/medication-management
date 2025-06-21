import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Card,
  Button,
  Modal,
  Row,
  Col,
  ProgressBar,
  Spinner,
  Table,
} from 'react-bootstrap';

function CaretakerDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const switchToPatient = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.activeRole = 'patient';
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard/patient');
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/caretaker/patients');
      const detailedPatients = await Promise.all(
        res.data.map(async (patient) => {
          const medsRes = await api.get(`/medications/${patient.id}`);
          const adherence = await Promise.all(
            medsRes.data.map((m) =>
              api.get(`/medications/${m.id}/adherence`).then((res) => res.data.adherence)
            )
          );
          const avgAdherence =
            adherence.length > 0
              ? Math.round(
                  adherence
                    .map((a) => parseInt(a.replace('%', '')))
                    .reduce((a, b) => a + b, 0) / adherence.length
                )
              : 0;

          const lastTaken = medsRes.data
            .filter((m) => m.taken)
            .map((m) => m.name)
            .join(', ') || 'N/A';

          return {
            ...patient,
            adherence: avgAdherence,
            lastTaken,
            medications: medsRes.data,
          };
        })
      );
      setPatients(detailedPatients);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  const openPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    try {
      const allLogs = [];
      for (let med of patient.medications) {
        const res = await api.get(`/medications/${med.id}/history`);
        res.data.forEach((log) => {
          allLogs.push({
            medName: med.name,
            date: log.date,
            taken: log.taken,
            description: med.description || 'No description', // Include description
          });
        });
      }
      setHistory(allLogs.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setShowModal(true);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Caretaker Dashboard</h2>
        <Button variant="outline-secondary" onClick={switchToPatient}>
          Switch to Patient
        </Button>
      </div>

      <Row>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center p-4 bg-info bg-opacity-10 text-info rounded">
            <h4>📋 No Patients Assigned</h4>
            <p>Contact admin to add patients.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <Col key={patient.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3">{patient.username}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Avg Adherence: {patient.adherence}%
                  </Card.Subtitle>
                  <ProgressBar
                    now={patient.adherence}
                    label={`${patient.adherence}%`}
                    variant={
                      patient.adherence > 80
                        ? 'success'
                        : patient.adherence > 50
                        ? 'warning'
                        : 'danger'
                    }
                    className="mb-3"
                  />
                  <Card.Text className="flex-grow-1">
                    <strong>Last Taken:</strong> {patient.lastTaken}
                  </Card.Text>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-auto"
                    onClick={() => openPatientHistory(patient)}
                  >
                    View History
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Medication History - {selectedPatient?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : history.length === 0 ? (
            <p>No logs available.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.medName}</td>
                    <td>{log.date}</td>
                    <td>
                      <span
                        className={`badge ${log.taken ? 'bg-success' : 'bg-danger'}`}
                      >
                        {log.taken ? 'Taken' : 'Missed'}
                      </span>
                    </td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CaretakerDashboard;