import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('🔍 Listando arquivos no bucket antigo (lovable-uploads)...');
  
  const { data: files, error: listError } = await supabase
    .storage
    .from('lovable-uploads')
    .list();

  let filesToMigrate = [];
  if (listError || !files || files.length === 0) {
    console.log('⚠️ Nenhum arquivo encontrado no bucket antigo via list API (pode ser RLS). Usando Fallback manual...');
  } else {
    filesToMigrate = files.filter(f => f.name !== '.emptyFolderPlaceholder');
    console.log("📦 Encontrados " + filesToMigrate.length + " arquivos reais.");
  }

  for (const file of filesToMigrate) {
    console.log("⏳ Baixando " + file.name + "...");
    const { data: blob, error: dlError } = await supabase
      .storage
      .from('lovable-uploads')
      .download(file.name);

    if (dlError) {
      console.error("❌ Erro ao baixar " + file.name + ":", dlError.message);
      continue;
    }

    console.log("🚀 Subindo " + file.name + " para revhackers-uploads...");
    const { error: ulError } = await supabase
      .storage
      .from('revhackers-uploads')
      .upload(file.name, blob, { upsert: true });

    if (ulError) {
      console.error("❌ Erro ao subir " + file.name + ":", ulError.message);
    } else {
      console.log("✅ " + file.name + " migrado com sucesso!");
    }
  }

  const knownFiles = [
    'tikpag-logo-final.png',
    'aada4820-3f12-4185-9af6-811f30795a93.png',
    'a05718ad-1822-4102-909a-7e86af151e98.png',
    'c949a25f-b0ab-4e66-981e-a3db0d728850.png',
    'bolt-logo-new.png',
    'e468ed87-3eee-496b-bb1a-3525f02f8429.png',
    '46993eff-c4c5-41af-b7ee-c93ef0366f59.png',
    'tikpag-logo-new.png',
    'tegra-logo-new.png',
    'cruzeiro-sul-logo-v3.png',
    'bt-logo-new.png',
    'e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png',
    'emagrecentro-logo-new.png',
    '6c09375e-5298-4672-9226-27eb60a6b038.png'
  ];

  if (filesToMigrate.length === 0) {
    console.log('🔄 Executando fallback da lista manual de logos...');
    for (const filename of knownFiles) {
      console.log("⏳ Baixando " + filename + " via Public URL...");
      const publicUrlInfo = supabase.storage.from('lovable-uploads').getPublicUrl(filename);
      
      try {
        const response = await fetch(publicUrlInfo.data.publicUrl);
        if (!response.ok) {
           console.log("⚠️ O arquivo " + filename + " não existe ou falhou (" + response.status + ")");
           continue;
        }
        const blob = await response.blob();
        
        console.log("🚀 Subindo " + filename + "...");
        const { error: ulError } = await supabase
          .storage
          .from('revhackers-uploads')
          .upload(filename, blob, { upsert: true });

        if (ulError) {
          console.error("❌ Erro ao subir " + filename + ":", ulError.message);
        } else {
          console.log("✅ " + filename + " migrado com sucesso!");
        }
      } catch (err) {
        console.error('Erro fetch:', err.message);
      }
    }
  }

  console.log('🎉 Migração física concluída!');
}

migrate();
