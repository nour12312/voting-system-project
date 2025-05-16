import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <Container>
            <Row className="mb-5">
                <Col>
                    <div className="text-center">
                        <h1 className="display-4 mb-4">Welcome to the Online Voting System</h1>
                        <p className="lead">
                            A secure and user-friendly platform for conducting online elections
                        </p>
                        {!user && (
                            <div className="mt-4">
                                <Link to="/register" className="btn btn-primary me-2">
                                    Get Started
                                </Link>
                                <Link to="/login" className="btn btn-outline-primary">
                                    Log In
                                </Link>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title>Secure Voting</Card.Title>
                            <Card.Text>
                                Our platform ensures secure and anonymous voting with advanced encryption
                                and authentication mechanisms.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title>Real-time Results</Card.Title>
                            <Card.Text>
                                Get instant access to election results with real-time updates and
                                detailed analytics.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title>Easy Management</Card.Title>
                            <Card.Text>
                                Create and manage elections effortlessly with our intuitive admin
                                dashboard.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {user && (
                <Row className="mt-5">
                    <Col>
                        <div className="text-center">
                            <h2>Ready to Vote?</h2>
                            <Link to="/elections" className="btn btn-primary mt-3">
                                View Active Elections
                            </Link>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Home;