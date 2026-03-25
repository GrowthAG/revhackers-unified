import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const extracted_text = `
# Roadmap Growth Tunad by ThinkBusiness Platform®

### **1. Ecossistema TUNAD PLATFORM**
*   **The Growth Journey > 8 Stages of Scale:**
    *   Level 1: Sell and serve 10/50 customers (Product/Market Fit).
    *   Level 2: Automate customer acquisition via a Growth Flywheel.
    *   Level 3: Upgrade business operating system (SOPs, Playbooks, Dashboards).
    *   Level 4: Double take-home pay.
    *   Level 5: Build an Advisory Board.
    *   Level 6: Expand through acquisitions.
    *   Level 7: Wealth-building mode.

### **2. Pilares Estratégicos de Growth (Strategic Pillars)**
*   **Marketing (Always ON):**
    *   Production & Optimization: Journalistic content, rich materials.
    *   Social Media Management: Tier 1 (TikTok, IG, LinkedIn) and Tier 2 (YouTube, FB, Twitter).
    *   PR & Influencer Engagement.
*   **Sales Strategy (Vendas):**
    *   Funnel Actions: Top, Middle, Bottom.
    *   Events: Partnerships, ABM Tier 1.
    *   Loyalty: "Tunad Prime".

### **3. VENDAS (Sales Management & Operations)**
*   **Team Structure:** CGO/Head of Growth, CS Manager, Sales Manager, SDRs, and Marketing Analysts.
*   **Variable Compensation:** OTE model based on 100% result attainment.
*   **Weekly CRM Cadence:** Monday (Strategic), Wednesday (Scrum), Friday (Review).

### **4. CUSTOMER SUCCESS (CS)**
*   **Philosophy:** "Besemer's 10 Laws".
*   **2026 CS Plan:** Fase 1 (Onboarding), Fase 2 (Departmental penetration), Fase 3 (QBR of Value).

### **5. Roadmap & Ramping (350K NMRR Target)**
*   Fevereiro (The Attack): Launch Radar Competitivo
*   Março (Education): Russell Brunson model webinar
*   Abril (Expansion): MVP Channel Program
*   Maio (Intensification): Maximizar average ticket
*   Junho (The Whale): Closing Key Accounts

### **6. PLANOS DE AÇÃO & GTM (Go-to-Market)**
*   **RevOps Semanal 26H1:** Targets for lead reactivation & conversion.
*   **90-Day Phases:** Preparation, Acquisition, Expansion.
`;

async function run() {
    const { data, error } = await supabase
        .from('rei_materials')
        .insert({
            project_id: 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02',
            material_type: 'fluxograma',
            source_type: 'upload',
            file_url: null,
            original_name: 'MindMeister Extraído [Via IA] - Tunad',
            description: 'Essa é a transcrição bruta do MindMap extraída via Visão Computacional pelo agente do REI.',
            extracted_text: extracted_text,
            status: 'ready'
        });

    if (error) {
        console.error(error);
        process.exit(1);
    }
    console.log("Success! Text inserted.");
}

run();
