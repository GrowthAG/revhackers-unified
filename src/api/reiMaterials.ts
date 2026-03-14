import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase } from '@/utils/uploadFileToSupabase';

export interface ReiMaterial {
  id: string;
  project_id: string;
  material_type: string;
  source_type: 'upload' | 'link';
  file_url: string | null;
  original_name: string | null;
  description: string | null;
  extracted_text: string | null;
  status: string;
  created_at: string;
}

/**
 * Upload a file as reference material for a REI project
 */
export async function uploadMaterial(
  projectId: string,
  file: File,
  materialType: string,
  description?: string
): Promise<ReiMaterial | null> {
  // 1. Upload file to Storage
  const fileUrl = await uploadFileToSupabase(file, projectId);

  // 2. Create DB record
  const { data, error } = await supabase
    .from('rei_materials')
    .insert({
      project_id: projectId,
      material_type: materialType,
      source_type: 'upload',
      file_url: fileUrl,
      original_name: file.name,
      description: description || null,
      status: 'ready',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar material:', error);
    throw new Error(error.message);
  }

  return data as ReiMaterial;
}

/**
 * Add a link as reference material
 */
export async function addMaterialLink(
  projectId: string,
  url: string,
  materialType: string,
  description?: string
): Promise<ReiMaterial | null> {
  const { data, error } = await supabase
    .from('rei_materials')
    .insert({
      project_id: projectId,
      material_type: materialType,
      source_type: 'link',
      file_url: url,
      original_name: url,
      description: description || null,
      status: 'ready',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar link:', error);
    throw new Error(error.message);
  }

  return data as ReiMaterial;
}

/**
 * Get all materials for a project
 */
export async function getMaterialsByProject(projectId: string): Promise<ReiMaterial[]> {
  const { data, error } = await supabase
    .from('rei_materials')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar materiais:', error);
    return [];
  }

  return (data || []) as ReiMaterial[];
}

/**
 * Delete a material (record + file from storage)
 */
export async function deleteMaterial(material: ReiMaterial): Promise<void> {
  // If it was an upload, remove from storage
  if (material.source_type === 'upload' && material.file_url) {
    try {
      // Extract path from public URL
      const urlParts = material.file_url.split('/rei-materials/');
      if (urlParts[1]) {
        await supabase.storage.from('rei-materials').remove([urlParts[1]]);
      }
    } catch (e) {
      console.warn('Falha ao remover arquivo do storage:', e);
    }
  }

  const { error } = await supabase
    .from('rei_materials')
    .delete()
    .eq('id', material.id);

  if (error) throw new Error(error.message);
}
