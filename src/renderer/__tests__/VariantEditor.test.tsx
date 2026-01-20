/**
 * Tests for VariantEditor Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VariantEditor } from '../components/VariantEditor';
import { Variant } from '../../shared/models/edi-types';

describe('VariantEditor', () => {
  const defaultVariant: Variant = {
    id: 'var-1',
    label: 'Ship To Party',
    discriminators: [],
  };

  const defaultProps = {
    variant: defaultVariant,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders variant label', () => {
    render(<VariantEditor {...defaultProps} />);

    const labelInput = screen.getByDisplayValue('Ship To Party');
    expect(labelInput).toBeInTheDocument();
  });

  it('allows editing variant label', () => {
    render(<VariantEditor {...defaultProps} />);

    const labelInput = screen.getByDisplayValue('Ship To Party');
    fireEvent.change(labelInput, { target: { value: 'Bill To Party' } });

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ label: 'Bill To Party' });
  });

  it('calls onDelete when delete button clicked', () => {
    render(<VariantEditor {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete variant');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('displays discriminator rules section', () => {
    render(<VariantEditor {...defaultProps} />);

    expect(screen.getByText('Discriminator Rules')).toBeInTheDocument();
    expect(screen.getByText('+ Add Rule')).toBeInTheDocument();
  });

  it('shows message when no discriminators defined', () => {
    render(<VariantEditor {...defaultProps} />);

    expect(screen.getByText(/No discriminator rules defined/i)).toBeInTheDocument();
  });

  it('adds discriminator when add rule clicked', () => {
    render(<VariantEditor {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add Rule'));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      discriminators: expect.arrayContaining([
        expect.objectContaining({
          elementId: '',
          operator: 'equals',
          values: [''],
        }),
      ]),
    });
  });

  it('renders existing discriminators', () => {
    const variantWithDiscriminators: Variant = {
      ...defaultVariant,
      discriminators: [
        {
          elementId: 'N101',
          operator: 'equals',
          values: ['ST'],
        },
      ],
    };

    render(<VariantEditor {...defaultProps} variant={variantWithDiscriminators} />);

    expect(screen.getByDisplayValue('N101')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ST')).toBeInTheDocument();
  });

  it('allows editing discriminator element ID', () => {
    const variantWithDiscriminators: Variant = {
      ...defaultVariant,
      discriminators: [
        {
          elementId: 'N101',
          operator: 'equals',
          values: ['ST'],
        },
      ],
    };

    render(<VariantEditor {...defaultProps} variant={variantWithDiscriminators} />);

    const elementInput = screen.getByDisplayValue('N101');
    fireEvent.change(elementInput, { target: { value: 'N102' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('allows changing discriminator operator', () => {
    const variantWithDiscriminators: Variant = {
      ...defaultVariant,
      discriminators: [
        {
          elementId: 'N101',
          operator: 'equals',
          values: ['ST'],
        },
      ],
    };

    render(<VariantEditor {...defaultProps} variant={variantWithDiscriminators} />);

    const operatorSelect = screen.getByDisplayValue('=');
    fireEvent.change(operatorSelect, { target: { value: 'one-of' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('allows editing discriminator values', () => {
    const variantWithDiscriminators: Variant = {
      ...defaultVariant,
      discriminators: [
        {
          elementId: 'N101',
          operator: 'one-of',
          values: ['ST', 'BT'],
        },
      ],
    };

    render(<VariantEditor {...defaultProps} variant={variantWithDiscriminators} />);

    const valuesInput = screen.getByDisplayValue('ST, BT');
    fireEvent.change(valuesInput, { target: { value: 'ST, BT, SU' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('allows deleting discriminator', () => {
    const variantWithDiscriminators: Variant = {
      ...defaultVariant,
      discriminators: [
        {
          elementId: 'N101',
          operator: 'equals',
          values: ['ST'],
        },
      ],
    };

    render(<VariantEditor {...defaultProps} variant={variantWithDiscriminators} />);

    const removeButton = screen.getByTitle('Remove rule');
    fireEvent.click(removeButton);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      discriminators: [],
    });
  });

  it('displays overrides section', () => {
    render(<VariantEditor {...defaultProps} />);

    expect(screen.getByText('Overrides')).toBeInTheDocument();
    expect(screen.getByText('Usage Override')).toBeInTheDocument();
  });

  it('allows enabling usage override', () => {
    render(<VariantEditor {...defaultProps} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ usageOverride: 'M' });
  });

  it('shows usage select when override enabled', () => {
    const variantWithOverride: Variant = {
      ...defaultVariant,
      usageOverride: 'M',
    };

    render(<VariantEditor {...defaultProps} variant={variantWithOverride} />);

    expect(screen.getByDisplayValue('M - Mandatory')).toBeInTheDocument();
  });

  it('displays variant comments textarea', () => {
    render(<VariantEditor {...defaultProps} />);

    expect(screen.getByText('Variant Comments')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Additional notes/i)).toBeInTheDocument();
  });

  it('allows editing variant comments', () => {
    render(<VariantEditor {...defaultProps} />);

    const commentsInput = screen.getByPlaceholderText(/Additional notes/i);
    fireEvent.change(commentsInput, { target: { value: 'Test comment' } });

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ comments: 'Test comment' });
  });

  it('displays existing comments', () => {
    const variantWithComments: Variant = {
      ...defaultVariant,
      comments: 'This is a test comment',
    };

    render(<VariantEditor {...defaultProps} variant={variantWithComments} />);

    expect(screen.getByDisplayValue('This is a test comment')).toBeInTheDocument();
  });
});
