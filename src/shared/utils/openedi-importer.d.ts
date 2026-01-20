/**
 * OpenEDI Specification Importer
 * Converts EdiNation OpenEDI specifications to internal format
 */
import { Specification, OpenEDITransactionSet } from '../models/edi-types';
export declare function importOpenEDISpec(openEDISpec: OpenEDITransactionSet): Specification;
export declare function parseOpenEDIJson(jsonContent: string): OpenEDITransactionSet;
export declare const TRANSACTION_SET_TEMPLATES: Record<string, {
    name: string;
    description: string;
}>;
export declare function createEmptySpecification(transactionSetId: string, name?: string, ediVersion?: string): Specification;
