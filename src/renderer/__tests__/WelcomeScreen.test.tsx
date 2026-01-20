/**
 * Tests for WelcomeScreen Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '../components/WelcomeScreen';

describe('WelcomeScreen', () => {
  const defaultProps = {
    onNew: jest.fn(),
    onOpen: jest.fn(),
    onImport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message', () => {
    render(<WelcomeScreen {...defaultProps} />);

    expect(screen.getByText('EDI Specification Builder')).toBeInTheDocument();
    expect(screen.getByText(/Create, edit, and export/i)).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(<WelcomeScreen {...defaultProps} />);

    expect(screen.getByText('New Specification')).toBeInTheDocument();
    expect(screen.getByText('Open Specification')).toBeInTheDocument();
    expect(screen.getByText('Import OpenEDI')).toBeInTheDocument();
  });

  it('calls onNew when new button clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const newButton = screen.getByText('New Specification').closest('button');
    fireEvent.click(newButton!);

    expect(defaultProps.onNew).toHaveBeenCalledTimes(1);
  });

  it('calls onOpen when open button clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const openButton = screen.getByText('Open Specification').closest('button');
    fireEvent.click(openButton!);

    expect(defaultProps.onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onImport when import button clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const importButton = screen.getByText('Import OpenEDI').closest('button');
    fireEvent.click(importButton!);

    expect(defaultProps.onImport).toHaveBeenCalledTimes(1);
  });

  it('displays keyboard shortcuts', () => {
    render(<WelcomeScreen {...defaultProps} />);

    expect(screen.getByText('Keyboard shortcuts:')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+E')).toBeInTheDocument();
  });

  it('shows button descriptions', () => {
    render(<WelcomeScreen {...defaultProps} />);

    expect(screen.getByText('Create a new EDI specification from scratch')).toBeInTheDocument();
    expect(screen.getByText('Open an existing .edispec file')).toBeInTheDocument();
    expect(screen.getByText('Import from EdiNation OpenEDI format')).toBeInTheDocument();
  });
});
