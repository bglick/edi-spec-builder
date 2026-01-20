/**
 * Main Application Component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Specification, Loop, Segment, Element } from '../shared/models/edi-types';
import { parseAndImportSpec, createEmptySpecification } from '../shared/utils/openedi-importer';
import { TreeNavigation, TreeSelection } from './components/TreeNavigation';
import { SpecificationEditor } from './components/SpecificationEditor';
import { LoopEditor } from './components/LoopEditor';
import { SegmentEditor } from './components/SegmentEditor';
import { ElementEditor } from './components/ElementEditor';
import { ExamplesEditor } from './components/ExamplesEditor';
import { NewSpecModal } from './components/NewSpecModal';
import { WelcomeScreen } from './components/WelcomeScreen';

// Electron API exposed via preload script
interface ElectronAPI {
  openFile: () => Promise<{ success: boolean; data?: string; error?: string }>;
  saveFile: () => Promise<{ success: boolean; data?: string; error?: string }>;
  exportPDF: () => Promise<{ success: boolean; data?: string; error?: string }>;
  saveSpec: (request: any) => Promise<{ success: boolean; error?: string }>;
  loadSpec: (request: any) => Promise<{ success: boolean; data?: Specification; error?: string }>;
  exportSpecPDF: (request: any) => Promise<{ success: boolean; error?: string }>;
  importOpenEDI: () => Promise<{ success: boolean; data?: string; error?: string }>;
  onMenuNew: (callback: () => void) => () => void;
  onMenuOpen: (callback: () => void) => () => void;
  onMenuSave: (callback: () => void) => () => void;
  onMenuSaveAs: (callback: () => void) => () => void;
  onMenuImport: (callback: () => void) => () => void;
  onMenuExportPDF: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const electronAPI = window.electronAPI;

type EditorTab = 'structure' | 'examples' | 'metadata';

export default function App() {
  const [specification, setSpecification] = useState<Specification | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('structure');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const updateSpecification = useCallback((updater: (spec: Specification) => Specification) => {
    setSpecification(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      updated.metadata.modifiedDate = new Date().toISOString();
      return updated;
    });
    setIsDirty(true);
  }, []);

  const handleNew = useCallback((transactionSet: string, name: string, version: string) => {
    const newSpec = createEmptySpecification(transactionSet, name, version);
    setSpecification(newSpec);
    setFilePath(null);
    setIsDirty(false);
    setSelection(null);
    setExpandedNodes(new Set());
    setShowNewModal(false);
  }, []);

  const handleOpen = useCallback(async () => {
    if (!electronAPI) return;

    const result = await electronAPI.openFile();
    if (!result.success || !result.data) return;

    const loadResult = await electronAPI.loadSpec({ filePath: result.data });
    if (loadResult.success && loadResult.data) {
      setSpecification(loadResult.data);
      setFilePath(result.data);
      setIsDirty(false);
      setSelection(null);
      setExpandedNodes(new Set());
    } else {
      alert(`Failed to load file: ${loadResult.error}`);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!electronAPI || !specification) return;

    let saveFilePath = filePath;
    if (!saveFilePath) {
      const result = await electronAPI.saveFile();
      if (!result.success || !result.data) return;
      saveFilePath = result.data;
    }

    const saveResult = await electronAPI.saveSpec({
      specification,
      filePath: saveFilePath,
    });

    if (saveResult.success) {
      setFilePath(saveFilePath);
      setIsDirty(false);
    } else {
      alert(`Failed to save: ${saveResult.error}`);
    }
  }, [specification, filePath]);

  const handleSaveAs = useCallback(async () => {
    if (!electronAPI || !specification) return;

    const result = await electronAPI.saveFile();
    if (!result.success || !result.data) return;

    const saveResult = await electronAPI.saveSpec({
      specification,
      filePath: result.data,
    });

    if (saveResult.success) {
      setFilePath(result.data);
      setIsDirty(false);
    } else {
      alert(`Failed to save: ${saveResult.error}`);
    }
  }, [specification]);

  const handleImport = useCallback(async () => {
    if (!electronAPI) return;

    const result = await electronAPI.importOpenEDI();
    if (!result.success || !result.data) return;

    try {
      const imported = parseAndImportSpec(result.data);
      setSpecification(imported);
      setFilePath(null);
      setIsDirty(true);
      setSelection(null);
      setExpandedNodes(new Set());
    } catch (error) {
      alert(`Failed to import: ${error}`);
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!electronAPI || !specification) return;

    const result = await electronAPI.exportPDF();
    if (!result.success || !result.data) return;

    const exportResult = await electronAPI.exportSpecPDF({
      specification,
      filePath: result.data,
    });

    if (exportResult.success) {
      alert('PDF exported successfully!');
    } else {
      alert(`Failed to export PDF: ${exportResult.error}`);
    }
  }, [specification]);

  // Menu handlers from Electron
  useEffect(() => {
    if (!electronAPI) return;

    const cleanups = [
      electronAPI.onMenuNew(() => setShowNewModal(true)),
      electronAPI.onMenuOpen(handleOpen),
      electronAPI.onMenuSave(handleSave),
      electronAPI.onMenuSaveAs(handleSaveAs),
      electronAPI.onMenuImport(handleImport),
      electronAPI.onMenuExportPDF(handleExportPDF),
    ];

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [handleOpen, handleSave, handleSaveAs, handleImport, handleExportPDF]);

  const handleSelectionChange = useCallback((newSelection: TreeSelection | null) => {
    setSelection(newSelection);
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Find selected item helper
  const findSelectedItem = useCallback((): { type: string; item: Loop | Segment | Element | null; path: string[] } | null => {
    if (!selection || !specification) return null;

    const findInLoops = (loops: Loop[], path: string[]): { type: string; item: Loop | Segment | Element; path: string[] } | null => {
      for (const loop of loops) {
        if (selection.type === 'loop' && loop.id === selection.id) {
          return { type: 'loop', item: loop, path: [...path, loop.id] };
        }

        for (const segment of loop.segments) {
          if (selection.type === 'segment' && segment.id === selection.id) {
            return { type: 'segment', item: segment, path: [...path, loop.id, segment.id] };
          }

          for (const element of segment.elements) {
            if (selection.type === 'element' && element.id === selection.id) {
              return { type: 'element', item: element, path: [...path, loop.id, segment.id, element.id] };
            }
          }
        }

        const nested = findInLoops(loop.loops, [...path, loop.id]);
        if (nested) return nested;
      }
      return null;
    };

    return findInLoops(specification.loops, []);
  }, [selection, specification]);

  const selectedItem = findSelectedItem();

  // Render editor based on selection
  const renderEditor = () => {
    if (!specification) return <WelcomeScreen onNew={() => setShowNewModal(true)} onOpen={handleOpen} onImport={handleImport} />;

    if (activeTab === 'examples') {
      return <ExamplesEditor specification={specification} onUpdate={updateSpecification} />;
    }

    if (activeTab === 'metadata') {
      return <SpecificationEditor specification={specification} onUpdate={updateSpecification} />;
    }

    if (!selectedItem) {
      return (
        <div className="welcome-screen">
          <h2>Select an item</h2>
          <p>Choose a loop, segment, or element from the tree to edit its properties.</p>
        </div>
      );
    }

    if (selectedItem.type === 'loop') {
      return (
        <LoopEditor
          loop={selectedItem.item as Loop}
          path={selectedItem.path}
          specification={specification}
          onUpdate={updateSpecification}
        />
      );
    }

    if (selectedItem.type === 'segment') {
      return (
        <SegmentEditor
          segment={selectedItem.item as Segment}
          path={selectedItem.path}
          specification={specification}
          onUpdate={updateSpecification}
        />
      );
    }

    if (selectedItem.type === 'element') {
      return (
        <ElementEditor
          element={selectedItem.item as Element}
          path={selectedItem.path}
          specification={specification}
          onUpdate={updateSpecification}
        />
      );
    }

    return null;
  };

  const documentTitle = specification
    ? `${specification.metadata.name}${isDirty ? ' *' : ''}`
    : 'EDI Specification Builder';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{documentTitle}</h1>
        <div className="header-actions">
          {specification && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={!isDirty}>
                Save
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
                Export PDF
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        {specification && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>Transaction Set {specification.metadata.transactionSet}</h2>
            </div>
            <div className="sidebar-content">
              <TreeNavigation
                specification={specification}
                selection={selection}
                expandedNodes={expandedNodes}
                onSelect={handleSelectionChange}
                onToggleExpand={handleToggleExpand}
                onUpdate={updateSpecification}
              />
            </div>
          </aside>
        )}

        <section className="content-area">
          {specification && (
            <div className="tabs" style={{ padding: '0 24px', backgroundColor: 'white' }}>
              <div
                className={`tab ${activeTab === 'structure' ? 'active' : ''}`}
                onClick={() => setActiveTab('structure')}
              >
                Structure
              </div>
              <div
                className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
                onClick={() => setActiveTab('examples')}
              >
                Examples ({specification.examples.length})
              </div>
              <div
                className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
              >
                Metadata
              </div>
            </div>
          )}
          <div className="content-body">{renderEditor()}</div>
        </section>
      </main>

      {showNewModal && (
        <NewSpecModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleNew}
        />
      )}
    </div>
  );
}
