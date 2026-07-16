
import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de uma imagem para o Supabase Storage e retorna a URL pública.
 * @param file O arquivo selecionado pelo usuário.
 * @returns string | null - A URL pública, ou null em caso de erro.
 */
export const uploadImageToSupabase = async (file: File, bucketName = 'blog-covers', userId?: string) => {
  const bucket = bucketName;
  // Se userId for fornecido, cria estrutura de pasta: userId/timestamp_filename
  // Se não, usa apenas timestamp_filename (comportamento antigo)
  // Gera um nome único usando UUID para evitar conflitos e caracteres especiais
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  // Upload da imagem
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    console.error('Erro no upload para supabase.storage:', error);
    throw new Error(`Erro Supabase: ${error.message}`);
  }

  // Obter a URL pública da imagem recém-enviada
  const getUrlRes = supabase.storage.from(bucket).getPublicUrl(fileName);
  if (!getUrlRes.data || !getUrlRes.data.publicUrl) {
    console.error('Erro ao obter a URL pública após upload:');
    throw new Error('Não foi possível obter a URL pública da imagem');
  }

  return getUrlRes.data.publicUrl;
};
