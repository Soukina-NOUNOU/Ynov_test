import { render, screen } from '@testing-library/react';
import App from './App';

test('renders registration form', () => {
  render(<App />);
  const registrationTitle = screen.getByText(/inscription/i);
  expect(registrationTitle).toBeInTheDocument();
});

test('renders registration form with all required fields', () => {
  render(<App />);
  expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
  expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/date de naissance/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /s'enregistrer/i })).toBeInTheDocument();
});
