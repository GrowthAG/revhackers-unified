import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsRaw = fs.readFileSync(path.resolve(__dirname, '../rei_projects_dump.json'), 'utf8');
const plansRaw = fs.readFileSync(path.resolve(__dirname, '../strategic_plans_dump.json'), 'utf8');

const projects = JSON.parse(projectsRaw);
const plans = JSON.parse(plansRaw);

console.log("Projects:", projects.length);
console.log("Plans:", plans.length);

const analysisLines = [];

for (const plan of plans) {
  const project = projects.find(p => p.id === plan.rei_project_id);
  const clientName = project ? project.client_name : 'Unknown';
  const clientCompany = project ? project.client_company : 'Unknown';
  
  if (!plan.diagnostic_data) {
    analysisLines.push(`Plan ID: ${plan.id} | Client: ${clientName} | Empty diagnostic_data`);
    continue;
  }
  
  const d = plan.diagnostic_data;
  
  analysisLines.push(`==== PLAN FOR ${clientName} (${clientCompany}) | Status: ${plan.status} ====`);
  
  // Executive Summary
  if (d.executive_summary) {
    analysisLines.push(`Summary: ${d.executive_summary.content}`);
    analysisLines.push(`AI Analysis Points:`);
    if (d.executive_summary.points) {
        d.executive_summary.points.forEach(p => {
          analysisLines.push(`  - ${p}`);
        });
    }
  } else {
    analysisLines.push(`Summary: Missing`);
  }
  
  // Context Mirror
  if (d.context_mirror) {
    analysisLines.push(`Context Mirror Segment: ${d.context_mirror.segment}`);
    analysisLines.push(`Context Mirror Objective: ${d.context_mirror.objective}`);
    if (d.context_mirror.insights) {
      analysisLines.push(`Insights:`);
      d.context_mirror.insights.forEach(ins => analysisLines.push(`  - ${ins}`));
    }
  }
  
  // Enriched Analysis
  if (d.enriched_analysis) {
    analysisLines.push(`Enriched Analysis Present: YES (has market, benchmark, or personas)`);
    if (d.enriched_analysis.benchmark) {
      analysisLines.push(`  Benchmark CAC: ${d.enriched_analysis.benchmark.cac_medio || 'N/A'}`);
    }
  } else {
    analysisLines.push(`Enriched Analysis Present: NO`);
  }
  
  // Quick Wins
  if (d.quick_wins && d.quick_wins.length > 0) {
    analysisLines.push(`Quick Wins:`);
    d.quick_wins.forEach(qw => {
       analysisLines.push(`  - ${typeof qw === 'string' ? qw : qw.title + ' -> ' + qw.impact}`);
    });
  } else {
    analysisLines.push(`Quick Wins: Missing or Empty`);
  }
  
  analysisLines.push(`===========================================\n`);
}

fs.writeFileSync(path.resolve(__dirname, '../analysis_output.txt'), analysisLines.join('\n'));
console.log("Analysis output generated at analysis_output.txt");
