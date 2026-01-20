"use strict";
/**
 * Tests for OpenEDI Importer
 */
Object.defineProperty(exports, "__esModule", { value: true });
const openedi_importer_1 = require("../utils/openedi-importer");
describe('openedi-importer', () => {
    describe('parseOpenEDIJson', () => {
        it('should parse a single object specification', () => {
            const json = JSON.stringify({
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [],
            });
            const result = (0, openedi_importer_1.parseOpenEDIJson)(json);
            expect(result.TransactionSetId).toBe('810');
            expect(result.Name).toBe('Invoice');
            expect(result.Version).toBe('005010');
        });
        it('should parse an array specification and return first element', () => {
            const json = JSON.stringify([
                {
                    TransactionSetId: '810',
                    Name: 'Invoice',
                    Version: '005010',
                    Loops: [],
                },
                {
                    TransactionSetId: '850',
                    Name: 'Purchase Order',
                    Version: '005010',
                    Loops: [],
                },
            ]);
            const result = (0, openedi_importer_1.parseOpenEDIJson)(json);
            expect(result.TransactionSetId).toBe('810');
        });
        it('should throw error for empty array', () => {
            const json = JSON.stringify([]);
            expect(() => (0, openedi_importer_1.parseOpenEDIJson)(json)).toThrow('Empty specification array');
        });
        it('should throw error for invalid JSON', () => {
            expect(() => (0, openedi_importer_1.parseOpenEDIJson)('invalid json')).toThrow();
        });
    });
    describe('importOpenEDISpec', () => {
        it('should convert basic transaction set', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [
                    {
                        Id: 'ST_LOOP',
                        Name: 'Transaction Set Header',
                        Req: 'M',
                        Max: 1,
                        Segments: [
                            {
                                Id: 'ST',
                                Name: 'Transaction Set Header',
                                Req: 'M',
                                Max: 1,
                                Elements: [
                                    {
                                        Id: 'ST01',
                                        Name: 'Transaction Set Identifier Code',
                                        DataType: 'ID',
                                        MinLength: 3,
                                        MaxLength: 3,
                                        Req: 'M',
                                        Codes: [{ Code: '810', Description: 'Invoice' }],
                                    },
                                ],
                            },
                        ],
                        Loops: [],
                    },
                ],
            };
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            expect(result.metadata.transactionSet).toBe('810');
            expect(result.metadata.transactionSetName).toBe('Invoice');
            expect(result.metadata.ediVersion).toBe('005010');
            expect(result.loops).toHaveLength(1);
            expect(result.loops[0].name).toBe('ST_LOOP');
            expect(result.loops[0].usage).toBe('M');
        });
        it('should convert nested loops', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [
                    {
                        Id: 'HEADER',
                        Name: 'Header',
                        Req: 'M',
                        Max: 1,
                        Segments: [],
                        Loops: [
                            {
                                Id: 'N1_LOOP',
                                Name: 'Party Identification',
                                Req: 'O',
                                Max: 200,
                                Segments: [],
                                Loops: [],
                            },
                        ],
                    },
                ],
            };
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            expect(result.loops[0].loops).toHaveLength(1);
            expect(result.loops[0].loops[0].name).toBe('N1_LOOP');
            expect(result.loops[0].loops[0].usage).toBe('O');
            expect(result.loops[0].loops[0].maxUse).toBe(200);
        });
        it('should convert elements with code values', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [
                    {
                        Id: 'LOOP1',
                        Name: 'Loop',
                        Req: 'M',
                        Max: 1,
                        Segments: [
                            {
                                Id: 'N1',
                                Name: 'Party Identification',
                                Req: 'M',
                                Max: 1,
                                Elements: [
                                    {
                                        Id: 'N101',
                                        Name: 'Entity Identifier Code',
                                        DataType: 'ID',
                                        MinLength: 2,
                                        MaxLength: 3,
                                        Req: 'M',
                                        Codes: [
                                            { Code: 'ST', Description: 'Ship To' },
                                            { Code: 'BT', Description: 'Bill To' },
                                            { Code: 'SU', Description: 'Supplier' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            const element = result.loops[0].segments[0].elements[0];
            expect(element.codeValues).toHaveLength(3);
            expect(element.codeValues[0].code).toBe('ST');
            expect(element.codeValues[0].description).toBe('Ship To');
            expect(element.codeValues[0].included).toBe(true);
        });
        it('should handle usage types correctly', () => {
            const testCases = [
                { input: 'M', expected: 'M' },
                { input: 'O', expected: 'O' },
                { input: 'C', expected: 'C' },
                { input: 'X', expected: 'C' },
                { input: undefined, expected: 'O' },
            ];
            testCases.forEach(({ input, expected }) => {
                const openEDI = {
                    TransactionSetId: '810',
                    Name: 'Invoice',
                    Version: '005010',
                    Loops: [
                        {
                            Id: 'LOOP',
                            Name: 'Test Loop',
                            Req: input,
                            Max: 1,
                        },
                    ],
                };
                const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
                expect(result.loops[0].usage).toBe(expected);
            });
        });
        it('should set base values for tracking overrides', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [
                    {
                        Id: 'LOOP1',
                        Name: 'Loop',
                        Req: 'M',
                        Max: 5,
                        Segments: [
                            {
                                Id: 'SEG1',
                                Name: 'Segment',
                                Req: 'O',
                                Max: 10,
                                Elements: [
                                    {
                                        Id: 'EL01',
                                        Name: 'Element',
                                        DataType: 'AN',
                                        MinLength: 1,
                                        MaxLength: 50,
                                        Req: 'C',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            expect(result.loops[0].baseUsage).toBe('M');
            expect(result.loops[0].baseMaxUse).toBe(5);
            expect(result.loops[0].segments[0].baseUsage).toBe('O');
            expect(result.loops[0].segments[0].elements[0].baseUsage).toBe('C');
        });
        it('should generate unique IDs', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [
                    {
                        Id: 'LOOP1',
                        Name: 'Loop 1',
                        Req: 'M',
                        Max: 1,
                    },
                    {
                        Id: 'LOOP2',
                        Name: 'Loop 2',
                        Req: 'O',
                        Max: 1,
                    },
                ],
            };
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            expect(result.id).toBeDefined();
            expect(result.loops[0].id).toBeDefined();
            expect(result.loops[1].id).toBeDefined();
            expect(result.loops[0].id).not.toBe(result.loops[1].id);
        });
        it('should set metadata dates', () => {
            const openEDI = {
                TransactionSetId: '810',
                Name: 'Invoice',
                Version: '005010',
                Loops: [],
            };
            const before = new Date().toISOString();
            const result = (0, openedi_importer_1.importOpenEDISpec)(openEDI);
            const after = new Date().toISOString();
            expect(result.metadata.createdDate >= before).toBe(true);
            expect(result.metadata.createdDate <= after).toBe(true);
            expect(result.metadata.modifiedDate).toBe(result.metadata.createdDate);
        });
    });
    describe('createEmptySpecification', () => {
        it('should create empty specification with known transaction set', () => {
            const result = (0, openedi_importer_1.createEmptySpecification)('810', undefined, '005010');
            expect(result.metadata.transactionSet).toBe('810');
            expect(result.metadata.transactionSetName).toBe('Invoice');
            expect(result.metadata.ediVersion).toBe('005010');
            expect(result.loops).toHaveLength(0);
            expect(result.examples).toHaveLength(0);
        });
        it('should use custom name when provided', () => {
            const result = (0, openedi_importer_1.createEmptySpecification)('810', 'My Custom Invoice', '005010');
            expect(result.metadata.name).toBe('My Custom Invoice');
        });
        it('should handle unknown transaction set', () => {
            const result = (0, openedi_importer_1.createEmptySpecification)('123', undefined, '005010');
            expect(result.metadata.transactionSet).toBe('123');
            expect(result.metadata.name).toContain('123');
        });
        it('should use default EDI version', () => {
            const result = (0, openedi_importer_1.createEmptySpecification)('810');
            expect(result.metadata.ediVersion).toBe('005010');
        });
    });
    describe('TRANSACTION_SET_TEMPLATES', () => {
        it('should have common transaction sets defined', () => {
            const commonSets = ['810', '850', '855', '856', '820', '997'];
            commonSets.forEach(ts => {
                expect(openedi_importer_1.TRANSACTION_SET_TEMPLATES[ts]).toBeDefined();
                expect(openedi_importer_1.TRANSACTION_SET_TEMPLATES[ts].name).toBeDefined();
                expect(openedi_importer_1.TRANSACTION_SET_TEMPLATES[ts].description).toBeDefined();
            });
        });
        it('should have healthcare transaction sets', () => {
            const healthcareSets = ['270', '271', '276', '277', '834', '835', '837'];
            healthcareSets.forEach(ts => {
                expect(openedi_importer_1.TRANSACTION_SET_TEMPLATES[ts]).toBeDefined();
            });
        });
    });
});
//# sourceMappingURL=openedi-importer.test.js.map