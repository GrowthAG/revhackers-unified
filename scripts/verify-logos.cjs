const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando logos dos cases...\n');
console.log('='.repeat(80));

// Lista atualizada dos cases com logos corretos dos arquivos .ts
const cases = [
    { title: 'Lindoya', logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f26a36caf49507d6922fd.png' },
    { title: 'Heineken', logo: '/revhackers-uploads/aada4820-3f12-4185-9af6-811f30795a93.png' },
    { title: 'ENICS', logo: '/revhackers-uploads/a05718ad-1822-4102-909a-7e86af151e98.png' },
    { title: 'PlacLux', logo: '/revhackers-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png' },
    { title: 'Bolt', logo: '/revhackers-uploads/bolt-logo-new.png' },
    { title: 'Funnels', logo: '/revhackers-uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png' },
    { title: 'TOEFL', logo: '/revhackers-uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png' }, // UUID correto
    { title: 'Tikpag', logo: '/revhackers-uploads/tikpag-logo-new.png' },
    { title: 'Tegra', logo: '/revhackers-uploads/tegra-logo-new.png' },
    { title: 'Cruzeiro do Sul', logo: '/revhackers-uploads/cruzeiro-sul-logo-v3.png' },
    { title: 'BT Digital', logo: '/revhackers-uploads/bt-logo-new.png' },
    { title: 'FMU Virtual', logo: '/revhackers-uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png' }, // UUID correto
    { title: 'Emagrecentro', logo: '/revhackers-uploads/emagrecentro-logo-new.png' },
    { title: 'Agence MR', logo: '/revhackers-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png' } // UUID correto
];

const results = {
    ok: [],
    broken: [],
    external: []
};

cases.forEach(({ title, logo }) => {
    // Verificar se é URL externa
    if (logo.startsWith('http')) {
        results.external.push({ title, path: logo });
        console.log(`🌐 ${title.padEnd(25)} | URL externa`);
        return;
    }

    // Verificar se arquivo existe
    const fullPath = path.join(__dirname, '..', 'public', logo);
    const exists = fs.existsSync(fullPath);

    if (exists) {
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        results.ok.push({ title, path: logo, size: sizeKB });
        console.log(`✅ ${title.padEnd(25)} | ${sizeKB.padStart(6)} KB`);
    } else {
        results.broken.push({ title, path: logo, fullPath });
        console.log(`❌ ${title.padEnd(25)} | ${logo} (NÃO ENCONTRADO)`);
    }
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMO:\n');
console.log(`✅ Logos OK: ${results.ok.length}`);
console.log(`❌ Logos Quebrados: ${results.broken.length}`);
console.log(`🌐 URLs Externas: ${results.external.length}`);
console.log(`📦 Total: ${cases.length}`);

if (results.broken.length > 0) {
    console.log('\n🔧 LOGOS QUEBRADOS:\n');
    results.broken.forEach(({ title, path, fullPath }) => {
        console.log(`  • ${title}`);
        console.log(`    Caminho esperado: ${path}`);
        console.log(`    Procurado em: ${fullPath}\n`);
    });
} else {
    console.log('\n🎉 SUCESSO! Todos os logos estão funcionando!\n');
}

console.log('\n' + '='.repeat(80));
