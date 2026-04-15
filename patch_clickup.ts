const fs = require('fs');
const filePath = 'supabase/functions/clickup-orchestrator/index.ts';
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `body: JSON.stringify({ 
          name: clientName,
          override_statuses: true,
          statuses: [
            { status: "Backlog", color: "#b9bdcf", type: "open" },
            { status: "A Fazer", color: "#f2d600", type: "custom" },
            { status: "Em Progresso", color: "#00a2ff", type: "custom" },
            { status: "Em Revisão (Aprov)", color: "#eb5a46", type: "custom" },
            { status: "Aguardando Cliente", color: "#c377e0", type: "custom" },
            { status: "Concluído", color: "#61bd4f", type: "closed" }
          ]
        }),`;

content = content.replace(/body:\s*JSON\.stringify\(\{\s*name:\s*clientName\s*\}\),/s, replacement);
fs.writeFileSync(filePath, content);
console.log('patched');
