export function getDisplayName(params: {
    trade_name?: string | null;
    client_company?: string | null;
    client_name?: string | null;
}): string {
    const tradeName = params.trade_name;
    const clientCompany = params.client_company;
    const clientName = params.client_name;

    // Prioridade: nome fantasia > razao social limpa > nome do contato
    if (tradeName) return tradeName;

    const raw = clientCompany || clientName || 'Projeto';

    // Limpar sufixos juridicos da razao social para exibicao
    const cleaned = raw
        .replace(/\s+(LTDA|EIRELI|S\.?A\.?|ME|EPP|S\/S|SERVICOS|SERVIÇOS|MARKETING|CONSULTORIA|TECNOLOGIA|PLATAFORM|PLATFORM|DIGITAL|SOLUCOES|SOLUÇÕES|MOMENT|GROUP|BRASIL)\b/gi, '')
        .trim();
    const words = cleaned.split(/\s+/);
    const brandName = words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;

    return brandName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || raw;
}

export function formatCurrency(val: number): string {
    if (!val) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
    }).format(val);
}

export function getDaysSince(iso: string | null): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
