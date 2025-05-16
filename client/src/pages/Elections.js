import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Elections = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEdit, setShowEdit] = useState(false);
    const [editElection, setEditElection] = useState(null);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/elections');
            setElections(response.data);
        } catch (error) {
            setError('Failed to fetch elections');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            upcoming: 'warning',
            active: 'success',
            completed: 'secondary'
        };
        return <Badge bg={variants[status]}>{status}</Badge>;
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this election?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/elections/${id}`);
            fetchElections();
        } catch (err) {
            alert('Failed to delete election.');
        }
    };

    const handleEdit = (election) => {
        setEditElection(election);
        setEditStartDate(election.startDate ? new Date(election.startDate).toISOString().slice(0, 16) : '');
        setEditEndDate(election.endDate ? new Date(election.endDate).toISOString().slice(0, 16) : '');
        setShowEdit(true);
    };

    const handleEditSave = async () => {
        try {
            await axios.put(`http://localhost:5000/api/elections/${editElection._id}`, {
                startDate: editStartDate,
                endDate: editEndDate
            });
            setShowEdit(false);
            fetchElections();
        } catch (err) {
            alert('Failed to update election dates.');
        }
    };

    const handleToggleActive = async (election) => {
        try {
            const newStatus = election.status === 'active' ? 'upcoming' : 'active';
            await axios.put(`http://localhost:5000/api/elections/${election._id}`, {
                status: newStatus
            });
            fetchElections();
        } catch (err) {
            alert('Failed to update election status.');
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <h3>Loading elections...</h3>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center mt-5">
                <h3 className="text-danger">{error}</h3>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="mb-4">Elections</h2>
            <Row className="g-4">
                {elections.map((election) => (
                    <Col key={election._id} md={6} lg={4}>
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center">
                                    {election.title}
                                    {getStatusBadge(election.status)}
                                </Card.Title>
                                <Card.Text>{election.description}</Card.Text>
                                <div className="mt-3">
                                    <small className="text-muted">
                                        Start: {new Date(election.startDate).toLocaleDateString()}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                        End: {new Date(election.endDate).toLocaleDateString()}
                                    </small>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <Button
                                            as={Link}
                                            to={`/elections/${election._id}`}
                                            variant="primary"
                                            className="me-2"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            as={Link}
                                            to={`/results/${election._id}`}
                                            variant="outline-secondary"
                                        >
                                            View Results
                                        </Button>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div className="d-flex flex-column align-items-end">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="mb-1"
                                                onClick={() => handleDelete(election._id)}
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="mb-1"
                                                onClick={() => handleEdit(election)}
                                            >
                                                Edit Dates
                                            </Button>
                                            <Button
                                                variant={election.status === 'active' ? 'secondary' : 'success'}
                                                size="sm"
                                                onClick={() => handleToggleActive(election)}
                                            >
                                                {election.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Election Dates</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={editStartDate}
                                onChange={e => setEditStartDate(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={editEndDate}
                                onChange={e => setEditEndDate(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Elections; 