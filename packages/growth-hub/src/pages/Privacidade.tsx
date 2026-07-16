
import PageLayout from '@/components/layout/PageLayout';

const Privacidade = () => {
  return (
    <PageLayout>
      <section className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-10 text-gray-800 border-b pb-4">Política de Privacidade</h1>
            
            <div className="prose prose-lg max-w-none space-y-8">
              <p className="text-lg text-gray-700 bg-gray-50 p-4 rounded-md border-l-4 border-revgreen">
                A RevHackers se compromete a proteger sua privacidade. Esta Política de Privacidade 
                explica como coletamos, usamos e protegemos suas informações pessoais quando você 
                utiliza nosso site e serviços.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">1. Informações que Coletamos</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos coletar os seguintes tipos de informações:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-3">
                  <strong>Informações de identificação pessoal:</strong> nome, endereço de email, 
                  número de telefone, empresa e cargo que você fornece ao preencher formulários ou 
                  solicitar nossos serviços.
                </li>
                <li className="mb-3">
                  <strong>Informações de uso:</strong> como você interage com nosso site, incluindo 
                  páginas visitadas, tempo de permanência e interações.
                </li>
                <li className="mb-3">
                  <strong>Informações técnicas:</strong> endereço IP, tipo de navegador, 
                  dispositivo utilizado e sistema operacional.
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800">2. Como Usamos Suas Informações</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2">Fornecer, manter e melhorar nossos serviços</li>
                <li className="mb-2">Processar suas solicitações e responder suas dúvidas</li>
                <li className="mb-2">Enviar informações sobre nossos serviços, atualizações e eventos</li>
                <li className="mb-2">Personalizar sua experiência em nosso site</li>
                <li className="mb-2">Analisar tendências de uso para melhorar nossa plataforma</li>
                <li className="mb-2">Cumprir obrigações legais</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 leading-relaxed">
                Não vendemos, alugamos ou negociamos suas informações pessoais com terceiros. 
                Podemos compartilhar suas informações com:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2">Prestadores de serviços que nos auxiliam na operação do site</li>
                <li className="mb-2">Parceiros comerciais com seu consentimento prévio</li>
                <li className="mb-2">Autoridades legais quando exigido por lei</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800">4. Cookies e Tecnologias Semelhantes</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies e tecnologias similares para coletar informações sobre suas 
                interações com nosso site. Você pode configurar seu navegador para recusar cookies, 
                mas isso pode limitar sua experiência em nosso site.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">5. Segurança</h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de segurança projetadas para proteger suas informações 
                pessoais. No entanto, nenhum método de transmissão pela internet ou armazenamento 
                eletrônico é 100% seguro.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">6. Seus Direitos</h2>
              <p className="text-gray-700 leading-relaxed">
                Você tem os seguintes direitos relacionados aos seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2">Acessar e receber uma cópia dos seus dados</li>
                <li className="mb-2">Retificar dados incorretos ou incompletos</li>
                <li className="mb-2">Solicitar a exclusão dos seus dados (quando aplicável)</li>
                <li className="mb-2">Restringir ou opor-se ao processamento dos seus dados</li>
                <li className="mb-2">Retirar seu consentimento a qualquer momento</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-800">7. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos suas informações pessoais pelo tempo necessário para cumprir as 
                finalidades para as quais foram coletadas, incluindo o atendimento de 
                requisitos legais, contábeis ou de relatórios.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">8. Links para Sites de Terceiros</h2>
              <p className="text-gray-700 leading-relaxed">
                Nosso site pode conter links para sites de terceiros. Não somos responsáveis 
                pelas práticas de privacidade desses sites.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">9. Alterações na Política de Privacidade</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que 
                você revise esta página regularmente para se manter informado sobre as alterações.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800">10. Contato</h2>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco pelo email: 
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

export default Privacidade;
