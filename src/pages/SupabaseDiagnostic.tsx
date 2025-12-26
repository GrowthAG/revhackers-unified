import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RefreshCw, Database, FileText, Briefcase, Download } from 'lucide-react';

const SupabaseDiagnostic = () => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<any>(null);

    const testConnection = async () => {
        setTesting(true);
        const testResults: any = {
            connection: false,
            posts: { count: 0, data: [], error: null },
            cases: { count: 0, data: [], error: null },
            materials: { count: 0, data: [], error: null },
        };

        try {
            // Test connection
            const { data: { session } } = await supabase.auth.getSession();
            testResults.connection = true;

            // Test blog_posts
            const { data: posts, error: postsError } = await supabase
                .from('blog_posts')
                .select('*')
                .limit(5);

            testResults.posts = {
                count: posts?.length || 0,
                data: posts || [],
                error: postsError?.message || null
            };

            // Test cases
            const { data: cases, error: casesError } = await supabase
                .from('cases')
                .select('*')
                .limit(5);

            testResults.cases = {
                count: cases?.length || 0,
                data: cases || [],
                error: casesError?.message || null
            };

            // Test materials
            const { data: materials, error: materialsError } = await supabase
                .from('materials')
                .select('*')
                .limit(5);

            testResults.materials = {
                count: materials?.length || 0,
                data: materials || [],
                error: materialsError?.message || null
            };

        } catch (err: any) {
            testResults.connection = false;
            testResults.error = err.message;
        }

        setResults(testResults);
        setTesting(false);
    };

    return (
        <PageLayout>
            <div className="min-h-screen bg-black text-white py-20">
                <div className="container-custom max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black mb-4">
                            🔍 DIAGNÓSTICO SUPABASE
                        </h1>
                        <p className="text-gray-400">
                            Teste a conexão e veja os dados disponíveis
                        </p>
                    </div>

                    <div className="mb-8 text-center">
                        <Button
                            onClick={testConnection}
                            disabled={testing}
                            className="bg-revgreen text-black hover:bg-revgreen/90 font-bold px-8 py-6 text-lg"
                        >
                            {testing ? (
                                <>
                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                    Testando...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-5 w-5" />
                                    Testar Conexão
                                </>
                            )}
                        </Button>
                    </div>

                    {results && (
                        <div className="space-y-6">
                            {/* Connection Status */}
                            <Card className="bg-zinc-900 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {results.connection ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-500" />
                                        )}
                                        Status da Conexão
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={results.connection ? 'text-green-500' : 'text-red-500'}>
                                        {results.connection ? '✅ Conectado ao Supabase' : '❌ Erro de conexão'}
                                    </p>
                                    {results.error && (
                                        <p className="text-red-400 mt-2 text-sm">{results.error}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Blog Posts */}
                            <Card className="bg-zinc-900 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-6 w-6" />
                                        Blog Posts
                                    </CardTitle>
                                    <CardDescription>
                                        {results.posts.error ? (
                                            <span className="text-red-400">❌ {results.posts.error}</span>
                                        ) : (
                                            <span className="text-green-400">✅ {results.posts.count} posts encontrados</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {results.posts.data.length > 0 && (
                                        <div className="space-y-2">
                                            {results.posts.data.map((post: any) => (
                                                <div key={post.id} className="p-3 bg-black/50 rounded border border-white/5">
                                                    <p className="font-bold">{post.title}</p>
                                                    <p className="text-sm text-gray-400">{post.slug}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cases */}
                            <Card className="bg-zinc-900 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-6 w-6" />
                                        Cases
                                    </CardTitle>
                                    <CardDescription>
                                        {results.cases.error ? (
                                            <span className="text-red-400">❌ {results.cases.error}</span>
                                        ) : (
                                            <span className="text-green-400">✅ {results.cases.count} cases encontrados</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {results.cases.data.length > 0 && (
                                        <div className="space-y-2">
                                            {results.cases.data.map((caseItem: any) => (
                                                <div key={caseItem.id} className="p-3 bg-black/50 rounded border border-white/5">
                                                    <p className="font-bold">{caseItem.title}</p>
                                                    <p className="text-sm text-gray-400">{caseItem.slug}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Materials */}
                            <Card className="bg-zinc-900 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="h-6 w-6" />
                                        Materiais
                                    </CardTitle>
                                    <CardDescription>
                                        {results.materials.error ? (
                                            <span className="text-red-400">❌ {results.materials.error}</span>
                                        ) : (
                                            <span className="text-green-400">✅ {results.materials.count} materiais encontrados</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {results.materials.data.length > 0 && (
                                        <div className="space-y-2">
                                            {results.materials.data.map((material: any) => (
                                                <div key={material.id} className="p-3 bg-black/50 rounded border border-white/5">
                                                    <p className="font-bold">{material.title}</p>
                                                    <p className="text-sm text-gray-400">{material.slug}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            <Card className="bg-zinc-900 border-white/10">
                                <CardHeader>
                                    <CardTitle>📊 Resumo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p>✅ Conexão: {results.connection ? 'OK' : 'FALHOU'}</p>
                                        <p>📝 Posts: {results.posts.count} {results.posts.error ? '(com erro)' : ''}</p>
                                        <p>🏆 Cases: {results.cases.count} {results.cases.error ? '(com erro)' : ''}</p>
                                        <p>📥 Materiais: {results.materials.count} {results.materials.error ? '(com erro)' : ''}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default SupabaseDiagnostic;
