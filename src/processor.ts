import { Invoice, ProcessingResult, AuditEvent } from './types';
import { MemoryManager } from './memory';

export class InvoiceProcessor {
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
  }

  process(invoice: Invoice): ProcessingResult {
    const vendorMem = this.memoryManager.getVendorMemory(invoice.vendor);
    const corrections: string[] = [];
    const auditTrail: AuditEvent[] = [];
    let reasoning = "";
    let confidence = 0.7; // Base extraction confidence

    // --- AUDIT: RECALL ---
    auditTrail.push({
        step: "recall",
        timestamp: new Date().toISOString(),
        details: `Loaded memory for ${invoice.vendor}. Found ${vendorMem.fieldMappings.length} pattern rules.`
    });

    // --- APPLY MEMORY ---

    // 1. Apply Learned Regex (Fixing Missing Dates)
    for (const mapping of vendorMem.fieldMappings) {
        if (!invoice[mapping.field]) {
            // Simple regex match for the demo
            const regex = new RegExp(mapping.regexPattern);
            const match = invoice.rawText.match(regex);
            if (match) {
                (invoice as any)[mapping.field] = match[1]; 
                const msg = `Auto-filled ${mapping.field} using learned pattern: "${mapping.regexPattern}"`;
                corrections.push(msg);
                auditTrail.push({ step: "apply", timestamp: new Date().toISOString(), details: msg });
                confidence += 0.2; // Boost confidence
            }
        }
    }

    // 2. Apply Tax Logic
    if (vendorMem.taxLogic === 'inclusive_vat') {
        // Check if math adds up. If not, recompute based on Inclusive logic.
        const calculatedTax = invoice.grossTotal - (invoice.grossTotal / 1.19);
        if (Math.abs(invoice.taxTotal - calculatedTax) > 0.05) {
             const oldTax = invoice.taxTotal;
             invoice.taxTotal = parseFloat(calculatedTax.toFixed(2));
             invoice.netTotal = parseFloat((invoice.grossTotal - calculatedTax).toFixed(2));
             
             const msg = `Recalculated Tax (was ${oldTax}, now ${invoice.taxTotal}) using Learned 'Inclusive VAT' logic`;
             corrections.push(msg);
             auditTrail.push({ step: "apply", timestamp: new Date().toISOString(), details: msg });
        }
    }

    // --- DECISION LOGIC ---
    let requiresReview = false;
    
    // Rule: If Service Date is essential and missing -> Review
    if (!invoice.serviceDate) {
        requiresReview = true;
        reasoning += "Missing Service Date. ";
        auditTrail.push({ step: "decide", timestamp: new Date().toISOString(), details: "Flagged: Missing mandatory Service Date" });
    }

    if (corrections.length > 0) {
        reasoning += `Applied learned optimizations: ${corrections.length} fixes.`;
    } else {
        reasoning += "No memory rules applied.";
    }

    return {
        normalizedInvoice: invoice,
        proposedCorrections: corrections,
        requiresHumanReview: requiresReview,
        reasoning: reasoning.trim(),
        confidenceScore: Math.min(confidence, 1.0),
        auditTrail
    };
  }
}
