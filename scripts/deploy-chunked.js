import FtpDeploy from 'ftp-deploy';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOCAL_ROOT = join(__dirname, '../dist');

// Extract all files with relative paths compatible with ftp-deploy
function getFilesRecursive(dir, base = '') {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = join(dir, file);
        const relPath = base ? `${base}/${file}` : file;
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(getFilesRecursive(filePath, relPath));
        } else {
            results.push(relPath);
        }
    }
    return results;
}

const allFiles = getFilesRecursive(LOCAL_ROOT);

// Chunk size of 100 files to avoid Hostinger DDoS Protection
const chunkSize = 100;
const chunks = [];
for (let i = 0; i < allFiles.length; i += chunkSize) {
    chunks.push(allFiles.slice(i, i + chunkSize));
}

console.log(`\n--- SISTEMA ANTI-DDoS ATIVADO ---`);
console.log(`Total de arquivos interceptados: ${allFiles.length}.`);
console.log(`Fatiado em: ${chunks.length} lotes de envio.`);
console.log(`---------------------------------\n`);

async function deployChunks() {
    for (let c = 0; c < chunks.length; c++) {
        console.log(`\n--- Iniciando Lote ${c + 1} de ${chunks.length} ---`);
        const chunk = chunks[c];
        
        const ftpDeploy = new FtpDeploy();
        const config = {
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            host: process.env.FTP_HOST,
            port: 21,
            localRoot: LOCAL_ROOT,
            remoteRoot: '/', 
            include: chunk,
            exclude: [],
            deleteRemote: false,
            forcePasv: true,
        };

        ftpDeploy.on('upload-error', (data) => {
            console.error(`❌ Erro no arquivo: ${data.filename}`, data.err);
        });

        try {
            await ftpDeploy.deploy(config);
            console.log(`✅ Lote ${c + 1} perfeitamente infiltrado! Respirando 4 segundos para evitar bloqueio...`);
            await new Promise(resolve => setTimeout(resolve, 4000));
        } catch (err) {
            console.error(`❌ Interceptação falhou no Lote ${c + 1}:`, err);
            process.exit(1);
        }
    }
    console.log('\n🚀 PLATAFORMA INTEIRAMENTE AO VIVO! GOLPE FINALIZADO COM SUCESSO.');
}

deployChunks();
