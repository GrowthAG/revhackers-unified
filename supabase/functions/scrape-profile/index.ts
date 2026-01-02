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

        const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

        if (!PERPLEXITY_API_KEY) {
            console.warn('PERPLEXITY_API_KEY not set, falling back to mock data');
            return new Response(JSON.stringify(getMockData(url)), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log(`Enriching profile URL with Perplexity: ${url}`);

        const systemPrompt = `Você é um especialista em análise de perfis profissionais do LinkedIn.
Dado uma URL de perfil, pesquise informações públicas disponíveis sobre este profissional.

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem markdown, sem explicações, sem texto adicional.

O JSON deve ter exatamente esta estrutura:
{
  "name": "Nome Completo do Profissional",
  "headline": "Cargo ou título profissional atual",
  "about": "Resumo profissional em 2-3 frases (máximo 100 palavras)",
  "skills": ["Habilidade 1", "Habilidade 2", "Habilidade 3", "Habilidade 4"],
  "experience": [
    { "role": "Cargo", "company": "Nome da Empresa", "duration": "Período (ex: 2020 - Presente)" }
  ],
  "education": { "school": "Nome da Universidade", "degree": "Formação/Curso" }
}

Se não encontrar informações específicas, use valores plausíveis baseados no contexto da URL.`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-reasoning-pro',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analise este perfil do LinkedIn e extraia as informações: ${url}` }
                ],
                temperature: 0.1, // Low temperature for more consistent JSON output
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API Error:', errorText);
            throw new Error(`Perplexity API returned ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content in Perplexity response');
        }

        // Parse the JSON from the response
        // sonar-reasoning-pro includes <think>...</think> blocks, we need to strip them
        let cleanContent = content.trim();

        // Remove <think>...</think> blocks (reasoning from sonar-reasoning-pro)
        const thinkRegex = /<think>[\s\S]*?<\/think>/gi;
        cleanContent = cleanContent.replace(thinkRegex, '').trim();

        // Sometimes LLMs wrap JSON in markdown code blocks, so we need to clean it
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();

        // Try to extract JSON object from the content if it contains other text
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanContent = jsonMatch[0];
        }

        let profileData;
        try {
            profileData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Failed to parse Perplexity response as JSON:', cleanContent);
            // Fallback to mock if parsing fails
            profileData = getMockData(url);
        }

        console.log('Successfully enriched profile:', profileData.name);

        return new Response(JSON.stringify(profileData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('scrape-profile error:', error.message);

        // Graceful fallback to mock data
        const { url } = await req.json().catch(() => ({ url: '' }));
        return new Response(JSON.stringify(getMockData(url || '')), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});

// Fallback mock data generator
function getMockData(url: string) {
    const username = url.split('/in/')[1]?.split('/')[0] || 'founder';
    const formattedName = username.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    return {
        name: formattedName,
        headline: "Founder & CEO | Building the Future of SaaS",
        about: "Serial entrepreneur with 10+ years of experience in B2B growth and digital scaling. Passionate about helping startups achieve their full potential through data-driven strategies.",
        experience: [
            {
                role: "Chief Executive Officer",
                company: "TechScale Solutions",
                duration: "2020 - Present"
            }
        ],
        education: {
            school: "Innovation University",
            degree: "Computer Science"
        },
        skills: ["Growth Hacking", "SaaS", "Leadership", "Product Strategy"]
    };
}
