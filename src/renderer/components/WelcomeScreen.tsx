/**
 * Welcome Screen Component
 * Initial screen shown when no specification is loaded
 */

import React from 'react';

interface WelcomeScreenProps {
  onNew: () => void;
  onOpen: () => void;
  onImport: () => void;
}

export function WelcomeScreen({ onNew, onOpen, onImport }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          EDI Specification Builder
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
          Create, edit, and export ANSI X12 EDI implementation specifications
        </p>
      </div>

      <div className="welcome-actions" style={{ flexDirection: 'column', gap: '12px', width: '300px' }}>
        <ActionButton
          icon="+"
          title="New Specification"
          description="Create a new EDI specification from scratch"
          onClick={onNew}
          primary
        />
        <ActionButton
          icon="📂"
          title="Open Specification"
          description="Open an existing .edispec file"
          onClick={onOpen}
        />
        <ActionButton
          icon="📥"
          title="Import OpenEDI"
          description="Import from EdiNation OpenEDI format"
          onClick={onImport}
        />
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', width: '300px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Need sample specifications to import?
        </p>
        <a
          href="https://edination.edifabric.com/edi-spec-library.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-accent)',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Download from EDI Nation Spec Library
        </a>
      </div>

      <div style={{ marginTop: '32px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        <p style={{ marginBottom: '8px' }}>
          <strong>Keyboard shortcuts:</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
          <span>Ctrl+N</span><span>New specification</span>
          <span>Ctrl+O</span><span>Open file</span>
          <span>Ctrl+S</span><span>Save</span>
          <span>Ctrl+E</span><span>Export PDF</span>
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}

function ActionButton({ icon, title, description, onClick, primary }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        border: primary ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: primary ? 'var(--color-accent)' : 'var(--color-white)',
        color: primary ? 'white' : 'var(--color-text)',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = primary
          ? 'var(--color-primary-light)'
          : 'var(--color-bg-alt)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = primary
          ? 'var(--color-accent)'
          : 'var(--color-white)';
      }}
    >
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{title}</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div>
      </div>
    </button>
  );
}
