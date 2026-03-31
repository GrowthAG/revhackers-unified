import React from 'react';

interface DynamicContractProps {
  proposal: any;
  dateStr?: string;
}

export const DynamicContract: React.FC<DynamicContractProps> = ({ proposal, dateStr }) => {
  const currentDate = dateStr || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const setupFee = Number(proposal.setup_fee || 0);
  const investmentTotal = Number(proposal.investment_total || 0);
  const chargeAmount = setupFee > 0 ? setupFee : investmentTotal;

  return (
    <div className="w-full h-64 overflow-y-auto bg-zinc-50 border border-zinc-200 p-6 text-tiny leading-relaxed text-zinc-600 font-mono shadow-inner custom-scrollbar relative">
      <div className="text-center mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-1">CONTRATO DE PRESTAÇÃO DE SERVIÇOS Revtech Systems LTDA</h2>
        <p className="text-zinc-500 font-sans">Nº {proposal.id?.split('-')[0].toUpperCase()} / {new Date().getFullYear()}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-zinc-900 mb-2 uppercase">QUALIFICAÇÃO DAS PARTES</h3>
        <p className="mb-2">
          <strong>CONTRATADA</strong><br/>
          Revtech Systems LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 64.551.707/0001-79, com sede na Avenida Paulista, 1636, Sala 1105, Bela Vista, São Paulo – SP, CEP 01310-200, doravante denominada simplesmente CONTRATADA.
        </p>
        <p>
          <strong>CONTRATANTE</strong><br/>
          {proposal.client_name}, pessoa jurídica de direito privado, {proposal.crm_data?.cnpj ? `inscrita no CNPJ sob o nº ${proposal.crm_data.cnpj}` : 'portadora de CNPJ a ser formalizado'}, doravante denominada simplesmente CONTRATANTE.
        </p>
        <p className="mt-4 italic">
          As partes acima qualificadas, doravante denominadas em conjunto como "PARTES", celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir descritas.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-zinc-900 mb-2 uppercase">CLÁUSULAS E CONDIÇÕES</h3>
        <p className="font-bold mb-1">Cláusula 1ª – DO OBJETO</p>
        <p className="mb-2">O presente contrato tem por objeto a prestação de serviços especializados de consultoria em Revenue Operations pela CONTRATADA à CONTRATANTE, de acordo com o escopo detalhado anexado à Proposta Comercial.</p>
        <p className="mb-2">§1º Os serviços serão prestados de forma remota, sem geração de vínculo empregatício, societário ou de qualquer outra natureza entre as PARTES.</p>
      </div>

      <div className="mb-6">
        <p className="font-bold mb-1">Cláusula 2ª – DO ESCOPO DOS SERVIÇOS</p>
        <p className="mb-2">Integram o escopo deste contrato os itens descritos no detalhamento operacional desta plataforma ("Deal Room"), que passam a fazer parte integrante deste instrumento.</p>
        <p className="mb-2">§1º Quaisquer serviços fora do escopo aprovado somente serão executados mediante proposta adicional aprovada e assinada por ambas as PARTES (change request).</p>
      </div>

      <div className="mb-6">
        <p className="font-bold mb-1">Cláusula 3ª – DA REMUNERAÇÃO E FORMA DE PAGAMENTO</p>
        <p className="mb-2">Em contraprestação aos serviços descritos neste contrato, a CONTRATANTE realizará o pagamento nas seguintes condições:</p>
        <div className="bg-zinc-100 p-3 rounded mb-2 font-sans text-xs">
          <strong>Valor Acordado:</strong> R$ {chargeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
          <strong>Pagamento:</strong> {proposal.payment_terms || "Processamento via Gateway Seguro Integrado."}
        </div>
        <p className="mb-2">§1º A emissão do link ou instrução de pagamento é realizada eletronicamente. O início dos serviços fica condicionado à confirmação da quitação integral ou aprovação pelos gateways bancários.</p>
        <p className="mb-2">§2º A CONTRATADA emitirá nota fiscal pelos serviços prestados correspondente ao valor efetivamente processado.</p>
      </div>

      <div className="mb-6">
        <p className="font-bold mb-1">Cláusula 4ª – DA PROPRIEDADE INTELECTUAL E CONFIDENCIALIDADE</p>
        <p className="mb-2">As configurações, métricas e dados gerados passam a ser de propriedade da CONTRATANTE após a quitação. A metodologia e know-how não são transferidos e permanecem de propriedade exclusiva da CONTRATADA.</p>
        <p className="mb-2">§1º As PARTES obrigam-se a manter sigilo absoluto sobre informações confidenciais a que tiverem acesso em razão deste contrato.</p>
      </div>

      <div className="mb-6">
        <p className="font-bold mb-1">Cláusula 5ª – DISPOSIÇÕES FINAIS E FORO</p>
        <p className="mb-2">Este contrato não gera qualquer vínculo empregatício. Qualquer alteração somente produzirá efeitos se formalizada por escrito.</p>
        <p className="mb-2">§1º As PARTES elegem o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir controvérsias.</p>
      </div>

      <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 text-center">
        <p className="font-bold mb-2">ASSINATURA ELETRÔNICA CONFIRMADA</p>
        <p>São Paulo, {currentDate}</p>
        <p className="italic mt-4 opacity-75">Este documento possui validade jurídica mediante aceite eletrônico na plataforma (Art. 10, § 2º, Medida Provisória nº 2.200-2/2001), chancelado por registros de IP e Timestamp em banco de dados seguro.</p>
      </div>
    </div>
  );
};
