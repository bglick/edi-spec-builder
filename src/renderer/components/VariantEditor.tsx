/**
 * Variant Editor Component
 * Allows editing of loop/segment variants with discriminator rules
 */

import React, { useCallback } from 'react';
import { Variant, DiscriminatorRule } from '../../shared/models/edi-types';
import { v4 as uuidv4 } from 'uuid';
import { UsageSelect } from './UsageSelect';

interface VariantEditorProps {
  variant: Variant;
  onUpdate: (updates: Partial<Variant>) => void;
  onDelete: () => void;
}

export function VariantEditor({ variant, onUpdate, onDelete }: VariantEditorProps) {
  const handleAddDiscriminator = useCallback(() => {
    const newRule: DiscriminatorRule = {
      elementId: '',
      operator: 'equals',
      values: [''],
    };
    onUpdate({ discriminators: [...variant.discriminators, newRule] });
  }, [variant.discriminators, onUpdate]);

  const handleUpdateDiscriminator = useCallback(
    (index: number, updates: Partial<DiscriminatorRule>) => {
      const discriminators = variant.discriminators.map((d, i) =>
        i === index ? { ...d, ...updates } : d
      );
      onUpdate({ discriminators });
    },
    [variant.discriminators, onUpdate]
  );

  const handleDeleteDiscriminator = useCallback(
    (index: number) => {
      const discriminators = variant.discriminators.filter((_, i) => i !== index);
      onUpdate({ discriminators });
    },
    [variant.discriminators, onUpdate]
  );

  return (
    <div
      className="card mb-4"
      style={{
        boxShadow: 'none',
        border: '1px solid var(--color-accent)',
        backgroundColor: '#f7fafc',
      }}
    >
      <div className="card-header" style={{ backgroundColor: 'rgba(49, 130, 206, 0.1)' }}>
        <input
          type="text"
          className="form-input"
          style={{ fontWeight: 600, padding: '4px 8px', width: 'auto', minWidth: '200px' }}
          value={variant.label}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="Variant label (e.g., Ship To Party)"
        />
        <button className="btn btn-danger btn-sm btn-icon" onClick={onDelete} title="Delete variant">
          ×
        </button>
      </div>
      <div className="card-body">
        <div className="section">
          <div className="flex items-center justify-between mb-2">
            <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)' }}>
              Discriminator Rules
            </h5>
            <button className="btn btn-secondary btn-sm" onClick={handleAddDiscriminator}>
              + Add Rule
            </button>
          </div>
          <p className="text-sm text-muted mb-4">
            Define conditions that identify when this variant applies.
          </p>

          {variant.discriminators.length === 0 ? (
            <p className="text-muted text-sm" style={{ fontStyle: 'italic' }}>
              No discriminator rules defined. Add rules to specify when this variant applies.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {variant.discriminators.map((rule, index) => (
                <DiscriminatorRuleRow
                  key={index}
                  rule={rule}
                  index={index}
                  onUpdate={updates => handleUpdateDiscriminator(index, updates)}
                  onDelete={() => handleDeleteDiscriminator(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="section mt-4">
          <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>
            Overrides
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Usage Override</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!variant.usageOverride}
                  onChange={e => onUpdate({ usageOverride: e.target.checked ? 'M' : undefined })}
                />
                {variant.usageOverride && (
                  <UsageSelect
                    value={variant.usageOverride}
                    onChange={usage => onUpdate({ usageOverride: usage })}
                    compact
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="section mt-4">
          <div className="form-group">
            <label className="form-label">Variant Comments</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '60px' }}
              value={variant.comments || ''}
              onChange={e => onUpdate({ comments: e.target.value })}
              placeholder="Additional notes about this variant..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiscriminatorRuleRowProps {
  rule: DiscriminatorRule;
  index: number;
  onUpdate: (updates: Partial<DiscriminatorRule>) => void;
  onDelete: () => void;
}

function DiscriminatorRuleRow({ rule, onUpdate, onDelete }: DiscriminatorRuleRowProps) {
  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(',').map(v => v.trim());
    onUpdate({ values });
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <input
        type="text"
        className="form-input"
        style={{ width: '100px', padding: '4px 8px' }}
        value={rule.elementId}
        onChange={e => onUpdate({ elementId: e.target.value })}
        placeholder="Element ID"
      />
      <select
        className="form-select"
        style={{ width: '100px', padding: '4px 8px' }}
        value={rule.operator}
        onChange={e => onUpdate({ operator: e.target.value as 'equals' | 'one-of' })}
      >
        <option value="equals">=</option>
        <option value="one-of">in</option>
      </select>
      <input
        type="text"
        className="form-input"
        style={{ flex: 1, padding: '4px 8px', fontFamily: 'var(--font-mono)' }}
        value={rule.values.join(', ')}
        onChange={handleValuesChange}
        placeholder={rule.operator === 'one-of' ? 'ST, BT, SU' : 'ST'}
      />
      <button className="btn btn-secondary btn-sm btn-icon" onClick={onDelete} title="Remove rule">
        ×
      </button>
    </div>
  );
}
