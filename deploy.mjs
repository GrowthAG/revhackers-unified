import FtpDeploy from 'ftp-deploy';
import dotenv from 'dotenv';
dotenv.config();

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD || process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: './dist',
  remoteRoot: '/', // A conta FTP rebhub já cai direto dentro da public_html
  include: ['*', '**/*', '.htaccess'],      // Garante upload dos ocultos também
  exclude: ['dist/**/*.map', 'node_modules/**', 'node_modules/**/.*', '.git/**'], // Exclui arquivos desnecessários
  deleteRemote: false,          // Não deletamos a remote inteira por segurança, fazemos overwrite
  forcePasv: true,
  sftp: false,                  // Hostinger regular usa FTP normal pro public_html comummente
  connOpts: {
    keepalive: 10000,           // Envia keepalive a cada 10s para evitar idle timeout (60s) da Hostinger
    pasvTimeout: 120000,        // Aumenta timeout do modo passivo para 2min
  },
};

console.log('--- Iniciando Deploy na Hostinger (RevHackers Growth Hub) ---');
console.log(`Host: ${config.host} | User: ${config.user} | Destino: ${config.remoteRoot}`);

ftpDeploy.on('uploading', function(data) {
    if (data.transferredFileCount % 20 === 0) {
        console.log(`Progresso: ${data.transferredFileCount} de ${data.totalFilesCount} arquivos transferidos...`);
    }
});

ftpDeploy.on('uploaded', function(data) {
    // console.log(data); // Exibe info individual, poluente
});

ftpDeploy.on('log', function(data) {
    console.log(`[Log FTP]: ${data}`);
});

ftpDeploy.on('upload-error', function(data) {
    console.log(`[Erro no FTP] Arquivo: ${data.err}`);
});

ftpDeploy.deploy(config)
    .then(res => console.log('\n✅ Deploy Finalizado com Sucesso para a Hostinger! Aplicação Atualizada.'))
    .catch(err => console.log('\n❌ Erro Fatal no Deploy:\n', err));
