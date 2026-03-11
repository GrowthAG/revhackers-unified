import FtpDeploy from 'ftp-deploy';

const ftp = new FtpDeploy();

// Configurações do FTP usando variáveis de ambiente
const config = {
  localRoot: './dist',
  include: ['*', '**/*', '**/.*', '.**'],
};

ftp.checkIncludes(config)
  .then((res) => console.log('Found:', res.filter(f => f.includes('.ht'))))
  .catch((err) => console.error(err));
