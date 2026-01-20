/**
 * Specification Metadata Editor Component
 * Allows editing of specification-level metadata
 */

import React from 'react';
import { Specification } from '../../shared/models/edi-types';

interface SpecificationEditorProps {
  specification: Specification;
  onUpdate: (updater: (spec: Specification) => Specification) => void;
}

export function SpecificationEditor({ specification, onUpdate }: SpecificationEditorProps) {
  const { metadata } = specification;

  const updateMetadata = (updates: Partial<typeof metadata>) => {
    onUpdate(spec => ({
      ...spec,
      metadata: { ...spec.metadata, ...updates },
    }));
  };

  return (
    <div className="editor">
      <div className="card">
        <div className="card-header">
          <h3>Specification Metadata</h3>
        </div>
        <div className="card-body">
          <div className="section">
            <h4 className="section-title">Basic Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Specification Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={metadata.name}
                  onChange={e => updateMetadata({ name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Version</label>
                <input
                  type="text"
                  className="form-input"
                  value={metadata.version}
                  onChange={e => updateMetadata({ version: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Transaction Set ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={metadata.transactionSet}
                  onChange={e => updateMetadata({ transactionSet: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transaction Set Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={metadata.transactionSetName}
                  onChange={e => updateMetadata({ transactionSetName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">EDI Version</label>
                <select
                  className="form-select"
                  value={metadata.ediVersion}
                  onChange={e => updateMetadata({ ediVersion: e.target.value })}
                >
                  <option value="004010">004010</option>
                  <option value="005010">005010</option>
                  <option value="005020">005020</option>
                  <option value="006010">006010</option>
                  <option value="006020">006020</option>
                  <option value="007010">007010</option>
                  <option value="007020">007020</option>
                  <option value="008010">008010</option>
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Partner Information</h4>
            <div className="form-group">
              <label className="form-label">Trading Partner</label>
              <input
                type="text"
                className="form-input"
                value={metadata.partner || ''}
                onChange={e => updateMetadata({ partner: e.target.value })}
                placeholder="Partner name or identifier"
              />
              <span className="form-hint">Optional. The trading partner this specification is intended for.</span>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Description</h4>
            <div className="form-group">
              <textarea
                className="form-textarea"
                style={{ minHeight: '120px' }}
                value={metadata.description || ''}
                onChange={e => updateMetadata({ description: e.target.value })}
                placeholder="Describe the purpose and scope of this implementation specification..."
              />
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Document Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Created</label>
                <input
                  type="text"
                  className="form-input"
                  value={new Date(metadata.createdDate).toLocaleString()}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Modified</label>
                <input
                  type="text"
                  className="form-input"
                  value={new Date(metadata.modifiedDate).toLocaleString()}
                  disabled
                />
              </div>
            </div>
            {metadata.baseSpecReference && (
              <div className="form-group">
                <label className="form-label">Base Specification</label>
                <input
                  type="text"
                  className="form-input"
                  value={metadata.baseSpecReference}
                  disabled
                />
                <span className="form-hint">This specification was created from an OpenEDI base spec.</span>
              </div>
            )}
          </div>

          <div className="section">
            <h4 className="section-title">Statistics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <StatCard
                label="Loops"
                value={countLoops(specification.loops)}
              />
              <StatCard
                label="Segments"
                value={countSegments(specification.loops)}
              />
              <StatCard
                label="Elements"
                value={countElements(specification.loops)}
              />
              <StatCard
                label="Examples"
                value={specification.examples.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-alt)',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

function countLoops(loops: any[]): number {
  let count = loops.length;
  for (const loop of loops) {
    count += countLoops(loop.loops || []);
  }
  return count;
}

function countSegments(loops: any[]): number {
  let count = 0;
  for (const loop of loops) {
    count += loop.segments?.length || 0;
    count += countSegments(loop.loops || []);
  }
  return count;
}

function countElements(loops: any[]): number {
  let count = 0;
  for (const loop of loops) {
    for (const segment of loop.segments || []) {
      count += segment.elements?.length || 0;
    }
    count += countElements(loop.loops || []);
  }
  return count;
}
