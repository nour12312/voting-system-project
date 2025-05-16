import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import ElectionDetails from './pages/ElectionDetails';
import CreateElection from './pages/CreateElection';
import Results from './pages/Results';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navigation />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/elections/:id" element={<ElectionDetails />} />
          <Route path="/results/:id" element={<Results />} />
          <Route
            path="/create-election"
            element={
              <PrivateRoute>
                <CreateElection />
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App;
