# ANSI X12 EDI Specification Builder

## 1. Purpose

This document defines the initial requirements for a lightweight, internal-use application to create, edit, and export ANSI X12 EDI implementation specifications. The tool is intended to accelerate the creation of customer- or partner-specific EDI specs by building on existing OpenEDI specifications and applying constrained customization.

The primary users are technical and semi-technical staff familiar with EDI but not interested in manually editing raw specification documents.

---

## 2. Goals and Non-Goals

### 2.1 Goals
- Rapidly produce professional-looking ANSI X12 implementation specifications.
- Minimize manual formatting and repetitive work.
- Preserve alignment with standard OpenEDI definitions while allowing controlled divergence.
- Operate entirely offline as a self-contained local application.

### 2.2 Non-Goals
- Full EDI transaction validation or runtime processing.
- Real-time collaboration or multi-user editing.
- Native EDI parsing or generation.
- Support for non–ANSI X12 standards (e.g., EDIFACT) in the initial version.

---

## 3. Target Users

- Internal developers
- Integration engineers
- Solutions architects
- Implementation and onboarding staff

Users are assumed to understand EDI concepts such as segments, elements, loops, usage indicators, and code lists.

---

## 4. Source of Truth

- Base specifications will be derived from EdiNation OpenEDI specifications:
  - https://github.com/EdiNation/OpenEDI-Specification
- The application will import these specs as structured data and treat them as editable baselines.
- Original OpenEDI definitions should remain referenceable and distinguishable from local overrides.

---

## 5. Core Functional Requirements

### 5.1 Specification Management

- Create a new specification from an existing OpenEDI transaction set.
- Save specifications locally.
- Reopen and continue editing saved specifications.
- Support versioning metadata (e.g., name, transaction set, version, partner).

### 5.2 Structural Editing

The user must be able to:

- Add, remove, and reorder:
  - Loops
  - Segments
  - Elements
- Nest loops according to ANSI X12 rules.
- Clearly visualize hierarchy (Loop → Segment → Element).

Constraints:
- Structural edits should respect basic X12 validity (e.g., elements cannot exist outside segments).
- The tool should prevent or clearly warn about invalid structures.

### 5.3 Variants and Discriminants

The tool must support defining **variants** of loops and segments that are distinguished by discriminator logic.

Use cases:
- Multiple instances of the same loop or segment type (e.g., N1, REF, DTM) with different semantic meaning.
- Differentiation based on qualifier or code values in one or more elements.

Functional requirements:
- Allow a loop or segment to have one or more variants.
- Each variant must support:
  - A human-readable label (e.g., “Ship To Party”, “Bill To Party”).
  - One or more discriminator rules of the form:
    - Element ID
    - Operator (equals, one-of)
    - Allowed code value(s)
- Variants may define overrides for:
  - Usage (mandatory / optional / conditional)
  - Allowed code subsets
  - Comments and descriptions

Behavior:
- Variants must be mutually exclusive unless explicitly allowed.
- Variants should be visually grouped under their parent loop or segment in the UI.
- Discriminator logic must be clearly rendered in both the UI and the exported PDF.

PDF requirements:
- Variants must appear as distinct, clearly labeled sections.
- Discriminator conditions must be explicitly documented (e.g., “Applies when N101 = ST”).

### 5.4 Usage Designation

For each loop, segment, and element, the user must be able to mark usage as:

- Mandatory
- Optional
- Conditional

When usage is set to Conditional:
- The user must be able to provide a human-readable condition description.
- The condition description should explain when the structure applies (e.g., based on qualifier or event code values).
- Condition descriptions must appear in the exported PDF.

Usage indicators must be reflected consistently in:
- On-screen display
- Exported PDF

### 5.5 Cardinality (Min/Max Usage)

For loops and segments, the user must be able to specify:

- Minimum usage count
- Maximum usage count

Requirements:
- Cardinality must default to values inherited from the base OpenEDI specification.
- Cardinality overrides must be clearly visible in the UI.
- Cardinality must be rendered in standard EDI notation in the PDF (e.g., `M 1`, `O 0..99`).




For each loop, segment, and element, the user must be able to mark usage as:

- Mandatory
- Optional
- Conditional

Usage indicators must be reflected consistently in:
- On-screen display
- Exported PDF

### 5.4 Comments and Notes

- Add comments at:
  - Loop level
  - Segment level
  - Element level
- Edit or remove comments at any time.
- Comments should support simple rich text (paragraphs, line breaks).
- Comments must appear in the exported specification.

### 5.6 Code Value Constraints

For applicable elements:

- View all valid codes defined in the base OpenEDI spec.
- Select a subset of valid codes to include.
- Add custom descriptions or overrides for selected codes.
- Exclude codes entirely from the final specification.

The exported spec must clearly indicate:
- Allowed code values
- Their descriptions

### 5.6.1 Inline Examples

For segments and elements, the user must be able to add optional example values.

Requirements:
- Examples are for documentation purposes only.
- Examples may be provided at:
  - Segment level (full segment example)
  - Element level (single element value)
- Examples must appear in the exported PDF adjacent to the relevant structure.
- Examples must be clearly labeled as examples and visually distinct from normative requirements.


### 5.7 Example EDI Appendices

- The user must be able to add one or more example EDI samples to a specification.
- Each sample must support:
  - A title/label (e.g., “Example 1 – Invoice with allowances”)
  - Optional short description/context
  - The raw EDI text payload (ISA… through IEA) preserved exactly as entered
- The user must be able to edit, reorder, and remove samples.

PDF export requirements for examples:
- Examples must print at the end of the PDF as an appendix section.
- EDI sample text must render in a fixed-width font.
- Preserve line breaks and spacing as entered.
- Support multi-page wrapping with clear continuation (e.g., repeating sample header on page breaks) when necessary.

### 5.8 Export

- Export the final specification as a PDF.
- PDF output should visually resemble standard EDI implementation guides, including:
  - Clear section headers
  - Tables for segments and elements
  - Usage indicators
  - Code lists
  - Comments/notes
  - Example EDI appendix

Formatting requirements:
- Consistent, clean layout
- Minimal customization options
- Defaults should be sufficient for most use cases

---

## 6. User Experience Requirements

### 6.1 General UX Principles

- Low cognitive overhead.
- Minimal required configuration.
- Fast navigation between sections.
- Keyboard-friendly where practical.

### 6.2 Navigation and Editing

- Tree-based or outline-based navigation for loops and segments.
- Inline editing for:
  - Usage indicators
  - Comments
  - Code lists
- Immediate visual feedback when changes are made.

### 6.3 Defaults and Automation

- Sensible defaults inherited from the base OpenEDI spec.
- Automatic propagation of common settings where appropriate (e.g., loop usage affecting child segments).

---

## 7. Technical Requirements

### 7.1 Platform

- Desktop application
- Runs locally
- No external services required

### 7.2 Technology Stack

- Language: TypeScript
- UI Framework: React
- Desktop Runtime: Electron

Requirements:
- The application must be built using Electron, TypeScript, and React.
- These technologies are mandated to align with in-house expertise and maintenance capabilities.
- The application should be architected as a clear separation between:
  - UI layer (React)
  - Application/state logic (TypeScript)
  - Desktop shell and OS integration (Electron)

The application should be self-contained and distributable as a single installable package.

### 7.3 Data Storage

- Local persistence only
- Storage format should be:
  - Human-readable
  - Versionable (e.g., JSON)
- Saved state must include:
  - Base spec reference
  - All user overrides and edits

### 7.4 PDF Generation

- Deterministic output (same input produces same PDF)
- PDF generation must work offline
- Layout engine must support tables and hierarchical sections

---

## 8. Performance and Reliability

- Application startup time should be minimal.
- Editing operations should feel instantaneous.
- No dependency on network availability.
- Graceful handling of corrupted or invalid saved files.

---

## 9. Security and Access

- Internal use only
- No authentication required
- No data leaves the local machine

---

## 10. Open Questions / Future Enhancements

- Diff view between base OpenEDI spec and customized spec
- Export formats beyond PDF (e.g., HTML)
- Support for additional EDI standards
- Template library for common trading partners

---

## 11. Out of Scope for Initial Version

- Collaborative editing
- Role-based access control
- Validation against real EDI instances
- Cloud storage or syncing

