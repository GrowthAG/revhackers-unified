
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://eqspbruarsdybpfeijnf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTikPag() {
    console.log("Updating TikPag with correct keys...");

    const { error } = await supabase
        .from('cases')
        .update({
            case_category: 'Fintech • Mercado Imobiliário',
            title: 'TikPag: O Checkout do Mercado Imobiliário',
            image_url: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c65f6ec583d6e953d557d.jpg',
            client_logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c65f7e4db33ed17ffc229.png',
            preview_description: 'Split de pagamentos automático para imobiliárias e corretores: O fim da bitributação de comissões.',
            challenge: 'Imobiliárias sofriam com a "Bitributação" ao receber o valor cheio da venda para depois repassar a comissão do corretor. Além disso, o processo de cobrança de sinal era lento e manual, fazendo vendas caírem por "esfriamento" do cliente.',
            solution: 'Desenvolvemos uma adquirente (Subadquirente) nichada para o mercado imobiliário. A solução "Split de Pagamentos" divide, no ato do passar do cartão, o que é da Imobiliária e o que é do Corretor. O dinheiro já cai na conta de cada um, resolvendo a bitributação fiscal e agilizando o fechamento de vendas em stands.',
            results: ["R$ 100MM em TPV processado", "Eliminação da Bitributação", "Vendas em 12x no Cartão para Sinal"],
            metrics: [{ "value": "R$ 120M", "label": "TPV Transacionado" }, { "value": "24h", "label": "Liquidez (D+1)" }, { "value": "-15%", "label": "Economia Fiscal" }],
            primary_metric: 'R$ 120M TPV'
        })
        .eq('slug', 'tikpag');

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Success! TikPag updated.");
    }
}

updateTikPag();
