import FtpDeploy from 'ftp-deploy';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: join(__dirname, '../dist'),
  remoteRoot: '/', 
  include: ['dist.zip', 'unzip.php'],
  exclude: [],
  deleteRemote: false,
  forcePasv: true,
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

console.log('--- Iniciando Fast Deploy (ZIP) ---');
ftpDeploy
  .deploy(config)
  .then(() => console.log('✅ Upload concluído com sucesso! Lembre-se de rodar a URL do unzip.'))
  .catch((err) => console.error('❌ Erro no deploy:', err));
