import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  box-sizing: border-box;
  position: relative;

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const RegisterCard = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#181818' : '#fff'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: stretch;
  justify-content: center;
  margin: auto;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  /* Add logo as background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/socialazy-logo.svg') center center no-repeat;
    background-size: 60% auto;
    opacity: 0.07;
    z-index: 0;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    box-shadow: none;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoginLink = styled(Link)`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AuthText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  font-size: 0.875rem;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const FieldError = styled.div`
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  img {
    height: 60px;
    width: auto;
  }
`;

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear field-specific error when user starts typing
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({
                ...prev,
                [e.target.name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            console.log('Attempting registration with data:', { ...formData, password: '[REDACTED]' });
            const response = await register(formData);
            console.log('Registration successful:', response);
            navigate('/');
        } catch (error) {
            console.error('Registration error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            
            // Handle network errors
            if (!error.response) {
                setError('Network error. Please check your internet connection.');
                return;
            }

            // Handle validation errors from backend
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                console.log('Validation errors:', errors);
                const fieldErrorMap = {};
                errors.forEach(err => {
                    fieldErrorMap[err.field] = err.message;
                });
                setFieldErrors(fieldErrorMap);
            } 
            // Handle general error message from backend
            else if (error.response?.data?.message) {
                console.log('Backend error message:', error.response.data.message);
                setError(error.response.data.message);
            }
            // Handle other types of errors
            else {
                console.log('Unknown error type:', error);
                setError('Failed to register. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <RegisterContainer>
            <RegisterCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                {/* <Logo>
                    <img src="/socialazy-logo.svg" alt="sociaLazy" />
                </Logo> */}
                <Title>Create Account</Title>
                <Subtitle>Join sociaLazy and start sharing</Subtitle>

                <Form onSubmit={handleSubmit} noValidate>
                    <InputGroup>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            className={fieldErrors.username ? 'error' : ''}
                        />
                        {fieldErrors.username && <FieldError>{fieldErrors.username}</FieldError>}
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={fieldErrors.email ? 'error' : ''}
                        />
                        {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={fieldErrors.password ? 'error' : ''}
                        />
                        {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                        />
                    </InputGroup>

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <AuthText>
                        Already have an account? <LoginLink to="/login">Sign in</LoginLink>
                    </AuthText>
                </Form>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default Register; 