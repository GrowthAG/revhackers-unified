
const HistorySection = () => {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-gray-900 uppercase">
            Nossa história
          </h2>
          <p className="text-xl text-gray-600 font-normal tracking-tight">
            De Agência Digital a Hub de Tecnologia e Inteligência Artificial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
              alt="Dashboard de dados e métricas de receita"
              className="rounded-sm shadow-xl w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Do "Feeling" à Engenharia</h3>
            <p className="text-gray-600 leading-relaxed">
              Tudo começou com uma frustração genuína: o mercado estava saturado de "gurus" e agências vendendo métricas de vaidade.
              Likes não pagam contas. Alcance não fecha contratos. Nascemos como <strong>GrowthAG</strong> para desafiar essa lógica,
              focados obsessivamente em uma única coisa: <strong>ROI real e dinheiro no caixa</strong>.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Enquanto o mercado discutia a "cor do botão", nós mergulhamos no código. Como <strong>Growth Agency</strong>, transformamos
              nossa operação em um laboratório de ciência de dados. Testamos, erramos, aprendemos e validamos teses de
              <em>Revenue Operations</em> que se tornaram a base do nosso sucesso. Entendemos que Vendas e Marketing não são departamentos separados,
              são engrenagens de uma mesma máquina.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Hoje, como <strong>RevHackers</strong>, o jogo mudou. Não usamos apenas ferramentas; nós construímos inteligência.
              Somos um Hub de Tecnologia que usa IA para automatizar o que é repetitivo e dar superpoderes ao que é humano.
              Não entregamos apenas "leads"; entregamos uma <strong>vantagem competitiva injusta</strong> para o seu negócio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
