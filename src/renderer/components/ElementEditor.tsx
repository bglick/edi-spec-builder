/**
 * Element Editor Component
 * Allows detailed editing of element properties, codes, and examples
 */

import React, { useCallback, useState } from 'react';
import { Specification, Loop, Segment, Element, CodeValue } from '../../shared/models/edi-types';
import { UsageSelect } from './UsageSelect';

interface ElementEditorProps {
  element: Element;
  path: string[];
  specification: Specification;
  onUpdate: (updater: (spec: Specification) => Specification) => void;
}

export function ElementEditor({ element, path, specification, onUpdate }: ElementEditorProps) {
  const updateElement = useCallback(
    (updates: Partial<Element>) => {
      onUpdate(spec => {
        const updateInLoops = (loops: Loop[], targetPath: string[], depth: number): Loop[] => {
          return loops.map(loop => {
            if (loop.id === targetPath[depth]) {
              if (depth === targetPath.length - 3) {
                // We're at the loop containing the segment
                return {
                  ...loop,
                  segments: loop.segments.map(seg => {
                    if (seg.id === targetPath[depth + 1]) {
                      return {
                        ...seg,
                        elements: seg.elements.map(el =>
                          el.id === targetPath[depth + 2] ? { ...el, ...updates } : el
                        ),
                      };
                    }
                    return seg;
                  }),
                };
              }
              return {
                ...loop,
                loops: updateInLoops(loop.loops, targetPath, depth + 1),
              };
            }
            return loop;
          });
        };
        return { ...spec, loops: updateInLoops(spec.loops, path, 0) };
      });
    },
    [onUpdate, path]
  );

  const handleToggleCode = useCallback(
    (codeValue: string) => {
      const codeValues = (element.codeValues || []).map(c =>
        c.code === codeValue ? { ...c, included: !c.included } : c
      );
      updateElement({ codeValues });
    },
    [element.codeValues, updateElement]
  );

  const handleUpdateCodeDescription = useCallback(
    (codeValue: string, description: string) => {
      const codeValues = (element.codeValues || []).map(c =>
        c.code === codeValue ? { ...c, description, isCustomDescription: true } : c
      );
      updateElement({ codeValues });
    },
    [element.codeValues, updateElement]
  );

  const handleAddCode = useCallback(() => {
    const newCode: CodeValue = {
      code: '',
      description: '',
      included: true,
      isCustomDescription: true,
    };
    updateElement({ codeValues: [...(element.codeValues || []), newCode] });
  }, [element.codeValues, updateElement]);

  const handleUpdateCode = useCallback(
    (index: number, updates: Partial<CodeValue>) => {
      const codeValues = (element.codeValues || []).map((c, i) =>
        i === index ? { ...c, ...updates } : c
      );
      updateElement({ codeValues });
    },
    [element.codeValues, updateElement]
  );

  const handleDeleteCode = useCallback(
    (index: number) => {
      const codeValues = (element.codeValues || []).filter((_, i) => i !== index);
      updateElement({ codeValues });
    },
    [element.codeValues, updateElement]
  );

  const handleSelectAllCodes = useCallback(() => {
    const codeValues = (element.codeValues || []).map(c => ({ ...c, included: true }));
    updateElement({ codeValues });
  }, [element.codeValues, updateElement]);

  const handleDeselectAllCodes = useCallback(() => {
    const codeValues = (element.codeValues || []).map(c => ({ ...c, included: false }));
    updateElement({ codeValues });
  }, [element.codeValues, updateElement]);

  const [codeFilter, setCodeFilter] = useState('');

  const includedCodes = (element.codeValues || []).filter(c => c.included);
  const excludedCodes = (element.codeValues || []).filter(c => !c.included);

  const filteredCodes = (element.codeValues || [])
    .map((c, i) => ({ code: c, originalIndex: i }))
    .filter(({ code: c }) => {
      if (!codeFilter) return true;
      const lower = codeFilter.toLowerCase();
      return c.code.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower);
    });

  return (
    <div className="editor">
      <div className="card">
        <div className="card-header">
          <h3>
            {String(element.position).padStart(2, '0')} - {element.name}
          </h3>
        </div>
        <div className="card-body">
          <div className="section">
            <h4 className="section-title">Basic Properties</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Position</label>
                <input
                  type="number"
                  className="form-input"
                  value={element.position}
                  onChange={e => updateElement({ position: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={element.name}
                  onChange={e => updateElement({ name: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Data Type</label>
                <select
                  className="form-select"
                  value={element.dataType}
                  onChange={e => updateElement({ dataType: e.target.value })}
                >
                  <option value="AN">AN - Alphanumeric</option>
                  <option value="ID">ID - Identifier</option>
                  <option value="N0">N0 - Numeric (no decimal)</option>
                  <option value="N2">N2 - Numeric (2 decimal)</option>
                  <option value="R">R - Decimal</option>
                  <option value="DT">DT - Date</option>
                  <option value="TM">TM - Time</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Length</label>
                <input
                  type="number"
                  className="form-input"
                  value={element.minLength}
                  onChange={e => updateElement({ minLength: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Length</label>
                <input
                  type="number"
                  className="form-input"
                  value={element.maxLength}
                  onChange={e => updateElement({ maxLength: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">Usage</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Usage</label>
                <UsageSelect
                  value={element.usage}
                  onChange={usage => updateElement({ usage })}
                />
                {element.baseUsage && element.usage !== element.baseUsage && (
                  <span className="form-hint">Base: {element.baseUsage}</span>
                )}
              </div>
            </div>

            {element.usage === 'C' && (
              <div className="form-group mt-4">
                <label className="form-label">Condition Description</label>
                <textarea
                  className="form-textarea"
                  value={element.conditionDescription || ''}
                  onChange={e => updateElement({ conditionDescription: e.target.value })}
                  placeholder="Describe when this element is required..."
                />
              </div>
            )}
          </div>

          <div className="section">
            <h4 className="section-title">Comments & Example</h4>
            <div className="form-group">
              <label className="form-label">Comments</label>
              <textarea
                className="form-textarea"
                value={element.comments || ''}
                onChange={e => updateElement({ comments: e.target.value })}
                placeholder="Add implementation notes or comments..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Example Value</label>
              <input
                type="text"
                className="form-input font-mono"
                value={element.example?.value || ''}
                onChange={e => updateElement({ example: e.target.value ? { value: e.target.value, description: element.example?.description } : undefined })}
                placeholder="Example value for documentation"
              />
            </div>
          </div>

          {(element.codeValues && element.codeValues.length > 0) || element.dataType === 'ID' ? (
            <div className="section">
              <div className="flex items-center justify-between mb-4">
                <h4 className="section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  Code Values ({includedCodes.length} included, {excludedCodes.length} excluded)
                </h4>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={handleSelectAllCodes}>
                    Select All
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleDeselectAllCodes}>
                    Deselect All
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleAddCode}>
                    + Add Code
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by code or description..."
                  value={codeFilter}
                  onChange={e => setCodeFilter(e.target.value)}
                />
              </div>

              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Include</th>
                      <th style={{ width: '100px' }}>Code</th>
                      <th>Description</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCodes.map(({ code, originalIndex }) => (
                      <tr key={originalIndex} style={{ opacity: code.included ? 1 : 0.5 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={code.included}
                            onChange={() => handleToggleCode(code.code)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input font-mono"
                            style={{ padding: '4px 8px' }}
                            value={code.code}
                            onChange={e => handleUpdateCode(originalIndex, { code: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px' }}
                            value={code.description}
                            onChange={e => handleUpdateCodeDescription(code.code, e.target.value)}
                          />
                          {code.isCustomDescription && (
                            <span className="text-sm text-muted"> (custom)</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => handleDeleteCode(originalIndex)}
                            title="Delete code"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
