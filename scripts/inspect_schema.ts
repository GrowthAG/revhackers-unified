import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plansRaw = fs.readFileSync(path.resolve(__dirname, '../strategic_plans_dump.json'), 'utf8');
const plans = JSON.parse(plansRaw);

const tunadPlans = plans.filter(p => JSON.stringify(p).includes('TUNAD'));
console.log("Found TUNAD plans:", tunadPlans.length);

if (tunadPlans.length > 0) {
    const p = tunadPlans[0].diagnostic_data;
    console.log("--- TUNAD PLAN SNAPSHOT ---");
    console.log("Executive Summary Keys:", p.executive_summary ? Object.keys(p.executive_summary) : 'Missing');
    if (p.executive_summary) {
        console.log("Executive Summary Content:", JSON.stringify(p.executive_summary, null, 2));
    }
    console.log("Quick Wins Keys (first item):", p.quick_wins && p.quick_wins.length > 0 ? Object.keys(p.quick_wins[0]) : 'Missing');
    if (p.quick_wins) {
        console.log("Quick Wins Content:", JSON.stringify(p.quick_wins, null, 2));
    }
    console.log("Context Mirror:", JSON.stringify(p.context_mirror, null, 2));
}

const sarahPlans = plans.filter(p => !JSON.stringify(p).includes('TUNAD'));
if (sarahPlans.length > 0) {
    const p = sarahPlans[sarahPlans.length - 1].diagnostic_data;
    console.log("--- SARAH PLAN SNAPSHOT ---");
    console.log("Quick Wins Content:", JSON.stringify(p.quick_wins, null, 2));
}
