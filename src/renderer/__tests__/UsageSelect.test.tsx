/**
 * Tests for UsageSelect Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsageSelect } from '../components/UsageSelect';
import { UsageType } from '../../shared/models/edi-types';

describe('UsageSelect', () => {
  it('renders with initial value', () => {
    const onChange = jest.fn();
    render(<UsageSelect value="M" onChange={onChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('M');
  });

  it('displays all usage options', () => {
    const onChange = jest.fn();
    render(<UsageSelect value="M" onChange={onChange} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('M - Mandatory');
    expect(options[1]).toHaveTextContent('O - Optional');
    expect(options[2]).toHaveTextContent('C - Conditional');
  });

  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    render(<UsageSelect value="M" onChange={onChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'O' } });

    expect(onChange).toHaveBeenCalledWith('O');
  });

  it('renders in compact mode', () => {
    const onChange = jest.fn();
    render(<UsageSelect value="M" onChange={onChange} compact />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('handles all usage types', () => {
    const usageTypes: UsageType[] = ['M', 'O', 'C'];
    const onChange = jest.fn();

    usageTypes.forEach(usage => {
      const { unmount } = render(<UsageSelect value={usage} onChange={onChange} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(usage);
      unmount();
    });
  });
});
