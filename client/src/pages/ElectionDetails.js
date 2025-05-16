import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [election, setElection] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/elections/${id}`);
                setElection(response.data);
            } catch (error) {
                setError('Failed to fetch election details');
            } finally {
                setLoading(false);
            }
        };

        fetchElection();
    }, [id]);

    const handleVote = async (e) => {
        e.preventDefault();
        if (!selectedCandidate) {
            setError('Please select a candidate');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await axios.post(`http://localhost:5000/api/votes/${id}`, {
                candidateId: selectedCandidate
            });
            setSuccess('Vote cast successfully!');
            setTimeout(() => {
                navigate(`/results/${id}`);
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to cast vote');
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <h3>Loading election details...</h3>
            </Container>
        );
    }

    if (!election) {
        return (
            <Container className="text-center mt-5">
                <h3 className="text-danger">Election not found</h3>
            </Container>
        );
    }

    const hasVoted = election.voters.includes(user?._id);
    const isActive = election.status === 'active';

    return (
        <Container>
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>{election.title}</h2>
                        <Badge bg={isActive ? 'success' : 'secondary'}>
                            {election.status}
                        </Badge>
                    </div>
                    <Card.Text>{election.description}</Card.Text>
                    <div className="text-muted">
                        <small>
                            Start Date: {new Date(election.startDate).toLocaleDateString()}
                        </small>
                        <br />
                        <small>
                            End Date: {new Date(election.endDate).toLocaleDateString()}
                        </small>
                    </div>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {isActive && !hasVoted && user && (
                <Card>
                    <Card.Body>
                        <h3>Cast Your Vote</h3>
                        <Form onSubmit={handleVote}>
                            <Form.Group className="mb-3">
                                {election.candidates.map((candidate) => (
                                    <div key={candidate._id} className="d-flex align-items-center mb-3">
                                        <Form.Check
                                            type="radio"
                                            id={candidate._id}
                                            label={candidate.name}
                                            name="candidate"
                                            value={candidate._id}
                                            onChange={(e) => setSelectedCandidate(e.target.value)}
                                            className="mb-0"
                                        />
                                    </div>
                                ))}
                            </Form.Group>
                            <Button type="submit" variant="primary">
                                Submit Vote
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {hasVoted && (
                <Alert variant="info">
                    You have already voted in this election.
                    <Button
                        variant="link"
                        className="float-end"
                        onClick={() => navigate(`/results/${id}`)}
                    >
                        View Results
                    </Button>
                </Alert>
            )}

            {!user && (
                <Alert variant="warning">
                    Please log in to vote in this election.
                </Alert>
            )}

            {!isActive && (
                <Alert variant="info">
                    This election is not currently active.
                    <Button
                        variant="link"
                        className="float-end"
                        onClick={() => navigate(`/results/${id}`)}
                    >
                        View Results
                    </Button>
                </Alert>
            )}
        </Container>
    );
};

export default ElectionDetails; 