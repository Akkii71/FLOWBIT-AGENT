import { MemoryManager } from './memory';
import { InvoiceProcessor } from './processor';
import { initialInvoices, humanCorrections, fullInvoices } from './mockData'; 
import fs from 'fs';

// Reset memory for demo purposes
if(fs.existsSync('agent_memory.json')) fs.unlinkSync('agent_memory.json');

const memory = new MemoryManager();
const processor = new InvoiceProcessor(memory);

async function runDemo() {
    console.log("==========================================");
    console.log("   �� FLOWBIT AI AGENT - MEMORY DEMO");
    console.log("==========================================\n");

    // ---------------------------------------------------------
    // SCENARIO 1: SUPPLIER GMBH (Learning Date Patterns)
    // ---------------------------------------------------------
    
    console.log("🔹 [PHASE 1] Processing INV-A-001 (Supplier GmbH) - NO MEMORY");
    const inv1 = initialInvoices.find(i => i.invoiceId === "INV-A-001")!;
    const result1 = processor.process({ ...inv1 }); 
    
    console.log(`   ❌ Result: Review Required? ${result1.requiresHumanReview}`);
    console.log(`   📝 Reasoning: ${result1.reasoning}`);
    console.log(`   💡 Extracted Service Date: ${result1.normalizedInvoice.serviceDate} (Should be null)`);

    console.log("\n🔹 [PHASE 2] HUMAN FEEDBACK LOOP");
    const correction = humanCorrections.find(c => c.invoiceId === "INV-A-001")!;
    console.log(`   👤 Human Corrects: Field '${correction.field}' set to '${correction.correctValue}'`);
    
    memory.learnFromCorrection(
        inv1.vendor, 
        correction.field, 
        inv1.serviceDate, 
        correction.correctValue, 
        inv1.rawText
    );

    console.log("\n🔹 [PHASE 3] Processing INV-A-002 (Supplier GmbH) - WITH MEMORY");
    // INV-A-002 also has a missing extracted date, but has "Leistungsdatum" in text
    const inv2 = fullInvoices.find(i => i.invoiceId === "INV-A-002")!;
    const result2 = processor.process({ ...inv2 });

    console.log(`   ✅ Result: Review Required? ${result2.requiresHumanReview}`);
    console.log(`   📝 Reasoning: ${result2.reasoning}`);
    console.log(`   💡 Extracted Service Date: ${result2.normalizedInvoice.serviceDate} (Auto-filled via Memory!)`);
    console.log(`   🛠  Corrections Applied: ${result2.proposedCorrections}`);

    // ---------------------------------------------------------
    // SCENARIO 2: PARTS AG (Learning Tax Logic)
    // ---------------------------------------------------------
    console.log("\n------------------------------------------");
    console.log("🔹 [PHASE 4] Processing INV-B-001 (Parts AG) - NO MEMORY");
    const inv3 = initialInvoices.find(i => i.invoiceId === "INV-B-001")!;
    // Note: In mock data we simulate the tax being wrong initially regarding inclusive/exclusive
    const result3 = processor.process({ ...inv3 });
    console.log(`   ℹ️  Current Tax Total: ${result3.normalizedInvoice.taxTotal}`);

    console.log("\n🔹 [PHASE 5] HUMAN FEEDBACK LOOP");
    const correctionTax = humanCorrections.find(c => c.invoiceId === "INV-B-001")!;
    console.log(`   👤 Human Corrects: Gross/Tax mismatch detected. Reason: '${correctionTax.reason}'`);

    memory.learnFromCorrection(
        inv3.vendor,
        "grossTotal",
        inv3.grossTotal,
        correctionTax.correctValue,
        inv3.rawText
    );

    console.log("\n🔹 [PHASE 6] Processing INV-B-002 (Parts AG) - WITH MEMORY");
    const inv4 = fullInvoices.find(i => i.invoiceId === "INV-B-002")!;
    const result4 = processor.process({ ...inv4 });
    
    console.log(`   📝 Reasoning: ${result4.reasoning}`);
    console.log(`   🛠  Corrections Applied: ${result4.proposedCorrections}`);

    console.log("\n✅ DEMO COMPLETE. Memory saved to 'agent_memory.json'");
}

runDemo();
