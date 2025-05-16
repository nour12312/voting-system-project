import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to log in');
        }
        setLoading(false);
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Log In</h2>
                    {error && (
                        <>
                            <Alert variant="danger">{error}</Alert>
                            {error === 'Invalid credentials' && (
                                <div className="text-center mb-2">
                                    <Link to="/forgot-password">Forgot Password?</Link>
                                </div>
                            )}
                        </>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button
                            disabled={loading}
                            className="w-100"
                            type="submit"
                        >
                            Log In
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Link to="/register">Need an account? Sign Up</Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login; 