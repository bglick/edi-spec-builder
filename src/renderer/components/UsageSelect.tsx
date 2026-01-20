/**
 * Usage Select Component
 * Dropdown for selecting usage type (Mandatory, Optional, Conditional)
 */

import React from 'react';
import { UsageType } from '../../shared/models/edi-types';

interface UsageSelectProps {
  value: UsageType;
  onChange: (usage: UsageType) => void;
  compact?: boolean;
}

export function UsageSelect({ value, onChange, compact }: UsageSelectProps) {
  return (
    <select
      className="form-select"
      style={compact ? { padding: '4px 8px' } : undefined}
      value={value}
      onChange={e => onChange(e.target.value as UsageType)}
    >
      <option value="M">M - Mandatory</option>
      <option value="O">O - Optional</option>
      <option value="C">C - Conditional</option>
    </select>
  );
}
