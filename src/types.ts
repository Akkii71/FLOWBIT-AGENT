export interface LineItem {
  description?: string;
  qty: number;
  unitPrice: number;
  sku?: string;
}

export interface Invoice {
  invoiceId: string;
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  serviceDate: string | null;
  currency: string;
  netTotal: number;
  taxTotal: number;
  grossTotal: number;
  lineItems: LineItem[];
  rawText: string; 
  poNumber?: string | null;
}

export interface ProcessingResult {
  normalizedInvoice: Invoice;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  auditTrail: AuditEvent[];
}

export interface AuditEvent {
    step: "recall" | "apply" | "decide" | "learn";
    timestamp: string;
    details: string;
}

export interface VendorMemory {
  vendorName: string;
  fieldMappings: {
    field: keyof Invoice;
    regexPattern: string;
    confidence: number;
  }[];
  taxLogic: "standard" | "inclusive_vat";
  skuMappings: Record<string, string>;
}

export interface MemoryStore {
  vendors: Record<string, VendorMemory>;
  processedInvoices: string[];
}
