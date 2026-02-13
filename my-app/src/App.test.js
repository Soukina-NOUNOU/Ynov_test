import { render, screen } from '@testing-library/react';
import App from './App';

test('renders registration form', () => {
  render(<App />);
  const registrationTitle = screen.getByText(/inscription/i);
  expect(registrationTitle).toBeInTheDocument();
});

test('renders registration form with firstname and lastname required fields', () => {
  render(<App />);
  expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
  expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /s'enregistrer/i })).toBeInTheDocument();
});
