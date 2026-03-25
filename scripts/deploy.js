import FtpDeploy from 'ftp-deploy';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ftpDeploy = new FtpDeploy();

// Configurações do FTP usando variáveis de ambiente
const config = {
  user: process.env.FTP_USER,
  // Password se for omitido, será solicitado via console
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  // O caminho local é a pasta de build (dist)
  localRoot: join(__dirname, '../dist'),
  remoteRoot: '/', // A conta FTP rebhub já cai direto dentro da public_html
  include: ['*', '**/*', '.htaccess'],      // Envie todos os arquivos (incluindo dotfiles essenciais)
  exclude: [
    '.git/**',
    'node_modules/**',
    '.env', // NUNCA FAÇA UPLOAD DO SEU .ENV!!!
  ],
  deleteRemote: false, // Desativado pra Hostinger não dar timeout limpando a pasta inteira primeiro
  forcePasv: true, // O passivo reduz problemas de firewall
};

ftpDeploy
  .on('uploading', (data) => {
    console.log(`Subindo arquivo: ${data.filename} (${data.transferredFileCount} / ${data.totalFilesCount})`);
  })
  .on('uploaded', (data) => {
    console.log(`✓ Arquivo enviado: ${data.filename}`);
  })
  .on('upload-error', (data) => {
    console.error(`❌ Erro no arquivo: ${data.filename}`, data.err);
  });

console.log('--- Iniciando Deploy na Hostinger ---');
if (!config.user || !config.host) {
  console.error("ERRO: As variáveis FTP_USER e FTP_HOST não estão definidas no arquivo .env");
  process.exit(1);
}

ftpDeploy
  .deploy(config)
  .then((res) => console.log('✅ Deploy finalizado com sucesso! SITE NO AR!'))
  .catch((err) => console.error('❌ Erro no deploy:', err));
