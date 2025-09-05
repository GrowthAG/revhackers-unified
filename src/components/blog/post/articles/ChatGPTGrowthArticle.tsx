import { ArrowRight, Copy, CheckCircle, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const ChatGPTGrowthArticle = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, promptName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(promptName);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const prompts = [
    {
      category: "Pesquisa de Mercado",
      prompts: [
        {
          name: "Análise de Concorrência",
          prompt: "Atue como um analista de mercado especializado em [SEU_SETOR]. Analise os 5 principais concorrentes de [SUA_EMPRESA], focando em: 1) Propostas de valor únicas, 2) Estratégias de preços, 3) Canais de marketing utilizados, 4) Pontos fortes e fracos, 5) Oportunidades de diferenciação. Estruture a resposta em formato de tabela comparativa.",
          use: "Para entender posicionamento competitivo"
        },
        {
          name: "Personas Detalhadas",
          prompt: "Crie 3 personas detalhadas para [SEU_PRODUTO/SERVIÇO]. Para cada persona, inclua: Demografia, Psicografia, Principais dores, Objetivos profissionais, Canais de comunicação preferidos, Objeções típicas na compra, Jornada de compra. Use dados comportamentais realistas do mercado [SEU_MERCADO].",
          use: "Para segmentação precisa"
        }
      ]
    },
    {
      category: "Criação de Conteúdo",
      prompts: [
        {
          name: "Headlines Irresistíveis",
          prompt: "Crie 10 headlines para [SEU_PRODUTO] que sigam as fórmulas: 1) Problema + Solução + Resultado, 2) Número + Benefício + Prazo, 3) Como + Resultado + Sem Problema. Foque na dor: [DOR_PRINCIPAL] e no resultado: [RESULTADO_DESEJADO]. Inclua power words e gatilhos emocionais.",
          use: "Para landing pages e anúncios"
        },
        {
          name: "Scripts de Vídeo",
          prompt: "Crie um script de vídeo de 60-90 segundos para [PLATAFORMA] sobre [TÓPICO]. Estrutura: Hook (primeiros 3 segundos), Problema (10s), Agitação (15s), Solução (30s), Prova social (15s), CTA claro (10s). Tom: [TOM_DESEJADO]. Inclua indicações visuais e momentos de pausa.",
          use: "Para redes sociais e ads"
        }
      ]
    },
    {
      category: "Email Marketing",
      prompts: [
        {
          name: "Sequência de Nurturing",
          prompt: "Desenvolva uma sequência de 5 emails para nutrir leads que baixaram [LEAD_MAGNET]. Email 1: Entrega + valor extra, Email 2: Problema comum + história, Email 3: Objeção principal + resposta, Email 4: Prova social + case, Email 5: CTA forte + urgência. Inclua subject lines e timing de envio.",
          use: "Para automação de leads"
        },
        {
          name: "Cold Email B2B",
          prompt: "Crie um cold email para [CARGO_ALVO] de empresas [TIPO_EMPRESA] oferecendo [SEU_SERVIÇO]. Use: Linha de assunto personalizada, Primeira linha ultra-relevante, Problema específico do cargo, Solução concisa, CTA de baixo risco, PS com valor adicional. Máximo 100 palavras.",
          use: "Para prospecção direta"
        }
      ]
    },
    {
      category: "Otimização de Conversão",
      prompts: [
        {
          name: "Análise de Landing Page",
          prompt: "Analise esta landing page [URL_OU_DESCRIÇÃO] como especialista em CRO. Avalie: 1) Clareza da proposta, 2) Hierarquia visual, 3) Elementos de confiança, 4) Friction points, 5) CTA effectiveness. Sugira 5 melhorias específicas com impacto estimado na conversão.",
          use: "Para otimizar páginas"
        },
        {
          name: "Testes A/B",
          prompt: "Sugira 3 testes A/B para [ELEMENTO] baseados nos princípios de psicologia da persuasão. Para cada teste: Hipótese clara, Variação específica, Métrica principal, Duração estimada, Significância estatística necessária. Foque em mudanças de alto impacto.",
          use: "Para experimentação"
        }
      ]
    },
    {
      category: "Estratégia de Canais",
      prompts: [
        {
          name: "Mix de Canais",
          prompt: "Recomende o mix ideal de canais de marketing para [SEU_NEGÓCIO] com orçamento de [VALOR]. Considere: CAC por canal, Tempo até ROI, Escalabilidade, Recursos necessários, Sinergia entre canais. Priorize por impacto vs esforço e sugira distribuição percentual do budget.",
          use: "Para planejamento estratégico"
        },
        {
          name: "Funil de Conversão",
          prompt: "Desenhe um funil de conversão completo para [SEU_PRODUTO] considerando jornada de [X] dias. Inclua: Touchpoints por etapa, Conteúdo específico, Métricas de conversão realistas, Pontos de abandono típicos, Estratégias de reativação. Calcule CAC e LTV estimados.",
          use: "Para arquitetura de marketing"
        }
      ]
    }
  ];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            IA & Automação
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          ChatGPT para Growth: 15 prompts que dobram sua produtividade em marketing
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600 mb-8">
          <span>12 min de leitura</span>
          <span>•</span>
          <span>Carlos Mendes</span>
        </div>
        
        <p className="text-xl text-gray-700 leading-relaxed">
          Transforme o ChatGPT em seu assistente de marketing mais poderoso com estes prompts específicos, 
          testados em dezenas de campanhas reais e responsáveis por aumentar a produtividade em até 300%.
        </p>
      </div>

      {/* Introdução */}
      <div className="prose prose-lg max-w-none mb-12">
        <p>
          Se você ainda usa o ChatGPT apenas para "escrever um texto sobre X", está desperdiçando 90% do potencial 
          desta ferramenta. Os profissionais de marketing mais eficientes descobriram que a chave não está na IA em si, 
          mas nos <strong>prompts específicos e estruturados</strong> que você usa.
        </p>
        
        <p>
          Após testar mais de 200 prompts diferentes em campanhas reais, compilei os 15 que realmente fazem diferença. 
          Cada um foi refinado através de iterações com clientes reais e resultados mensuráveis.
        </p>
      </div>

      {/* Como usar */}
      <Card className="mb-12 border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Como usar estes prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>• <strong>Substitua as variáveis:</strong> Troque [SUAS_VARIÁVEIS] pelas informações específicas</li>
            <li>• <strong>Itere:</strong> Use a resposta inicial como base e refine com prompts de follow-up</li>
            <li>• <strong>Contextualize:</strong> Sempre forneça contexto específico sobre seu negócio</li>
            <li>• <strong>Teste:</strong> Adapte os prompts para sua realidade e teste os resultados</li>
          </ul>
        </CardContent>
      </Card>

      {/* Prompts por categoria */}
      {prompts.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            {category.category}
          </h2>
          
          <div className="space-y-6">
            {category.prompts.map((item, promptIndex) => (
              <Card key={promptIndex} className="border border-gray-200 hover:border-green-300 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.prompt, item.name)}
                      className="flex items-center gap-2"
                    >
                      {copiedPrompt === item.name ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{item.use}</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                      {item.prompt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Dicas extras */}
      <Card className="mb-12 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl">Dicas para Maximizar Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Contexto é tudo</h4>
              <p className="text-sm text-gray-700">
                Quanto mais específico você for sobre seu negócio, público e objetivos, 
                melhores serão as respostas do ChatGPT.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Itere e refine</h4>
              <p className="text-sm text-gray-700">
                Use prompts de follow-up como "Torne mais específico para empresas SaaS B2B" 
                ou "Adicione 3 variações dessa headline".
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Combine prompts</h4>
              <p className="text-sm text-gray-700">
                Use o output de um prompt como input para outro. Por exemplo, 
                personas → headlines → emails → landing pages.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Sempre teste</h4>
              <p className="text-sm text-gray-700">
                O ChatGPT oferece um excelente ponto de partida, mas sempre 
                teste e valide com dados reais do seu mercado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-black text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">
          Quer mais prompts específicos para seu negócio?
        </h3>
        <p className="text-gray-300 mb-6">
          Nosso diagnóstico gratuito inclui prompts personalizados para sua situação específica, 
          além de uma análise completa da sua operação de marketing.
        </p>
        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
          Solicitar Diagnóstico Gratuito
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default ChatGPTGrowthArticle;