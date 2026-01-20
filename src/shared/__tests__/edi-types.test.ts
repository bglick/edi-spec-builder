/**
 * Tests for EDI Types
 * Verify type structures and interfaces work correctly
 */

import {
  Specification,
  Loop,
  Segment,
  Element,
  Variant,
  CodeValue,
  DiscriminatorRule,
  ExampleEDI,
  UsageType,
} from '../models/edi-types';

describe('edi-types', () => {
  describe('Specification', () => {
    it('should create valid specification object', () => {
      const spec: Specification = {
        id: 'spec-1',
        metadata: {
          name: 'Test Specification',
          version: '1.0',
          transactionSet: '810',
          transactionSetName: 'Invoice',
          ediVersion: '005010',
          createdDate: '2024-01-01T00:00:00Z',
          modifiedDate: '2024-01-01T00:00:00Z',
        },
        loops: [],
        examples: [],
      };

      expect(spec.id).toBe('spec-1');
      expect(spec.metadata.name).toBe('Test Specification');
      expect(spec.loops).toEqual([]);
    });

    it('should allow optional metadata fields', () => {
      const spec: Specification = {
        id: 'spec-1',
        metadata: {
          name: 'Test',
          version: '1.0',
          transactionSet: '810',
          transactionSetName: 'Invoice',
          ediVersion: '005010',
          createdDate: '2024-01-01T00:00:00Z',
          modifiedDate: '2024-01-01T00:00:00Z',
          partner: 'Acme Corp',
          description: 'Test description',
          baseSpecReference: 'OpenEDI/005010/810',
        },
        loops: [],
        examples: [],
      };

      expect(spec.metadata.partner).toBe('Acme Corp');
      expect(spec.metadata.description).toBe('Test description');
    });
  });

  describe('Loop', () => {
    it('should create valid loop object', () => {
      const loop: Loop = {
        id: 'loop-1',
        name: 'N1_LOOP',
        description: 'Party Identification Loop',
        usage: 'O',
        minUse: 0,
        maxUse: 200,
        segments: [],
        loops: [],
      };

      expect(loop.name).toBe('N1_LOOP');
      expect(loop.usage).toBe('O');
      expect(loop.maxUse).toBe(200);
    });

    it('should support nested loops', () => {
      const loop: Loop = {
        id: 'loop-1',
        name: 'OUTER',
        usage: 'M',
        minUse: 1,
        maxUse: 1,
        segments: [],
        loops: [
          {
            id: 'loop-2',
            name: 'INNER',
            usage: 'O',
            minUse: 0,
            maxUse: 10,
            segments: [],
            loops: [],
          },
        ],
      };

      expect(loop.loops).toHaveLength(1);
      expect(loop.loops[0].name).toBe('INNER');
    });

    it('should support variants', () => {
      const loop: Loop = {
        id: 'loop-1',
        name: 'N1_LOOP',
        usage: 'O',
        minUse: 0,
        maxUse: 5,
        segments: [],
        loops: [],
        variants: [
          {
            id: 'var-1',
            label: 'Ship To Party',
            discriminators: [
              {
                elementId: 'N101',
                operator: 'equals',
                values: ['ST'],
              },
            ],
          },
        ],
      };

      expect(loop.variants).toHaveLength(1);
      expect(loop.variants![0].label).toBe('Ship To Party');
    });

    it('should support conditional usage with description', () => {
      const loop: Loop = {
        id: 'loop-1',
        name: 'TEST',
        usage: 'C',
        conditionDescription: 'Required when order is dropship',
        minUse: 0,
        maxUse: 1,
        segments: [],
        loops: [],
      };

      expect(loop.usage).toBe('C');
      expect(loop.conditionDescription).toBe('Required when order is dropship');
    });
  });

  describe('Segment', () => {
    it('should create valid segment object', () => {
      const segment: Segment = {
        id: 'seg-1',
        name: 'N1',
        description: 'Party Identification',
        usage: 'M',
        minUse: 1,
        maxUse: 1,
        elements: [],
      };

      expect(segment.name).toBe('N1');
      expect(segment.description).toBe('Party Identification');
    });

    it('should support example', () => {
      const segment: Segment = {
        id: 'seg-1',
        name: 'N1',
        description: 'Party Identification',
        usage: 'M',
        minUse: 1,
        maxUse: 1,
        elements: [],
        example: {
          value: 'N1*ST*Acme Corp*92*12345~',
        },
      };

      expect(segment.example?.value).toBe('N1*ST*Acme Corp*92*12345~');
    });
  });

  describe('Element', () => {
    it('should create valid element object', () => {
      const element: Element = {
        id: 'el-1',
        position: 1,
        name: 'Entity Identifier Code',
        dataType: 'ID',
        minLength: 2,
        maxLength: 3,
        usage: 'M',
      };

      expect(element.position).toBe(1);
      expect(element.dataType).toBe('ID');
      expect(element.minLength).toBe(2);
      expect(element.maxLength).toBe(3);
    });

    it('should support code values', () => {
      const element: Element = {
        id: 'el-1',
        position: 1,
        name: 'Entity Identifier Code',
        dataType: 'ID',
        minLength: 2,
        maxLength: 3,
        usage: 'M',
        codeValues: [
          { code: 'ST', description: 'Ship To', included: true },
          { code: 'BT', description: 'Bill To', included: true },
          { code: 'SU', description: 'Supplier', included: false },
        ],
      };

      expect(element.codeValues).toHaveLength(3);
      expect(element.codeValues![2].included).toBe(false);
    });

    it('should support example value', () => {
      const element: Element = {
        id: 'el-1',
        position: 1,
        name: 'Party Name',
        dataType: 'AN',
        minLength: 1,
        maxLength: 60,
        usage: 'O',
        example: {
          value: 'Acme Corporation',
          description: 'Company name',
        },
      };

      expect(element.example?.value).toBe('Acme Corporation');
    });
  });

  describe('Variant', () => {
    it('should create valid variant with discriminators', () => {
      const variant: Variant = {
        id: 'var-1',
        label: 'Ship To Party',
        discriminators: [
          {
            elementId: 'N101',
            operator: 'equals',
            values: ['ST'],
          },
        ],
      };

      expect(variant.label).toBe('Ship To Party');
      expect(variant.discriminators[0].operator).toBe('equals');
    });

    it('should support one-of discriminator', () => {
      const variant: Variant = {
        id: 'var-1',
        label: 'Remit To Parties',
        discriminators: [
          {
            elementId: 'N101',
            operator: 'one-of',
            values: ['RI', 'RB', 'PE'],
          },
        ],
      };

      expect(variant.discriminators[0].operator).toBe('one-of');
      expect(variant.discriminators[0].values).toHaveLength(3);
    });

    it('should support multiple discriminators', () => {
      const variant: Variant = {
        id: 'var-1',
        label: 'Specific Variant',
        discriminators: [
          {
            elementId: 'N101',
            operator: 'equals',
            values: ['ST'],
          },
          {
            elementId: 'N103',
            operator: 'one-of',
            values: ['92', '91'],
          },
        ],
      };

      expect(variant.discriminators).toHaveLength(2);
    });

    it('should support usage override', () => {
      const variant: Variant = {
        id: 'var-1',
        label: 'Required Ship To',
        discriminators: [],
        usageOverride: 'M',
      };

      expect(variant.usageOverride).toBe('M');
    });
  });

  describe('ExampleEDI', () => {
    it('should create valid example', () => {
      const example: ExampleEDI = {
        id: 'ex-1',
        title: 'Basic Invoice',
        description: 'Simple invoice example',
        content: 'ISA*00*          *00*          *ZZ*SENDER~\nIEA*1*000000001~',
      };

      expect(example.title).toBe('Basic Invoice');
      expect(example.content).toContain('ISA');
      expect(example.content).toContain('IEA');
    });
  });

  describe('UsageType', () => {
    it('should accept valid usage types', () => {
      const usages: UsageType[] = ['M', 'O', 'C'];

      usages.forEach(u => {
        const element: Element = {
          id: 'el-1',
          position: 1,
          name: 'Test',
          dataType: 'AN',
          minLength: 1,
          maxLength: 10,
          usage: u,
        };
        expect(element.usage).toBe(u);
      });
    });
  });

  describe('CodeValue', () => {
    it('should track custom descriptions', () => {
      const code: CodeValue = {
        code: 'ST',
        description: 'Custom Ship To Description',
        isCustomDescription: true,
        included: true,
      };

      expect(code.isCustomDescription).toBe(true);
    });
  });

  describe('DiscriminatorRule', () => {
    it('should support equals operator', () => {
      const rule: DiscriminatorRule = {
        elementId: 'N101',
        operator: 'equals',
        values: ['ST'],
      };

      expect(rule.operator).toBe('equals');
      expect(rule.values).toHaveLength(1);
    });

    it('should support one-of operator', () => {
      const rule: DiscriminatorRule = {
        elementId: 'N101',
        operator: 'one-of',
        values: ['ST', 'BT', 'SU'],
      };

      expect(rule.operator).toBe('one-of');
      expect(rule.values).toHaveLength(3);
    });
  });
});
