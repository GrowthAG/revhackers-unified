import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Printer, ArrowLeft, Loader2, FileCheck2, CalendarClock, Server } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CertificateOfAuthenticity() {
    const { hash } = useParams<{ hash: string }>();
    const [signature, setSignature] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Certificado_Autenticidade_${hash}`,
    });

    useEffect(() => {
        const fetchSignature = async () => {
            try {
                const { data, error } = await supabase
                    .from('document_signatures')
                    .select('*, rei_projects(trade_name, company_name)')
                    .eq('document_hash', hash)
                    .single();

                if (error) throw error;
                setSignature(data);
            } catch (err) {
                console.error("Erro ao carregar certificado:", err);
            } finally {
                setLoading(false);
            }
        };

        if (hash) fetchSignature();
    }, [hash]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!signature) {
        return (
            <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-zinc-300 mb-4" />
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Certificado não encontrado</h1>
                <p className="text-zinc-500 mb-8 max-w-sm">O hash fornecido não corresponde a nenhum documento assinado em nossos cofres jurídicos.</p>
                <Link to="/" className="text-zinc-900 hover:underline">Voltar para o início</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 py-12 px-4 print:p-0 print:bg-white flex flex-col items-center font-sans">
            
            {/* Toolbar outside of print */}
            <div className="max-w-3xl w-full flex items-center justify-between mb-8 print:hidden">
                <Link to="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>
                <button 
                    onClick={() => handlePrint()}
                    className="bg-black text-white text-sm font-bold px-4 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
            </div>

            {/* Certificate Container */}
            <div 
                ref={printRef}
                className="max-w-3xl w-full bg-white border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[#00CC6A]" />
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64" />
                </div>

                <div className="p-10 md:p-16 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 pb-8 mb-8">
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Certificado de Autenticidade</h1>
                            <p className="text-sm text-zinc-500 font-medium tracking-widest uppercase mt-1">Escudo Jurídico Automático</p>
                        </div>
                        <div className="mt-6 md:mt-0 text-left md:text-right">
                            <img src="/brand/revhackers-wordmark-white.png" alt="RevHackers Logo" className="w-32 max-w-full h-auto object-contain brightness-0 opacity-50 mb-2 md:ml-auto" />
                            <p className="text-xxs text-zinc-400 font-mono">Validador Oficial</p>
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="prose prose-sm md:prose-base text-zinc-700 max-w-none leading-relaxed mb-10">
                        <p>
                            A <strong>RevHackers Growth Hub</strong> certifica, para os devidos fins legais e comprobatórios, que o documento eletrônico identificado pelo tipo <strong>{signature.reference_type.toUpperCase()}</strong> foi aceito e assinado digitalmente, possuindo plena validade jurídica e integridade, em conformidade com a legislação vigente aplicável a contratos e acordos eletrônicos.
                        </p>
                    </div>

                    {/* Fiduciary Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 border border-zinc-200 p-6 mb-10">
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 border-b border-zinc-200 pb-3 mb-1">
                            <FileCheck2 className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-zinc-900 uppercase">Qualificação do Signatário</h3>
                        </div>
                        
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">Nome Completo / Razão Social</p>
                            <p className="text-sm font-semibold text-zinc-900">{signature.signer_name}</p>
                        </div>
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">CPF / CNPJ Registrado</p>
                            <p className="text-sm font-semibold text-zinc-900 font-mono">{signature.signer_cpf_cnpj}</p>
                        </div>
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">E-mail Corporativo Autenticado</p>
                            <p className="text-sm font-semibold text-zinc-900">{signature.signer_email}</p>
                        </div>
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">Cargo / Posição Ocupada</p>
                            <p className="text-sm font-semibold text-zinc-900">{signature.signer_role || 'Não Informado'}</p>
                        </div>
                    </div>

                    {/* Audit Trail Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 border border-zinc-200 p-6 mb-12">
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 border-b border-zinc-200 pb-3 mb-1">
                            <Server className="w-4 h-4 text-zinc-600" />
                            <h3 className="text-sm font-bold text-zinc-900 uppercase">Trilha de Auditoria Técnica</h3>
                        </div>
                        
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> Data e Hora (Timestamp)</p>
                            <p className="text-xs font-mono font-semibold text-zinc-900">
                                {format(new Date(signature.signed_at || signature.created_at), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm:ss", { locale: ptBR })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">IP do Dispositivo</p>
                            <p className="text-xs font-mono font-semibold text-zinc-900">{signature.signer_ip}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <p className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mb-1">User-Agent (Navegador/Sistema)</p>
                            <p className="text-tiny font-mono font-medium text-zinc-600 truncate" title={signature.user_agent}>
                                {signature.user_agent}
                            </p>
                        </div>
                    </div>

                    {/* Cryptographic Hash Block */}
                    <div className="bg-zinc-900 p-6 text-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        <h4 className="text-xxs font-bold text-zinc-400 tracking-[0.3em] uppercase mb-4">Chave Criptográfica SHA-256 (Hash do Documento)</h4>
                        <div className="bg-black border border-zinc-800 p-4 break-all">
                            <code className="text-xs md:text-sm font-mono text-emerald-400">{signature.document_hash}</code>
                        </div>
                        <p className="text-xxs text-zinc-500 mt-4 max-w-lg mx-auto leading-relaxed">
                            Esta chave garante a integridade matemática do documento no momento exato de sua aceitação. Qualquer alteração posterior invalida o hash acima.
                        </p>
                    </div>

                </div>
                
                {/* Footer validation */}
                <div className="bg-zinc-50 p-6 border-t border-zinc-200 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mx-auto mb-2">
                        Validade assegurada pelo art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, que institui a Infra-Estrutura de Chaves Públicas Brasileira (ICP-Brasil).
                    </p>
                    <p className="text-xxs text-zinc-300 font-mono tracking-widest mt-2 block">
                        ID: {signature.id}
                    </p>
                </div>

            </div>
        </div>
    );
}
