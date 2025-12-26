import { Invoice } from './types';

// Initial extraction (Source 1: File 1)
export const initialInvoices: Invoice[] = [
  {
    invoiceId: "INV-A-001",
    vendor: "Supplier GmbH",
    invoiceNumber: "INV-2024-001",
    invoiceDate: "12.01.2024",
    serviceDate: null, // Missing in extraction [cite: 12]
    currency: "EUR",
    netTotal: 2500.0,
    taxTotal: 475.0,
    grossTotal: 2975.0,
    lineItems: [{ sku: "WIDGET-001", qty: 100, unitPrice: 25.0 }],
    rawText: "Rechnungsnr: INV-2024-001\nLeistungsdatum: 01.01.2024\nBestellnr: PO-A-050" // Contains the date [cite: 20]
  },
  {
    invoiceId: "INV-B-001", 
    vendor: "Parts AG",
    invoiceNumber: "PA-7781",
    invoiceDate: "05-02-2024",
    serviceDate: null,
    currency: "EUR",
    netTotal: 2000.0,
    taxTotal: 400.0,
    grossTotal: 2400.0,
    lineItems: [{ sku: "BOLT-99", qty: 200, unitPrice: 10.0}],
    rawText: "Invoice No: PA-7781\nPrices incl. VAT (MwSt. inkl.)" // Trigger for tax logic [cite: 54]
  }
];

// Full data for the second run (Source 1: File 1 - Full)
export const fullInvoices: Invoice[] = [
  {
    invoiceId: "INV-A-002", // The subsequent invoice
    vendor: "Supplier GmbH",
    invoiceNumber: "INV-2024-002",
    invoiceDate: "18.01.2024",
    serviceDate: null, // Still missing in extraction [cite: 31]
    currency: "EUR",
    netTotal: 2375.0,
    taxTotal: 451.25,
    grossTotal: 2826.25,
    lineItems: [{ sku: "WIDGET-001", qty: 95, unitPrice: 25.0 }],
    rawText: "Rechnungsnr: INV-2024-002\nLeistungsdatum: 15.01.2024\nHinweis: Teillieferung" // [cite: 39]
  },
    {
    invoiceId: "INV-B-002", 
    vendor: "Parts AG",
    invoiceNumber: "PA-7799",
    invoiceDate: "20-02-2024",
    serviceDate: null,
    currency: "EUR",
    netTotal: 1500.0,
    taxTotal: 285.0,
    grossTotal: 1785.0,
    lineItems: [{ sku: "BOLT-99", qty: 150, unitPrice: 10.0}],
    rawText: "Invoice No: PA-7799\nMwSt. inkl." // Trigger for learned tax logic [cite: 69]
  }
];

export const humanCorrections = [
  {
    invoiceId: "INV-A-001",
    vendor: "Supplier GmbH",
    field: "serviceDate",
    correctValue: "01.01.2024", // [cite: 118]
    reason: "Leistungsdatum found in raw text"
  },
  {
    invoiceId: "INV-B-001",
    vendor: "Parts AG",
    field: "grossTotal",
    correctValue: 2380.0, // [cite: 481]
    reason: "VAT included in total"
  }
];
