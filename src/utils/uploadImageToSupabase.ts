
import { supabase } from '@/integrations/supabase/client';

/**
 * Faz upload de uma imagem para o Supabase Storage e retorna a URL pública.
 * @param file O arquivo selecionado pelo usuário.
 * @returns string | null - A URL pública, ou null em caso de erro.
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

export const uploadImageToSupabase = async (file: File, bucketName = 'blog-covers', userId?: string) => {
  // Validacao de tamanho
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 10MB.`);
  }

  // Validacao de tipo MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo nao permitido: ${file.type}. Use JPG, PNG, WebP, SVG ou GIF.`);
  }

  const bucket = bucketName;
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
