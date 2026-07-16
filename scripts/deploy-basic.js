import * as ftp from 'basic-ftp';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deploy() {
    const client = new ftp.Client();
    // client.ftp.verbose = true; // Descomente se precisar debugar comandos puros
    try {
        console.log("Conectando ao FTP (Basic-FTP Sequencial Limitado)...")
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        client.trackProgress(info => {
            console.log(`Subindo: ${info.name} (${info.bytesOverall} bytes enviados)`);
        })
        console.log("Conexão estável! Iniciando upload progressivo...");
        
        // This is safe, sequential, and doesn't trigger max connections limit
        const localDir = join(__dirname, '../dist');
        await client.ensureDir("/public_html");
        await client.uploadFromDir(localDir, "/public_html");
        
        console.log("🚀 DEPLOY FINALIZADO COM SUCESSO (SEM TIMEOUTS)!");
    }
    catch(err) {
        console.error("❌ Erro catastrófico de conexão:", err)
        process.exit(1);
    }
    finally {
        client.close()
    }
}
deploy()
