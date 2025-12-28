
import { createClient } from '@supabase/supabase-js';
import { blogPosts } from '@/data/blogData';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// Reserve list of unique high-quality images for replacement
const RESERVE_IMAGES = [
    'https://images.unsplash.com/photo-1553877522-43269d4ea984', // Meeting
    'https://images.unsplash.com/photo-1552664730-d307ca884978', // Strategy
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', // Analytics
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c', // Laptop
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf', // Team
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71', // Data
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c', // Discussion
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f', // Chart
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Office
    'https://images.unsplash.com/photo-1551434678-e076c2236033', // Code/Tech
    'https://images.unsplash.com/photo-1526304640152-d46753695313', // Growth
    'https://images.unsplash.com/photo-1599658880436-c61792e70672', // Business
];

const RestoreMaterials = () => {
    const [status, setStatus] = useState('Idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [imageIssues, setImageIssues] = useState<{ title: string, reason: string, slug: string }[]>([]);
    const [postsToMigrate, setPostsToMigrate] = useState(blogPosts);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const analyzeImages = () => {
        const issues: { title: string, reason: string, slug: string }[] = [];
        const seenImages = new Set<string>();

        postsToMigrate.forEach(post => {
            if (!post.image) {
                issues.push({ title: post.title, reason: 'Missing Image', slug: post.slug });
            } else if (seenImages.has(post.image)) {
                issues.push({ title: post.title, reason: 'Duplicate Image', slug: post.slug });
            } else {
                seenImages.add(post.image);
            }
        });

        setImageIssues(issues);
        if (issues.length === 0) {
            addLog('✅ No image issues found!');
        } else {
            addLog(`⚠️ Found ${issues.length} image issues. Check the list below.`);
        }
    };

    const fixImages = () => {
        const seenImages = new Set<string>();
        let reserveIndex = 0;
        let fixedCount = 0;

        const updatedPosts = postsToMigrate.map(post => {
            // Keep first instance, fix duplicates
            if (!post.image || seenImages.has(post.image)) {
                const newImage = RESERVE_IMAGES[reserveIndex % RESERVE_IMAGES.length];
                reserveIndex++;
                fixedCount++;
                return { ...post, image: newImage };
            }
            seenImages.add(post.image);
            return post;
        });

        setPostsToMigrate(updatedPosts);
        setStatus('Images Fixed');
        addLog(`✅ Auto-fixed ${fixedCount} duplicates/issues using reserve library.`);
        setImageIssues([]);
    };

    const runRestore = async () => {
        setStatus('Running...');
        addLog('Starting restoration...');

        let successCount = 0;
        let failCount = 0;

        for (const post of postsToMigrate) {
            // Map Category to Material Type
            let type = 'ebook'; // Default
            const cat = post.category.toLowerCase();

            if (['vendas', 'strategy', 'management'].includes(cat)) type = 'ebook'; // Playbook -> Ebook (Constraint fix)
            if (['revops', 'growth', 'plg', 'cro'].includes(cat)) type = 'framework';
            if (['automação', 'dados', 'cs'].includes(cat)) type = 'ebook'; // Guide -> Ebook

            const payload = {
                material_name: post.title,
                material_type: type,
                description: post.excerpt,
                cover_image: post.image,
                published: true,
                is_active: true,
                material_url: `/blog/${post.slug}`, // Link back to the blog post for now, or use a placeholder
                created_at: new Date(post.date).toISOString()
            };

            // Check if exists (dedupe by name)
            const { data: existing } = await supabase
                .from('materials')
                .select('id')
                .eq('material_name', post.title)
                .single();

            if (existing) {
                addLog(`Skipped (Exists): ${post.title}`);
                continue;
            }

            let error = null;

            // Try Lowercase first
            const { error: err1 } = await supabase.from('materials').insert(payload);
            error = err1;

            // If constraint error, try Capitalized
            if (error && error.message.includes('constraint')) {
                addLog(`Constraint error for ${type}, trying Capitalized...`);
                payload.material_type = type.charAt(0).toUpperCase() + type.slice(1);
                const { error: err2 } = await supabase.from('materials').insert(payload);
                error = err2;
            }

            if (error) {
                addLog(`Error inserting ${post.title}: ${error.message} (Type: ${payload.material_type})`);
                failCount++;
            } else {
                addLog(`Success: ${post.title}`);
                successCount++;
            }
        }

        setStatus('Finished');
        addLog(`Done! Success: ${successCount}, Failed: ${failCount}`);
    };

    const clearMaterials = async () => {
        if (!confirm('Tem certeza? Isso apagará TODOS os materiais do banco.')) return;
        setStatus('Clearing...');
        addLog('Clearing all materials...');

        // Supabase doesn't have TRUNCATE via JS client easily without RLS bypass or function.
        // We will fetch all IDs and delete them.
        const { data: allMaterials } = await supabase.from('materials').select('id');

        if (!allMaterials || allMaterials.length === 0) {
            addLog('No materials to delete.');
            setStatus('Idle');
            return;
        }

        const ids = allMaterials.map(m => m.id);
        const { error } = await supabase.from('materials').delete().in('id', ids);

        if (error) {
            addLog(`Error clearing: ${error.message}`);
        } else {
            addLog(`Deleted ${ids.length} materials.`);
        }
        setStatus('Idle');
    };

    const migrateBlogPosts = async () => {
        setStatus('Migrating Blog...');
        addLog('Starting Blog Migration...');
        let success = 0;
        let fail = 0;

        for (const post of postsToMigrate) {
            // Check existence
            const { data: existing } = await supabase
                .from('blog_posts')
                .select('id')
                .eq('slug', post.slug)
                .single();

            if (existing) {
                addLog(`Skipping (Exists): ${post.title}`);
                continue;
            }

            const payload = {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content || '',
                category: post.category,
                image: post.image,
                author_name: post.author.name,
                author_role: post.author.role,
                author_avatar: post.author.avatar,
                date: post.date,
                read_time: post.readTime,
                featured: post.featured || false,
                created_at: new Date(post.date).toISOString()
            };

            const { error } = await supabase.from('blog_posts').insert(payload);

            if (error) {
                addLog(`Failed Blog Post ${post.title}: ${error.message}`);
                fail++;
            } else {
                addLog(`Imported Blog Post: ${post.title}`);
                success++;
            }
        }
        setStatus('Finished Blog');
        addLog(`Blog Migration Done: ${success} Success, ${fail} Failed.`);
    };

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Central de Migração e Restauração</h1>
            <p className="mb-4 text-gray-600">Importe seus dados antigos para o novo banco de dados Supabase.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border p-6 rounded bg-blue-50">
                    <h2 className="font-bold text-lg mb-2">1. Materiais Ricos</h2>
                    <p className="text-sm mb-4">Playbooks, Ebooks e Ferramentas para download (com formulário).</p>
                    <div className="flex gap-2">
                        <Button onClick={runRestore} disabled={status.startsWith('Running') || status.startsWith('Migrating')}>
                            Restaurar Materiais
                        </Button>
                        <Button variant="destructive" onClick={clearMaterials} disabled={status.startsWith('Running')}>
                            Limpar
                        </Button>
                    </div>
                </div>

                <div className="border p-6 rounded bg-purple-50">
                    <h2 className="font-bold text-lg mb-2">2. Blog Posts</h2>
                    <p className="text-sm mb-4">Artigos, notícias e conteúdo de leitura.</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button onClick={analyzeImages} variant="outline" className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50">
                                🔍 Analisar
                            </Button>
                            {imageIssues.length > 0 && (
                                <Button onClick={fixImages} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white border-none animate-in fade-in">
                                    ✨ Corrigir Auto
                                </Button>
                            )}
                        </div>
                        <Button onClick={migrateBlogPosts} disabled={status.startsWith('Running') || status.startsWith('Migrating')} className="bg-purple-600 hover:bg-purple-700 w-full">
                            Migrar Blog Posts
                        </Button>
                    </div>
                </div>
            </div>

            {imageIssues.length > 0 && (
                <div className="mb-8 border border-yellow-200 bg-yellow-50 p-4 rounded animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ Problemas de Imagem Detectados:</h3>
                    <ul className="list-disc pl-5 text-sm text-yellow-900 max-h-40 overflow-auto">
                        {imageIssues.map((issue, i) => (
                            <li key={i}>
                                <strong>{issue.reason}:</strong> {issue.title}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-yellow-700 mt-2">
                        * Clique em "✨ Corrigir Auto" para substituir duplicatas por imagens do banco de imagens.
                    </p>
                </div>
            )}

            <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded h-96 overflow-auto font-mono text-xs shadow-inner">
                {logs.map((log, i) => <div key={i} className="border-b border-gray-800 py-1">{log}</div>)}
            </div>
        </div>
    );
};

export default RestoreMaterials;
