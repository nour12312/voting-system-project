import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateElection = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [candidates, setCandidates] = useState([{ name: '', description: '' }]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddCandidate = () => {
        setCandidates([...candidates, { name: '', description: '' }]);
    };

    const handleRemoveCandidate = (index) => {
        const newCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(newCandidates);
    };

    const handleCandidateChange = (index, field, value) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!title || !description || !startDate || !endDate) {
            setError('Please fill in all required fields');
            return;
        }

        if (candidates.length < 2) {
            setError('Please add at least two candidates');
            return;
        }

        if (candidates.some(c => !c.name)) {
            setError('Please fill in all candidate names');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            setError('End date must be after start date');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await axios.post('http://localhost:5000/api/elections', {
                title,
                description,
                startDate,
                endDate,
                candidates
            });
            navigate('/elections');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create election');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Card>
                <Card.Body>
                    <h2 className="mb-4">Create New Election</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <h4 className="mb-3">Candidates</h4>
                        {candidates.map((candidate, index) => (
                            <Card key={index} className="mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Candidate {index + 1}</h5>
                                        {candidates.length > 1 && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveCandidate(index)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={candidate.name}
                                            onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={candidate.description}
                                            onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        ))}

                        <Button
                            type="button"
                            variant="outline-primary"
                            className="mb-3"
                            onClick={handleAddCandidate}
                        >
                            Add Candidate
                        </Button>

                        <div className="d-grid">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Election'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateElection; 