import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Terminal, Check, X, ShieldCheck } from 'lucide-react';

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

    const StatusRow = ({ label, status, count, error }: any) => (
        <div className="flex items-center justify-between py-4 border-b border-white/10 font-mono text-sm hover:bg-white/5 transition-colors px-4">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-2 ${status ? 'bg-revgreen' : 'bg-red-500'}`}></div>
                <span className="uppercase tracking-widest text-zinc-400">{label}</span>
            </div>
            <div className="text-right">
                {error ? (
                    <span className="text-red-500 font-bold">ERROR: {error}</span>
                ) : (
                    <span className="text-white">
                        <span className="text-zinc-500 mr-2">ENTRIES:</span>
                        {count !== undefined ? count.toString().padStart(2, '0') : '-'}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <PageLayout>
            <div className="min-h-screen bg-black text-white py-24">
                <div className="container-custom max-w-4xl mx-auto border-l border-white/10 pl-8 ml-8">
                    <div className="flex items-start justify-between mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal className="w-5 h-5 text-revgreen" />
                                <span className="font-mono text-xs text-revgreen uppercase tracking-[0.3em]">System Diagnostics</span>
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tight leading-[0.9]">
                                Integrity<br />
                                <span className="text-zinc-600">Check</span>
                            </h1>
                        </div>
                        <Button
                            onClick={testConnection}
                            disabled={testing}
                            variant="outline"
                            className="bg-transparent border border-zinc-800 text-white hover:bg-white hover:text-black hover:border-white rounded-none h-12 px-8 font-mono text-xs uppercase tracking-widest transition-all"
                        >
                            {testing ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="mr-2 h-4 w-4" />
                            )}
                            {testing ? 'Scanning...' : 'Run Diagnostics'}
                        </Button>
                    </div>

                    {!results && !testing && (
                        <div className="border border-dashed border-zinc-800 p-12 text-center">
                            <p className="font-mono text-zinc-500 text-sm uppercase tracking-widest">
                                System Standby. initialize scan to verify integrity.
                            </p>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Status Grid */}
                            <div className="border-t border-white/10">
                                <div className="flex items-center justify-between py-4 border-b border-white/10 font-mono text-sm px-4 bg-white/5">
                                    <span className="uppercase tracking-widest text-zinc-400">Database Connection</span>
                                    <span className={results.connection ? 'text-revgreen font-bold' : 'text-red-500 font-bold'}>
                                        {results.connection ? '[ ESTABLISHED ]' : '[ FAILED ]'}
                                    </span>
                                </div>

                                <StatusRow
                                    label="Blog Posts Table"
                                    status={!results.posts.error}
                                    count={results.posts.count}
                                    error={results.posts.error}
                                />
                                <StatusRow
                                    label="Case Studies Table"
                                    status={!results.cases.error}
                                    count={results.cases.count}
                                    error={results.cases.error}
                                />
                                <StatusRow
                                    label="Materials Table"
                                    status={!results.materials.error}
                                    count={results.materials.count}
                                    error={results.materials.error}
                                />
                            </div>

                            {/* Raw Data Log */}
                            <div className="space-y-4">
                                <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                                    Live Data Stream (Latest 3)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['posts', 'cases', 'materials'].map((key) => (
                                        <div key={key} className="border border-zinc-900 bg-zinc-950/50 p-4">
                                            <h4 className="font-mono text-xxs text-revgreen uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">
                                                {key}
                                            </h4>
                                            <div className="space-y-2">
                                                {results[key].data.slice(0, 3).map((item: any) => (
                                                    <div key={item.id} className="font-mono text-xxs text-zinc-400 truncate hover:text-white transition-colors cursor-default">
                                                        {'>'} {item.title || item.client_name}
                                                    </div>
                                                ))}
                                                {results[key].data.length === 0 && (
                                                    <div className="font-mono text-xxs text-zinc-700 italic">
                                                        No data found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default SupabaseDiagnostic;
