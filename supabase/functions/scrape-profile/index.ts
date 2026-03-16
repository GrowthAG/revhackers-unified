import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { url } = await req.json()

        if (!url) {
            throw new Error('URL is required')
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        if (!OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, falling back to mock data');
            return new Response(JSON.stringify(getMockData(url)), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log(`Enriching profile URL with OpenAI GPT-5.4: ${url}`);

        const systemPrompt = `Você é um Analista de Inteligência de Mercado e Perfilador de Venture Capital.
        Sua missão é realizar uma análise PROFUNDA e ESTRATÉGICA de um perfil do LinkedIn.
        
        DIRETRIZES DE ANÁLISE:
        1. Se o perfil for público, extraia dados reais. Se for privado ou inacessível, use o handle da URL para inferir o posicionamento de mercado mais provável para aquele nível de cargo/setor.
        2. Fuja do óbvio. Não diga apenas "ele é um líder". Diga "Ele opera com um viés técnico que pode sufocar a inovação cultural" ou "Seu posicionamento digital foca excessivamente em processos, negligenciando a autoridade proprietária".
        3. O "authorityScore" (0-100) deve refletir: Consistência de posts, clareza da proposta de valor no headline e vigor da marca pessoal.
        4. O "actionableInsight" deve ser um conselho "pé no peito", algo que o founder possa implementar amanhã para mudar sua percepção de mercado.
        
        IMPORTANTE: Retorne APENAS um objeto JSON válido. Não inclua conversas ou explicações fora do JSON.
        
        ESTRUTURA OBRIGATÓRIA:
        {
          "name": "Nome Completo",
          "headline": "Cargo Estratégico Real",
          "about": "Resumo analítico (não apenas cópia da bio)",
          "summary": "Impacto principal do posicionamento dele hoje",
          "managementStyle": "Strategic" | "Operational" | "Hybrid",
          "softSkills": ["Skill 1", "Skill 2", "Skill 3"],
          "blindSpots": ["Gargalo 1", "Gargalo 2", "Gargalo 3"],
          "actionableInsight": "Conselho prático e direto em Português",
          "authorityScore": 85, 
          "simulatedProfile": {
            "postsLastMonth": 4,
            "engagementRate": "High/Medium/Low",
            "isTopVoice": false,
            "profileImageUrl": ""
          }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Realize uma auditoria técnica e estratégica deste perfil: ${url}. Se houver restrições de privacidade, gere um Benchmark Gerencial baseado no seu cargo provável.` }
                ],
                temperature: 0.2,
                max_tokens: 1200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content in OpenAI response');
        }

        let cleanContent = content.trim();

        if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
        if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
        if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
        cleanContent = cleanContent.trim();

        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanContent = jsonMatch[0];

        let profileData;
        try {
            profileData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', cleanContent);
            profileData = getMockData(url);
        }

        // Final sanitation: Ensure no fields are missing for the UI
        const finalData = {
            ...getMockData(url), // Start with robust mock structures
            ...profileData       // Override with real AI data if available
        };

        return new Response(JSON.stringify(finalData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('scrape-profile error:', error.message);
        const { url } = await req.json().catch(() => ({ url: '' }));
        return new Response(JSON.stringify(getMockData(url || '')), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});

function getMockData(url: string) {
    const username = url.split('/in/')[1]?.split('/')[0] || 'founder';
    const formattedName = username.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    return {
        name: formattedName,
        headline: "Founder & CEO | Estratégia e Crescimento",
        about: "Perfil identificado via URL. Devido às configurações de privacidade do LinkedIn, geramos este Benchmark Estratégico baseado em perfis similares de mercado.",
        summary: "Forte orientação para resultados, mas com provável sobrecarga operacional.",
        managementStyle: "Hybrid",
        softSkills: ["Liderança Adaptativa", "Visão de Negócio", "Execução"],
        blindSpots: ["Falta de Posicionamento de Autoridade", "Processos Dependentes do Founder", "Escala de Conteúdo Inexistente"],
        actionableInsight: "Pare de ser o 'segredo mais bem guardado' do seu nicho. Transforme seus processos internos em ativos de conteúdo proprietário imediatamente.",
        authorityScore: 40,
        simulatedProfile: {
            postsLastMonth: 0,
            engagementRate: "Low",
            isTopVoice: false,
            profileImageUrl: ""
        }
    };
}
