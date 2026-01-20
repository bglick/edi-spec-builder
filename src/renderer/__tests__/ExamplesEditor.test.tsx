/**
 * Tests for ExamplesEditor Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamplesEditor } from '../components/ExamplesEditor';
import { Specification } from '../../shared/models/edi-types';

describe('ExamplesEditor', () => {
  const createSpecification = (examples: Specification['examples'] = []): Specification => ({
    id: 'spec-1',
    metadata: {
      name: 'Test Spec',
      version: '1.0',
      transactionSet: '810',
      transactionSetName: 'Invoice',
      ediVersion: '005010',
      createdDate: '2024-01-01T00:00:00Z',
      modifiedDate: '2024-01-01T00:00:00Z',
    },
    loops: [],
    examples,
  });

  const defaultProps = {
    specification: createSpecification(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title', () => {
    render(<ExamplesEditor {...defaultProps} />);

    expect(screen.getByText('EDI Examples')).toBeInTheDocument();
  });

  it('displays add example button', () => {
    render(<ExamplesEditor {...defaultProps} />);

    expect(screen.getByText('+ Add Example')).toBeInTheDocument();
  });

  it('shows empty message when no examples', () => {
    render(<ExamplesEditor {...defaultProps} />);

    expect(screen.getByText(/No examples yet/i)).toBeInTheDocument();
  });

  it('adds example when add button clicked', () => {
    render(<ExamplesEditor {...defaultProps} />);

    fireEvent.click(screen.getByText('+ Add Example'));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith(expect.any(Function));
  });

  it('renders existing examples', () => {
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example Invoice',
        description: 'A sample invoice',
        content: 'ISA*00*...',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    expect(screen.getByDisplayValue('Example Invoice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A sample invoice')).toBeInTheDocument();
  });

  it('allows editing example title', () => {
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example Invoice',
        description: '',
        content: '',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const titleInput = screen.getByDisplayValue('Example Invoice');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('allows editing example description', () => {
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example',
        description: 'Old description',
        content: '',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const descInput = screen.getByDisplayValue('Old description');
    fireEvent.change(descInput, { target: { value: 'New description' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('allows editing EDI content', () => {
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example',
        description: '',
        content: 'ISA*00*',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const contentTextarea = screen.getByDisplayValue('ISA*00*');
    fireEvent.change(contentTextarea, { target: { value: 'ISA*00*NEW~' } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('shows delete button for each example', () => {
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example 1',
        description: '',
        content: '',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    expect(screen.getByTitle('Delete example')).toBeInTheDocument();
  });

  it('confirms before deleting example', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const specWithExamples = createSpecification([
      {
        id: 'ex-1',
        title: 'Example 1',
        description: '',
        content: '',
      },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    fireEvent.click(screen.getByTitle('Delete example'));

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('shows move buttons for examples', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    expect(screen.getAllByTitle('Move up')).toHaveLength(2);
    expect(screen.getAllByTitle('Move down')).toHaveLength(2);
  });

  it('disables move up for first example', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const moveUpButtons = screen.getAllByTitle('Move up');
    expect(moveUpButtons[0]).toBeDisabled();
    expect(moveUpButtons[1]).not.toBeDisabled();
  });

  it('disables move down for last example', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const moveDownButtons = screen.getAllByTitle('Move down');
    expect(moveDownButtons[0]).not.toBeDisabled();
    expect(moveDownButtons[1]).toBeDisabled();
  });

  it('moves example up when move up clicked', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const moveUpButtons = screen.getAllByTitle('Move up');
    fireEvent.click(moveUpButtons[1]); // Click move up on second example

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('moves example down when move down clicked', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    const moveDownButtons = screen.getAllByTitle('Move down');
    fireEvent.click(moveDownButtons[0]); // Click move down on first example

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it('displays example number', () => {
    const specWithExamples = createSpecification([
      { id: 'ex-1', title: 'Example 1', description: '', content: '' },
      { id: 'ex-2', title: 'Example 2', description: '', content: '' },
    ]);

    render(<ExamplesEditor specification={specWithExamples} onUpdate={defaultProps.onUpdate} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('displays helpful description text', () => {
    render(<ExamplesEditor {...defaultProps} />);

    expect(screen.getByText(/Add example EDI transactions/i)).toBeInTheDocument();
  });
});
