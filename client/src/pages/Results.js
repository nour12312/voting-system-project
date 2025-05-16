import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, ProgressBar, Badge } from 'react-bootstrap';
import axios from 'axios';

const Results = () => {
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/votes/${id}/results`);
                setResults(response.data.election);
            } catch (error) {
                setError('Failed to fetch election results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <h3>Loading results...</h3>
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

    if (!results) {
        return (
            <Container className="text-center mt-5">
                <h3>No results available</h3>
            </Container>
        );
    }

    return (
        <Container>
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>{results.title}</h2>
                        <Badge bg={results.status === 'completed' ? 'secondary' : 'success'}>
                            {results.status}
                        </Badge>
                    </div>
                    <Card.Text>{results.description}</Card.Text>
                    <div className="text-muted">
                        <small>Total Votes: {results.totalVotes}</small>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <h3>Results</h3>
                    {results.results.map((candidate) => (
                        <div key={candidate._id} className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center">
                                    <h5 className="mb-0">{candidate.name}</h5>
                                </div>
                                <span className="text-muted">
                                    {candidate.votes} votes ({candidate.percentage}%)
                                </span>
                            </div>
                            <ProgressBar
                                now={parseFloat(candidate.percentage)}
                                label={`${candidate.percentage}%`}
                                variant={candidate.percentage > 50 ? 'success' : 'primary'}
                            />
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Results; 