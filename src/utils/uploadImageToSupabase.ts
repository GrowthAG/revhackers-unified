
import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de uma imagem para o Supabase Storage e retorna a URL pública.
 * @param file O arquivo selecionado pelo usuário.
 * @returns string | null - A URL pública, ou null em caso de erro.
 */
export const uploadImageToSupabase = async (file: File, bucketName = 'blog-covers') => {
  const bucket = bucketName;
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

  // Upload da imagem
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    console.error('Erro no upload para supabase.storage:', error);
    throw new Error('Erro ao enviar imagem para o Supabase Storage');
  }

  // Obter a URL pública da imagem recém-enviada
  const getUrlRes = supabase.storage.from(bucket).getPublicUrl(fileName);
  if (!getUrlRes.data || !getUrlRes.data.publicUrl) {
    console.error('Erro ao obter a URL pública após upload:');
    throw new Error('Não foi possível obter a URL pública da imagem');
  }

  return getUrlRes.data.publicUrl;
};
