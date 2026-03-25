import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de qualquer arquivo para o Supabase Storage e retorna a URL pública.
 * Diferente do uploadImageToSupabase, suporta qualquer tipo de arquivo
 * e organiza por projectId.
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'msi', 'dll', 'so', 'bin', 'com'];

export const uploadFileToSupabase = async (
  file: File,
  projectId: string,
  bucketName = 'rei-materials'
): Promise<string> => {
  // Validacao de tamanho
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 50MB.`);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';

  // Bloqueia extensoes perigosas
  if (BLOCKED_EXTENSIONS.includes(fileExt)) {
    throw new Error(`Tipo de arquivo nao permitido: .${fileExt}`);
  }

  const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Erro no upload para supabase.storage:', error);
    throw new Error(`Erro Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  if (!data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo');
  }

  return data.publicUrl;
};
