const fs = require('fs');

async function check() {
    let env = '';
    try { 
        env = fs.readFileSync('.env', 'utf-8'); 
    } catch(e) { 
        console.log('Sem .env'); process.exit(1); 
    }

    const urlMatch = env.match(/VITE_SUPABASE_URL=([^\n\r]+)/);
    const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\n\r]+)/);

    if (urlMatch && keyMatch) {
        const url = urlMatch[1].replace(/['"]/g, '').trim();
        const key = keyMatch[1].replace(/['"]/g, '').trim();

        console.log('Verificando "tunad" em rei_projects...');
        const r1 = await fetch(url + '/rest/v1/rei_projects?select=*&client_name=ilike.*tunad*', {
            headers: { apikey: key, Authorization: 'Bearer ' + key }
        });
        const data = await r1.json();
        
        if (data && data.length > 0) {
            console.log('✅ Cliente ENCONTRADO em rei_projects:', data.map(p => ({ id: p.id, name: p.client_name })));
            const r2 = await fetch(url + '/rest/v1/rei_responses?select=*&project_id=eq.' + data[0].id, {
                headers: { apikey: key, Authorization: 'Bearer ' + key }
            });
            const resp = await r2.json();
            
            if (resp && resp.length > 0) {
                console.log('✅ As respostas estão SALVAS no Banco de Dados para este projeto!');
                console.log('Preview do Data Keys:', Object.keys(resp[0].responses.form_data));
                return;
            } else {
                console.log('⚠️ Projeto existe, mas tabela rei_responses está vazia para ele!');
            }
        } else {
            console.log('Nenhum projeto explícito chamado tunad na tabela rei_projects.');
            
            // Fallback: search in JSON body of all responses
            console.log('Buscando em TODAS as respostas globais...');
            const r3 = await fetch(url + '/rest/v1/rei_responses?select=id,responses,created_at&order=created_at.desc&limit=50', {
                headers: { apikey: key, Authorization: 'Bearer ' + key }
            });
            const resp3 = await r3.json();
            if (!resp3 || resp3.error) {
                console.error('Erro na API:', resp3);
                return;
            }
            
            const found = resp3.filter(r => JSON.stringify(r.responses).toLowerCase().includes('tunad'));
            if (found.length > 0) {
                console.log('✅ As respostas do cliente TUNAD foram localizadas nos arquivos brutos do JSON das ultimas 50! Estão seguras.');
                console.log('Preview do Data Keys:', Object.keys(found[0].responses.form_data));
            } else {
                console.log('❌ O formulário do Tunad NÃO CAIU NO BANCO DE DADOS.');
            }
        }
    } else {
        console.log('Credenciais do Supabase não encontradas no .env');
    }
}

check();
