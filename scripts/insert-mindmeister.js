import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('rei_materials')
        .insert({
            project_id: 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02',
            material_type: 'fluxograma',
            source_type: 'link',
            file_url: 'https://www.mindmeister.com/mm/signup/invitation/9138002?f=email_share_map_invitation&token=pNG4lDrXLp&utm_medium=email&utm_source=share_map_invitation',
            original_name: 'MindMeister Tunad - Arquitetura de Growth',
            description: 'Link direto para o mapa mental e fluxogramas oficiais de Go To Market e Revenue Operations da Tunad.',
            status: 'ready'
        });

    if (error) {
        console.error(error);
        process.exit(1);
    }
    console.log("Success!");
}

run();
