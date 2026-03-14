import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de qualquer arquivo para o Supabase Storage e retorna a URL pública.
 * Diferente do uploadImageToSupabase, suporta qualquer tipo de arquivo
 * e organiza por projectId.
 */
export const uploadFileToSupabase = async (
  file: File,
  projectId: string,
  bucketName = 'rei-materials'
): Promise<string> => {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
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
