/**
 * Tests for NewSpecModal Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewSpecModal } from '../components/NewSpecModal';

describe('NewSpecModal', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with title', () => {
    render(<NewSpecModal {...defaultProps} />);

    expect(screen.getByText('New Specification')).toBeInTheDocument();
  });

  it('displays transaction set dropdown', () => {
    render(<NewSpecModal {...defaultProps} />);

    expect(screen.getByText('Transaction Set')).toBeInTheDocument();
    const select = screen.getAllByRole('combobox')[0];
    expect(select).toBeInTheDocument();
  });

  it('displays common transaction sets in dropdown', () => {
    render(<NewSpecModal {...defaultProps} />);

    expect(screen.getByText('810 - Invoice')).toBeInTheDocument();
    expect(screen.getByText('850 - Purchase Order')).toBeInTheDocument();
    expect(screen.getByText('856 - Ship Notice/Manifest (ASN)')).toBeInTheDocument();
  });

  it('displays EDI version dropdown', () => {
    render(<NewSpecModal {...defaultProps} />);

    expect(screen.getByText('EDI Version')).toBeInTheDocument();
    expect(screen.getByText('005010 (HIPAA)')).toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', () => {
    render(<NewSpecModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking overlay', () => {
    render(<NewSpecModal {...defaultProps} />);

    const overlay = screen.getByText('New Specification').closest('.modal')?.parentElement;
    fireEvent.click(overlay!);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking modal content', () => {
    render(<NewSpecModal {...defaultProps} />);

    const modal = screen.getByText('New Specification').closest('.modal');
    fireEvent.click(modal!);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onCreate with correct parameters when create clicked', () => {
    render(<NewSpecModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Create Specification'));

    expect(defaultProps.onCreate).toHaveBeenCalledWith('810', 'Invoice', '005010');
  });

  it('allows custom specification name', () => {
    render(<NewSpecModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Invoice');
    fireEvent.change(nameInput, { target: { value: 'My Custom Spec' } });
    fireEvent.click(screen.getByText('Create Specification'));

    expect(defaultProps.onCreate).toHaveBeenCalledWith('810', 'My Custom Spec', '005010');
  });

  it('allows selecting different transaction set', () => {
    render(<NewSpecModal {...defaultProps} />);

    const tsSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(tsSelect, { target: { value: '850' } });
    fireEvent.click(screen.getByText('Create Specification'));

    expect(defaultProps.onCreate).toHaveBeenCalledWith('850', 'Purchase Order', '005010');
  });

  it('allows selecting different EDI version', () => {
    render(<NewSpecModal {...defaultProps} />);

    const versionSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(versionSelect, { target: { value: '004010' } });
    fireEvent.click(screen.getByText('Create Specification'));

    expect(defaultProps.onCreate).toHaveBeenCalledWith('810', 'Invoice', '004010');
  });

  it('shows custom transaction set input when selected', () => {
    render(<NewSpecModal {...defaultProps} />);

    const tsSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(tsSelect, { target: { value: 'custom' } });

    expect(screen.getByText('Custom Transaction Set ID')).toBeInTheDocument();
  });

  it('disables create button when custom TS is empty', () => {
    render(<NewSpecModal {...defaultProps} />);

    const tsSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(tsSelect, { target: { value: 'custom' } });

    const createButton = screen.getByText('Create Specification');
    expect(createButton).toBeDisabled();
  });

  it('enables create button when custom TS is filled', () => {
    render(<NewSpecModal {...defaultProps} />);

    const tsSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(tsSelect, { target: { value: 'custom' } });

    const customInput = screen.getByPlaceholderText('e.g., 810');
    fireEvent.change(customInput, { target: { value: '999' } });

    const createButton = screen.getByText('Create Specification');
    expect(createButton).not.toBeDisabled();
  });

  it('has healthcare transaction sets', () => {
    render(<NewSpecModal {...defaultProps} />);

    expect(screen.getByText('270 - Eligibility Inquiry')).toBeInTheDocument();
    expect(screen.getByText('835 - Claim Payment/Advice')).toBeInTheDocument();
    expect(screen.getByText('837 - Health Care Claim')).toBeInTheDocument();
  });
});
