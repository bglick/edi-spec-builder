/**
 * New Specification Modal
 * Dialog for creating a new specification
 */

import React, { useState } from 'react';
import { TRANSACTION_SET_TEMPLATES } from '../../shared/utils/openedi-importer';

interface NewSpecModalProps {
  onClose: () => void;
  onCreate: (transactionSet: string, name: string, version: string) => void;
}

export function NewSpecModal({ onClose, onCreate }: NewSpecModalProps) {
  const [transactionSet, setTransactionSet] = useState('810');
  const [customTs, setCustomTs] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('005010');

  const handleCreate = () => {
    const ts = transactionSet === 'custom' ? customTs : transactionSet;
    if (!ts) return;

    const template = TRANSACTION_SET_TEMPLATES[ts];
    const specName = name || template?.name || `Transaction Set ${ts}`;

    onCreate(ts, specName, version);
  };

  const selectedTemplate = TRANSACTION_SET_TEMPLATES[transactionSet];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Specification</h3>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Transaction Set</label>
            <select
              className="form-select"
              value={transactionSet}
              onChange={e => setTransactionSet(e.target.value)}
            >
              <optgroup label="Common Transaction Sets">
                <option value="810">810 - Invoice</option>
                <option value="850">850 - Purchase Order</option>
                <option value="855">855 - Purchase Order Acknowledgment</option>
                <option value="856">856 - Ship Notice/Manifest (ASN)</option>
                <option value="820">820 - Payment Order/Remittance Advice</option>
                <option value="997">997 - Functional Acknowledgment</option>
              </optgroup>
              <optgroup label="Transportation">
                <option value="204">204 - Motor Carrier Load Tender</option>
                <option value="210">210 - Freight Details and Invoice</option>
                <option value="214">214 - Shipment Status Message</option>
              </optgroup>
              <optgroup label="Healthcare">
                <option value="270">270 - Eligibility Inquiry</option>
                <option value="271">271 - Eligibility Response</option>
                <option value="276">276 - Claim Status Request</option>
                <option value="277">277 - Claim Status Response</option>
                <option value="834">834 - Benefit Enrollment</option>
                <option value="835">835 - Claim Payment/Advice</option>
                <option value="837">837 - Health Care Claim</option>
              </optgroup>
              <optgroup label="Other">
                <option value="999">999 - Implementation Acknowledgment</option>
                <option value="custom">Custom Transaction Set...</option>
              </optgroup>
            </select>
            {selectedTemplate && (
              <span className="form-hint">{selectedTemplate.description}</span>
            )}
          </div>

          {transactionSet === 'custom' && (
            <div className="form-group">
              <label className="form-label">Custom Transaction Set ID</label>
              <input
                type="text"
                className="form-input"
                value={customTs}
                onChange={e => setCustomTs(e.target.value)}
                placeholder="e.g., 810"
                maxLength={3}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Specification Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={selectedTemplate?.name || 'Specification name'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">EDI Version</label>
            <select
              className="form-select"
              value={version}
              onChange={e => setVersion(e.target.value)}
            >
              <option value="004010">004010</option>
              <option value="005010">005010 (HIPAA)</option>
              <option value="005020">005020</option>
              <option value="006010">006010</option>
              <option value="006020">006020</option>
              <option value="007010">007010</option>
              <option value="007020">007020</option>
              <option value="008010">008010</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={transactionSet === 'custom' && !customTs}
          >
            Create Specification
          </button>
        </div>
      </div>
    </div>
  );
}
