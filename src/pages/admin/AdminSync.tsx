import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts } from '@/data/blogData';
import { materialsData } from '@/data/materialsData';
import { casesData } from '@/data/casesData';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSync = () => {
    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, type: '' });
    const [results, setResults] = useState<any>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const syncPosts = async () => {
        setProgress({ current: 0, total: blogPosts.length, type: 'Artigos' });

        let success = 0;
        let errors = 0;

        for (let i = 0; i < blogPosts.length; i++) {
            const post = blogPosts[i];
            setProgress({ current: i + 1, total: blogPosts.length, type: 'Artigos' });

            try {
                const { error } = await supabase.from('blog_posts').upsert({
                    title: post.title.replace(/<span>|<\/span>/g, ''),
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    category: post.category,
                    image: post.image,
                    date: post.date,
                    featured: post.featured || false,
                    read_time: post.readTime,
                    author_name: post.author?.name,
                    author_role: post.author?.role,
                    author_avatar: post.author?.avatar,
                    published: true
                }, { onConflict: 'slug' });

                if (error) {
                    console.error(`Erro ao sincronizar ${post.slug}:`, error);
                    errors++;
                } else {
                    success++;
                }
            } catch (err) {
                console.error(`Erro fatal ao sincronizar ${post.slug}:`, err);
                errors++;
            }
        }

        return { success, errors, total: blogPosts.length };
    };

    const syncMaterials = async () => {
        setProgress({ current: 0, total: materialsData.length, type: 'Materiais' });

        let success = 0;
        let errors = 0;

        for (let i = 0; i < materialsData.length; i++) {
            const material = materialsData[i];
            setProgress({ current: i + 1, total: materialsData.length, type: 'Materiais' });

            try {
                const { error } = await supabase.from('materials').upsert({
                    material_name: material.title,
                    slug: material.slug,
                    material_type: material.material_type || material.type,
                    description: material.description,
                    cover_image: material.cover_image,
                    material_url: material.material_url,
                    published: material.published ?? true,
                    is_active: material.is_active ?? true
                }, { onConflict: 'slug' });

                if (error) {
                    console.error(`Erro ao sincronizar material ${material.slug}:`, error);
                    errors++;
                } else {
                    success++;
                }
            } catch (err) {
                console.error(`Erro fatal ao sincronizar material ${material.slug}:`, err);
                errors++;
            }
        }

        return { success, errors, total: materialsData.length };
    };

    const syncCases = async () => {
        const entries = Object.entries(casesData);
        setProgress({ current: 0, total: entries.length, type: 'Cases' });

        let success = 0;
        let errors = 0;

        for (let i = 0; i < entries.length; i++) {
            const [slug, caseItem] = entries[i];
            setProgress({ current: i + 1, total: entries.length, type: 'Cases' });

            try {
                const { error } = await supabase.from('cases').upsert({
                    title: caseItem.title,
                    client_name: caseItem.title.split(':')[0] || 'Client',
                    slug: slug,
                    case_category: caseItem.category,
                    preview_description: caseItem.preview_description || caseItem.solution?.substring(0, 160),
                    challenge: caseItem.challenge,
                    solution: caseItem.solution,
                    results: Array.isArray(caseItem.results) ? caseItem.results.join('\n') : caseItem.results,
                    testimonial: caseItem.quote,
                    testimonial_author: caseItem.author,
                    testimonial_role: caseItem.role,
                    image_url: caseItem.coverImage,
                    client_logo: caseItem.logo,
                    primary_metric: caseItem.metrics?.[0]?.value || '',
                    published: true,
                    featured: caseItem.featured || false,
                    tech_stack: caseItem.techStack as any
                } as any, { onConflict: 'slug' });

                if (error) {
                    console.error(`Erro ao sincronizar case ${slug}:`, error);
                    errors++;
                } else {
                    success++;
                }
            } catch (err) {
                console.error(`Erro fatal ao sincronizar case ${slug}:`, err);
                errors++;
            }
        }

        return { success, errors, total: entries.length };
    };

    const handleSyncAll = async () => {
        setSyncing(true);
        setResults(null);

        try {
            const postsResult = await syncPosts();
            const materialsResult = await syncMaterials();
            const casesResult = await syncCases();

            setResults({
                posts: postsResult,
                materials: materialsResult,
                cases: casesResult
            });

            const totalSuccess = postsResult.success + materialsResult.success + casesResult.success;
            const totalErrors = postsResult.errors + materialsResult.errors + casesResult.errors;

            if (totalErrors === 0) {
                toast({
                    title: '✅ Sincronização completa!',
                    description: `${totalSuccess} itens sincronizados com sucesso.`,
                });
            } else {
                toast({
                    title: '⚠️ Sincronização concluída com erros',
                    description: `${totalSuccess} sucessos, ${totalErrors} erros.`,
                    variant: 'destructive'
                });
            }
        } catch (err) {
            console.error('Erro na sincronização:', err);
            toast({
                title: 'Erro na sincronização',
                description: 'Verifique o console para mais detalhes.',
                variant: 'destructive'
            });
        } finally {
            setSyncing(false);
            setProgress({ current: 0, total: 0, type: '' });
        }
    };

    return (
        <AdminLayout>
            <AdminPageLayout title="Sincronização de Dados">
                <div className="container-custom py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-4xl font-black uppercase tracking-wider mb-2">Sincronização</h1>
                            <p className="text-zinc-600">Popular dados estáticos no Supabase</p>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="w-5 h-5" />
                                    Sincronizar Dados Estáticos
                                </CardTitle>
                                <CardDescription>
                                    Popula todos os artigos, materiais e cases do código para o Supabase, tornando-os editáveis no admin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-4 border rounded">
                                            <div className="text-2xl font-bold">{blogPosts.length}</div>
                                            <div className="text-sm text-zinc-600">Artigos</div>
                                        </div>
                                        <div className="p-4 border rounded">
                                            <div className="text-2xl font-bold">{materialsData.length}</div>
                                            <div className="text-sm text-zinc-600">Materiais</div>
                                        </div>
                                        <div className="p-4 border rounded">
                                            <div className="text-2xl font-bold">{Object.keys(casesData).length}</div>
                                            <div className="text-sm text-zinc-600">Cases</div>
                                        </div>
                                    </div>

                                    {syncing && (
                                        <div className="p-4 bg-zinc-50 border border-zinc-200 ">
                                            <div className="flex items-center gap-2 mb-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" />
                                                <span className="font-medium text-zinc-900">Sincronizando {progress.type}...</span>
                                            </div>
                                            <div className="text-sm text-zinc-600">
                                                {progress.current} de {progress.total}
                                            </div>
                                            <div className="w-full bg-zinc-200 h-2 mt-2">
                                                <div
                                                    className="bg-zinc-900 h-2 transition-all"
                                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {results && (
                                        <div className="space-y-2">
                                            <div className="p-3 bg-[#00CC6A]/5 border border-[#00CC6A]/20 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#00CC6A]" />
                                                    <span className="font-medium">Artigos</span>
                                                </div>
                                                <span className="text-sm">{results.posts.success}/{results.posts.total}</span>
                                            </div>
                                            <div className="p-3 bg-[#00CC6A]/5 border border-[#00CC6A]/20 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#00CC6A]" />
                                                    <span className="font-medium">Materiais</span>
                                                </div>
                                                <span className="text-sm">{results.materials.success}/{results.materials.total}</span>
                                            </div>
                                            <div className="p-3 bg-[#00CC6A]/5 border border-[#00CC6A]/20 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#00CC6A]" />
                                                    <span className="font-medium">Cases</span>
                                                </div>
                                                <span className="text-sm">{results.cases.success}/{results.cases.total}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleSyncAll}
                                            disabled={syncing}
                                            className="flex-1"
                                        >
                                            {syncing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    Sincronizando...
                                                </>
                                            ) : (
                                                <>
                                                    <Database className="w-4 h-4 mr-2" />
                                                    Sincronizar Tudo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/admin')}
                                        >
                                            Voltar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">⚠️ Importante:</p>
                                    <ul className="list-disc list-inside space-y-1 text-zinc-600">
                                        <li>Esta operação usa UPSERT (insere ou atualiza)</li>
                                        <li>Itens existentes serão atualizados</li>
                                        <li>Certifique-se de ter índices UNIQUE em slug</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default AdminSync;
