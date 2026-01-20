/**
 * Examples Editor Component
 * Manages EDI example samples for the specification appendix
 */

import React, { useCallback } from 'react';
import { Specification, ExampleEDI } from '../../shared/models/edi-types';
import { v4 as uuidv4 } from 'uuid';

interface ExamplesEditorProps {
  specification: Specification;
  onUpdate: (updater: (spec: Specification) => Specification) => void;
}

export function ExamplesEditor({ specification, onUpdate }: ExamplesEditorProps) {
  const handleAddExample = useCallback(() => {
    const newExample: ExampleEDI = {
      id: uuidv4(),
      title: `Example ${specification.examples.length + 1}`,
      description: '',
      content: '',
    };
    onUpdate(spec => ({
      ...spec,
      examples: [...spec.examples, newExample],
    }));
  }, [specification.examples.length, onUpdate]);

  const handleUpdateExample = useCallback(
    (exampleId: string, updates: Partial<ExampleEDI>) => {
      onUpdate(spec => ({
        ...spec,
        examples: spec.examples.map(ex =>
          ex.id === exampleId ? { ...ex, ...updates } : ex
        ),
      }));
    },
    [onUpdate]
  );

  const handleDeleteExample = useCallback(
    (exampleId: string) => {
      if (!confirm('Are you sure you want to delete this example?')) return;
      onUpdate(spec => ({
        ...spec,
        examples: spec.examples.filter(ex => ex.id !== exampleId),
      }));
    },
    [onUpdate]
  );

  const handleMoveExample = useCallback(
    (exampleId: string, direction: 'up' | 'down') => {
      onUpdate(spec => {
        const index = spec.examples.findIndex(ex => ex.id === exampleId);
        if (index === -1) return spec;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= spec.examples.length) return spec;

        const newExamples = [...spec.examples];
        [newExamples[index], newExamples[newIndex]] = [newExamples[newIndex], newExamples[index]];

        return { ...spec, examples: newExamples };
      });
    },
    [onUpdate]
  );

  return (
    <div className="editor">
      <div className="card">
        <div className="card-header">
          <h3>EDI Examples</h3>
          <button className="btn btn-primary btn-sm" onClick={handleAddExample}>
            + Add Example
          </button>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">
            Add example EDI transactions to include in the specification appendix.
            Examples help trading partners understand expected message formats.
          </p>

          {specification.examples.length === 0 ? (
            <div className="welcome-screen" style={{ padding: '40px', minHeight: 'auto' }}>
              <p>No examples yet. Click "Add Example" to create one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {specification.examples.map((example, index) => (
                <ExampleCard
                  key={example.id}
                  example={example}
                  index={index}
                  total={specification.examples.length}
                  onUpdate={updates => handleUpdateExample(example.id, updates)}
                  onDelete={() => handleDeleteExample(example.id)}
                  onMoveUp={() => handleMoveExample(example.id, 'up')}
                  onMoveDown={() => handleMoveExample(example.id, 'down')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExampleCardProps {
  example: ExampleEDI;
  index: number;
  total: number;
  onUpdate: (updates: Partial<ExampleEDI>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ExampleCard({
  example,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ExampleCardProps) {
  return (
    <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
      <div className="card-header" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="flex items-center gap-2">
          <span className="text-muted text-sm">#{index + 1}</span>
          <input
            type="text"
            className="form-input"
            style={{ fontWeight: 600, padding: '4px 8px', width: 'auto', minWidth: '200px' }}
            value={example.title}
            onChange={e => onUpdate({ title: e.target.value })}
            placeholder="Example title"
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary btn-sm btn-icon"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
          >
            ↑
          </button>
          <button
            className="btn btn-secondary btn-sm btn-icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
          >
            ↓
          </button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={onDelete} title="Delete example">
            ×
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <input
            type="text"
            className="form-input"
            value={example.description || ''}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="Brief description of this example scenario"
          />
        </div>
        <div className="form-group">
          <label className="form-label">EDI Content</label>
          <textarea
            className="form-textarea font-mono"
            style={{ minHeight: '200px', fontSize: '12px', lineHeight: 1.4 }}
            value={example.content}
            onChange={e => onUpdate({ content: e.target.value })}
            placeholder="ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *230101*1200*^*00501*000000001*0*P*:~
GS*IN*SENDERID*RECEIVERID*20230101*1200*1*X*005010~
ST*810*0001~
...
SE*10*0001~
GE*1*1~
IEA*1*000000001~"
            spellCheck={false}
          />
          <span className="form-hint">
            Enter the complete EDI interchange (ISA through IEA). Content will be preserved exactly as entered.
          </span>
        </div>
      </div>
    </div>
  );
}
