import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TextField from './TextField';

describe('TextField', () => {
  it('links the label to the input', () => {
    render(<TextField label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('exposes the error message to assistive technology', () => {
    render(
      <TextField label="Email" error="Email is required." value="" onChange={() => {}} />,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Email is required.');
  });
});
