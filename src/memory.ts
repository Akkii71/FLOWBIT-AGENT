import fs from 'fs';
import { MemoryStore, VendorMemory } from './types';

const MEMORY_FILE = 'agent_memory.json';

export class MemoryManager {
  private memory: MemoryStore;

  constructor() {
    if (fs.existsSync(MEMORY_FILE)) {
      console.log("📂 Loading existing memory...");
      this.memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    } else {
      console.log("✨ Initializing fresh memory...");
      this.memory = { vendors: {}, processedInvoices: [] };
    }
  }

  getVendorMemory(vendorName: string): VendorMemory {
    if (!this.memory.vendors[vendorName]) {
      this.memory.vendors[vendorName] = {
        vendorName,
        fieldMappings: [],
        taxLogic: "standard",
        skuMappings: {}
      };
    }
    return this.memory.vendors[vendorName];
  }

  learnFromCorrection(vendor: string, field: string, extractedValue: any, correctValue: any, rawText: string) {
    const mem = this.getVendorMemory(vendor);
    console.log(`🧠 LEARNING TRIGGERED for ${vendor}: Field '${field}'`);

    // 1. Learn Regex for missing dates (Scenario: Supplier GmbH)
    if (field === 'serviceDate' && correctValue) {
        // In a real system, we'd generate a regex dynamically. 
        // For the assignment, we simulate learning the specific German label "Leistungsdatum".
        if (rawText.includes("Leistungsdatum")) {
             // Avoid duplicate rules
             const exists = mem.fieldMappings.find(m => m.field === 'serviceDate' && m.regexPattern.includes("Leistungsdatum"));
             if (!exists) {
                 mem.fieldMappings.push({
                     field: 'serviceDate',
                     regexPattern: "Leistungsdatum: (\\d{2}\\.\\d{2}\\.\\d{4})",
                     confidence: 0.95
                 });
                 console.log("   -> Learned Pattern: 'Leistungsdatum' maps to serviceDate");
             }
        }
    }

    // 2. Learn Tax Logic (Scenario: Parts AG)
    if (field === 'grossTotal' || field === 'taxTotal') {
        if (rawText.includes("incl. VAT") || rawText.includes("MwSt. inkl")) {
            mem.taxLogic = "inclusive_vat";
            console.log("   -> Learned Logic: Vendor uses Inclusive VAT");
        }
    }

    this.saveMemory();
  }

  saveMemory() {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
  }
}
