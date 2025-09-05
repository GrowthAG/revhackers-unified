import { Linkedin, Users, Target, Search, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LinkedInNavigatorArticle = () => {
  const strategies = [
    {
      title: "Setup Estratégico da Busca",
      description: "Configure filtros cirúrgicos para encontrar prospects perfeitos",
      steps: [
        "Use filtros de cargo + senioridade + tamanho da empresa",
        "Combine localização geográfica com indústria específica",
        "Filtre por 'posted on LinkedIn' nas últimas 30 dias (mais ativos)",
        "Use filtros de conexão (2º e 3º grau) para warm introductions"
      ]
    },
    {
      title: "Research & Intelligence Gathering",
      description: "Colete informações específicas antes do primeiro contato",
      steps: [
        "Analise posts recentes para identificar dores/prioridades",
        "Verifique mudanças de cargo recentes (oportunidade de timing)",
        "Identifique conexões em comum para pedidos de introdução",
        "Analise empresa: crescimento, funding, expansão, contratações"
      ]
    },
    {
      title: "Sequência de Conexão + Mensagem",
      description: "Abordagem em 3 etapas para maximizar resposta",
      steps: [
        "1º: Conecte com nota personalizada (140 caracteres max)",
        "2º: Mensagem de follow-up em 48h (se aceitar conexão)",
        "3º: Valor adicional após 5 dias (insight, article, intro)"
      ]
    },
    {
      title: "Advanced Search Tactics",
      description: "Técnicas para encontrar prospects que seus concorrentes não acham",
      steps: [
        "Use Boolean search: (CMO OR 'Chief Marketing') AND SaaS",
        "Procure por quem mudou de empresa nos últimos 90 dias",
        "Encontre quem está contratando (via 'We're hiring' posts)",
        "Use School filter para encontrar alumni networks"
      ]
    }
  ];

  const templates = [
    {
      name: "Connection Request - Pain Point",
      text: "Oi [Nome], vi que está liderando marketing na [Empresa]. Tenho alguns insights sobre como empresas como [Similar Company] estão escalando [specific challenge]. Vale uma conversa?"
    },
    {
      name: "Connection Request - Mutual Connection",
      text: "Oi [Nome], [Mutual Connection] me recomendou conectar com você sobre [topic]. Ele mencionou que vocês estão trabalhando em [specific initiative]. Posso ajudar com isso!"
    },
    {
      name: "Follow-up Message - Value First",
      text: "Oi [Nome], obrigado por aceitar! Vi seu post sobre [recent post topic]. Isso me lembrou de um case da [Company] que resolveu exatamente isso. Posso compartilhar?"
    },
    {
      name: "Follow-up Message - Insight",
      text: "Oi [Nome], reparei que a [Company] está expandindo o time comercial (+5 vagas). Isso indica crescimento acelerado. Ajudamos a [Similar Company] a escalar de 10 para 50 vendedores sem perder qualidade. Quer ver como?"
    }
  ];

  const tools = [
    {
      name: "Sales Navigator vs LinkedIn Premium",
      comparison: "Navigator tem 3x mais filtros e leads ilimitados",
      best: "Navigator para prospecção ativa, Premium para networking"
    },
    {
      name: "Chrome Extensions",
      tools: "Phantom Buster, Meet Alfred, Expandi",
      warning: "Use com moderação para evitar restrições"
    },
    {
      name: "CRM Integration",
      systems: "HubSpot, Pipedrive, Salesforce",
      benefit: "Sync automático de leads e histórico de interações"
    }
  ];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl">
            <Linkedin className="w-6 h-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Vendas
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          LinkedIn Sales Navigator: guia completo para prospecção B2B
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600 mb-8">
          <span>13 min de leitura</span>
          <span>•</span>
          <span>Giulliano Alves</span>
        </div>
        
        <p className="text-xl text-gray-700 leading-relaxed">
          O Sales Navigator é uma máquina de prospecção quando usado corretamente. 
          Aqui está o sistema completo que uso para gerar 50+ leads qualificados por semana.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
            <div className="text-sm text-gray-600">dos compradores B2B usam LinkedIn para research</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
            <div className="text-sm text-gray-600">mais efetivo que cold email tradicional</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">25%</div>
            <div className="text-sm text-gray-600">taxa de resposta média (vs 2% email)</div>
          </CardContent>
        </Card>
      </div>

      <div className="prose prose-lg max-w-none mb-12">
        <p>
          LinkedIn Sales Navigator não é apenas "LinkedIn com mais filtros". É uma plataforma de intelligence 
          que te dá acesso a <strong>800 milhões de perfis profissionais</strong> com dados atualizados em tempo real.
        </p>
        
        <p>
          O problema? 90% das pessoas usam como um directory básico. Vou te mostrar como usar como 
          uma máquina de prospecção que gera pipeline consistente.
        </p>
      </div>

      {/* 4 Estratégias Principais */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          4 Estratégias Avançadas de Prospecção
        </h2>
        
        <div className="space-y-8">
          {strategies.map((strategy, index) => (
            <Card key={index} className="border border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {strategy.title}
                </CardTitle>
                <p className="text-gray-600">{strategy.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {strategy.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-green-600" />
          Templates que Convertem
        </h2>
        
        <div className="space-y-6">
          {templates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm italic">"{template.text}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="mt-8 border-blue-200 bg-blue-50">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica de personalização:</strong> Sempre substitua [variáveis] por informações específicas. 
            Mensagens genéricas têm taxa de resposta 5x menor.
          </AlertDescription>
        </Alert>
      </div>

      {/* Setup e Ferramentas */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Setup & Ferramentas Complementares</h2>
        
        <div className="space-y-6">
          {tools.map((tool, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tool.comparison && (
                    <p className="text-sm"><strong>Comparação:</strong> {tool.comparison}</p>
                  )}
                  {tool.tools && (
                    <p className="text-sm"><strong>Ferramentas:</strong> {tool.tools}</p>
                  )}
                  {tool.systems && (
                    <p className="text-sm"><strong>Sistemas:</strong> {tool.systems}</p>
                  )}
                  {tool.best && (
                    <p className="text-sm text-green-700"><strong>Melhor uso:</strong> {tool.best}</p>
                  )}
                  {tool.warning && (
                    <p className="text-sm text-orange-700"><strong>Atenção:</strong> {tool.warning}</p>
                  )}
                  {tool.benefit && (
                    <p className="text-sm text-blue-700"><strong>Benefício:</strong> {tool.benefit}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow semanal */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Workflow Semanal de Prospecção</CardTitle>
          <p className="text-gray-600">Sistema para gerar 50+ leads qualificados por semana</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Segunda - Research</strong>
                <p className="text-sm text-gray-600">30 min identificando 100 prospects ideais usando filtros avançados</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Terça/Quarta - Outreach</strong>
                <p className="text-sm text-gray-600">20 connection requests por dia + mensagens personalizadas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Quinta/Sexta - Follow-up</strong>
                <p className="text-sm text-gray-600">Responder conexões aceitas + agendar conversas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <strong>Análise & Otimização</strong>
                <p className="text-sm text-gray-600">Review semanal: taxa de conexão, resposta e conversão para call</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas para acompanhar */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Métricas Essenciais</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Connection requests enviados:</strong> 100-150/semana</li>
                <li>• <strong>Taxa de aceitação:</strong> &gt;60%</li>
                <li>• <strong>Mensagens enviadas:</strong> 50-75/semana</li>
                <li>• <strong>Taxa de resposta:</strong> &gt;20%</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Calls agendadas:</strong> 10-15/semana</li>
                <li>• <strong>SQLs gerados:</strong> 5-8/semana</li>
                <li>• <strong>Pipeline criado:</strong> R$ 50k+/mês</li>
                <li>• <strong>Deals fechados:</strong> 2-4/mês</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Erros comuns */}
      <Alert className="mb-12 border-red-200 bg-red-50">
        <AlertDescription>
          <strong>5 Erros que Matam sua Performance:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Usar a mesma mensagem para todos os prospects</li>
            <li>• Não pesquisar antes de conectar</li>
            <li>• Enviar pitch de vendas na primeira mensagem</li>
            <li>• Não fazer follow-up após conexão aceita</li>
            <li>• Focar em volume ao invés de qualidade</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* CTA */}
      <div className="bg-black text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">
          Quer implementar esse sistema na sua empresa?
        </h3>
        <p className="text-gray-300 mb-6">
          No nosso diagnóstico gratuito, configuramos sua estratégia de LinkedIn + Sales Navigator 
          personalizada para seu ICP e objetivos de vendas.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          Solicitar Diagnóstico Gratuito
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default LinkedInNavigatorArticle;