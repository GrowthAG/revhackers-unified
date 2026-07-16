
import PageLayout from '@/components/layout/PageLayout';

const TermosDeUso = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-10 text-gray-800 border-b pb-4">Termos de Uso</h1>
            
            <div className="prose prose-lg max-w-none space-y-8">
              <h2 className="text-2xl font-semibold text-gray-800">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e utilizar os serviços da RevHackers, você concorda com estes Termos de Uso.
                Se você não concordar com qualquer parte destes termos, não poderá utilizar nossos serviços.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">2. Descrição dos Serviços</h2>
              <p className="text-gray-700 leading-relaxed">
                A RevHackers oferece serviços de consultoria em marketing digital, automação de processos, 
                estratégia de crescimento e implementação de soluções de Revenue Operations para empresas.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">3. Uso do Site e Serviços</h2>
              <p className="text-gray-700 leading-relaxed">
                Você concorda em usar nosso site e serviços apenas para fins legais e de acordo com estes Termos.
                Você não poderá:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2">Usar o serviço para qualquer finalidade ilegal</li>
                <li className="mb-2">Tentar acessar áreas restritas do site</li>
                <li className="mb-2">Tentar interferir com a integridade ou segurança do site</li>
                <li className="mb-2">Copiar, modificar ou distribuir nosso conteúdo sem autorização expressa</li>
                <li className="mb-2">Realizar engenharia reversa de qualquer parte do serviço</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800">4. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo disponível em nosso site, incluindo mas não se limitando a textos, gráficos, 
                logos, ícones, imagens, clipes de áudio, downloads digitais, e compilações de dados, é propriedade 
                da RevHackers e está protegido por leis de direitos autorais.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">5. Privacidade</h2>
              <p className="text-gray-700 leading-relaxed">
                Sua privacidade é importante para nós. Nossa <a href="/privacidade" className="text-revgreen hover:underline font-medium">Política de Privacidade</a> explica 
                como coletamos, usamos e protegemos suas informações pessoais.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">6. Cadastro e Segurança</h2>
              <p className="text-gray-700 leading-relaxed">
                Alguns serviços podem exigir cadastro. Você é responsável por manter a confidencialidade de sua
                conta e senha. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed">
                A RevHackers não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais 
                ou consequentes resultantes do uso ou incapacidade de usar nossos serviços.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">8. Alterações nos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Modificações 
                entrarão em vigor após sua publicação em nosso site. O uso contínuo dos serviços após tais alterações
                constitui sua aceitação dos novos termos.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">9. Lei Aplicável</h2>
              <p className="text-gray-700 leading-relaxed">
                Estes Termos são regidos pelas leis brasileiras. Qualquer disputa relacionada a estes Termos 
                será submetida à jurisdição exclusiva dos tribunais da cidade de São Paulo, SP.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">10. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver dúvidas sobre estes Termos, entre em contato conosco pelo email: 
                <a href="mailto:contato@revhackers.com.br" className="text-revgreen hover:underline font-medium ml-1">contato@revhackers.com.br</a>
              </p>
              
              <div className="text-sm text-gray-500 mt-12 pt-6 border-t border-gray-200">
                Última atualização: 8 de Abril de 2025
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TermosDeUso;
