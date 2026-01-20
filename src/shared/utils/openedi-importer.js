"use strict";
/**
 * OpenEDI Specification Importer
 * Converts EdiNation OpenEDI specifications to internal format
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_SET_TEMPLATES = void 0;
exports.importOpenEDISpec = importOpenEDISpec;
exports.parseOpenEDIJson = parseOpenEDIJson;
exports.createEmptySpecification = createEmptySpecification;
const uuid_1 = require("uuid");
function parseUsage(req) {
    switch (req?.toUpperCase()) {
        case 'M':
            return 'M';
        case 'O':
            return 'O';
        case 'C':
        case 'X':
            return 'C';
        default:
            return 'O';
    }
}
function convertElement(openEDIElement, position) {
    const usage = parseUsage(openEDIElement.Req);
    const codeValues = (openEDIElement.Codes || []).map(code => ({
        code: code.Code,
        description: code.Description,
        included: true,
    }));
    return {
        id: (0, uuid_1.v4)(),
        position,
        name: openEDIElement.Name || openEDIElement.Id,
        dataType: openEDIElement.DataType || 'AN',
        minLength: openEDIElement.MinLength || 0,
        maxLength: openEDIElement.MaxLength || 0,
        usage,
        baseUsage: usage,
        codeValues: codeValues.length > 0 ? codeValues : undefined,
        baseCodes: codeValues.length > 0 ? [...codeValues] : undefined,
    };
}
function convertSegment(openEDISegment) {
    const usage = parseUsage(openEDISegment.Req);
    const maxUse = openEDISegment.Max || 1;
    return {
        id: (0, uuid_1.v4)(),
        name: openEDISegment.Id,
        description: openEDISegment.Name || openEDISegment.Id,
        usage,
        baseUsage: usage,
        minUse: usage === 'M' ? 1 : 0,
        maxUse,
        baseMinUse: usage === 'M' ? 1 : 0,
        baseMaxUse: maxUse,
        elements: (openEDISegment.Elements || []).map((el, idx) => convertElement(el, idx + 1)),
    };
}
function convertLoop(openEDILoop) {
    const usage = parseUsage(openEDILoop.Req);
    const maxUse = openEDILoop.Max || 1;
    return {
        id: (0, uuid_1.v4)(),
        name: openEDILoop.Id || openEDILoop.Name,
        description: openEDILoop.Name,
        usage,
        baseUsage: usage,
        minUse: usage === 'M' ? 1 : 0,
        maxUse,
        baseMinUse: usage === 'M' ? 1 : 0,
        baseMaxUse: maxUse,
        segments: (openEDILoop.Segments || []).map(seg => convertSegment(seg)),
        loops: (openEDILoop.Loops || []).map(loop => convertLoop(loop)),
    };
}
function importOpenEDISpec(openEDISpec) {
    const now = new Date().toISOString();
    return {
        id: (0, uuid_1.v4)(),
        metadata: {
            name: `${openEDISpec.TransactionSetId} - ${openEDISpec.Name}`,
            version: '1.0',
            transactionSet: openEDISpec.TransactionSetId,
            transactionSetName: openEDISpec.Name,
            ediVersion: openEDISpec.Version || '005010',
            createdDate: now,
            modifiedDate: now,
            baseSpecReference: `OpenEDI/${openEDISpec.Version}/${openEDISpec.TransactionSetId}`,
        },
        loops: (openEDISpec.Loops || []).map(loop => convertLoop(loop)),
        examples: [],
    };
}
function parseOpenEDIJson(jsonContent) {
    const parsed = JSON.parse(jsonContent);
    // Handle both array format and single object format
    if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
            throw new Error('Empty specification array');
        }
        return parsed[0];
    }
    return parsed;
}
// Built-in transaction set templates
exports.TRANSACTION_SET_TEMPLATES = {
    '810': { name: 'Invoice', description: 'Invoice transaction set' },
    '850': { name: 'Purchase Order', description: 'Purchase order transaction set' },
    '855': { name: 'Purchase Order Acknowledgment', description: 'PO acknowledgment' },
    '856': { name: 'Ship Notice/Manifest', description: 'Advance ship notice (ASN)' },
    '820': { name: 'Payment Order/Remittance Advice', description: 'Payment information' },
    '997': { name: 'Functional Acknowledgment', description: 'FA transaction set' },
    '999': { name: 'Implementation Acknowledgment', description: 'IA transaction set' },
    '204': { name: 'Motor Carrier Load Tender', description: 'Load tender' },
    '210': { name: 'Motor Carrier Freight Details and Invoice', description: 'Freight invoice' },
    '214': { name: 'Transportation Carrier Shipment Status Message', description: 'Shipment status' },
    '270': { name: 'Eligibility, Coverage or Benefit Inquiry', description: 'Healthcare eligibility inquiry' },
    '271': { name: 'Eligibility, Coverage or Benefit Information', description: 'Healthcare eligibility response' },
    '276': { name: 'Health Care Claim Status Request', description: 'Claim status request' },
    '277': { name: 'Health Care Claim Status Response', description: 'Claim status response' },
    '834': { name: 'Benefit Enrollment and Maintenance', description: 'Enrollment transaction' },
    '835': { name: 'Health Care Claim Payment/Advice', description: 'Remittance advice' },
    '837': { name: 'Health Care Claim', description: 'Healthcare claim (Professional/Institutional/Dental)' },
};
// Create an empty specification based on transaction set
function createEmptySpecification(transactionSetId, name, ediVersion = '005010') {
    const template = exports.TRANSACTION_SET_TEMPLATES[transactionSetId];
    const now = new Date().toISOString();
    return {
        id: (0, uuid_1.v4)(),
        metadata: {
            name: name || template?.name || `Transaction Set ${transactionSetId}`,
            version: '1.0',
            transactionSet: transactionSetId,
            transactionSetName: template?.name || transactionSetId,
            ediVersion,
            createdDate: now,
            modifiedDate: now,
        },
        loops: [],
        examples: [],
    };
}
//# sourceMappingURL=openedi-importer.js.map