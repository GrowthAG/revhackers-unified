import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createReiProject, updateReiProject, getReiProjectById, calculateNextQuarter } from '@/api/reiProjects';
import type { ReiProjectInsert } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

type FormData = {
    client_name: string;
    client_email: string;
    client_company?: string;
    analyst_email: string;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
    next_rei_date: string;
};

const REIProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(!!id);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            year: new Date().getFullYear(),
            quarter: 'Q1'
        }
    });

    const isEditing = !!id;

    // Carregar projeto se estiver editando
    useEffect(() => {
        if (id) {
            loadProject();
        }
    }, [id]);

    const loadProject = async () => {
        if (!id) return;

        try {
            setLoadingProject(true);
            const project = await getReiProjectById(id);

            if (project) {
                setValue('client_name', project.client_name);
                setValue('client_email', project.client_email);
                setValue('client_company', project.client_company || '');
                setValue('analyst_email', project.analyst_email);
                setValue('quarter', project.quarter);
                setValue('year', project.year);
                setValue('next_rei_date', project.next_rei_date.split('T')[0]); // Format para input date
            } else {
                toast({
                    title: 'Projeto não encontrado',
                    variant: 'destructive'
                });
                navigate('/admin/rei');
            }
        } catch (error) {
            toast({
                title: 'Erro ao carregar projeto',
                variant: 'destructive'
            });
            navigate('/admin/rei');
        } finally {
            setLoadingProject(false);
        }
    };

    // Auto-calcular próximo quarter quando mudar o quarter ou ano
    const quarter = watch('quarter');
    const year = watch('year');

    useEffect(() => {
        if (!isEditing && quarter && year) {
            // Calcular data baseada no quarter selecionado
            const monthMap = {
                'Q1': 0,  // Janeiro
                'Q2': 3,  // Abril
                'Q3': 6,  // Julho
                'Q4': 9   // Outubro
            };

            const date = new Date(year, monthMap[quarter], 1);
            setValue('next_rei_date', date.toISOString().split('T')[0]);
        }
    }, [quarter, year, isEditing]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);

        try {
            const projectData: ReiProjectInsert = {
                client_name: data.client_name,
                client_email: data.client_email,
                client_company: data.client_company || null,
                analyst_email: data.analyst_email,
                quarter: data.quarter,
                year: data.year,
                next_rei_date: new Date(data.next_rei_date).toISOString(),
                last_rei_date: new Date().toISOString() // Data atual como último REI
            };

            if (isEditing && id) {
                await updateReiProject(id, projectData);
                toast({
                    title: 'Projeto atualizado!',
                    description: `Projeto de ${data.client_name} foi atualizado com sucesso.`
                });
            } else {
                await createReiProject(projectData);
                toast({
                    title: 'Projeto criado!',
                    description: `Projeto de ${data.client_name} foi criado com sucesso.`
                });
            }

            navigate('/admin/rei');
        } catch (error) {
            toast({
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar o projeto. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingProject) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-revgreen" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/rei')}
                        className="text-zinc-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-black uppercase tracking-wider">
                        {isEditing ? 'Editar Projeto REI' : 'Novo Projeto REI'}
                    </h1>
                    <p className="text-zinc-500 text-sm uppercase tracking-wider mt-2">
                        {isEditing ? 'Atualizar informações do projeto' : 'Criar novo projeto de diagnóstico trimestral'}
                    </p>
                </div>

                {/* Formulário */}
                <Card className="bg-zinc-900 border-zinc-800 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Informações do Cliente */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                                Informações do Cliente
                            </h3>

                            <div>
                                <Label htmlFor="client_name" className="text-xs uppercase tracking-wider text-zinc-400">
                                    Nome do Cliente *
                                </Label>
                                <Input
                                    id="client_name"
                                    {...register('client_name', { required: 'Nome é obrigatório' })}
                                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                    placeholder="Ex: João Silva"
                                />
                                {errors.client_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.client_name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="client_email" className="text-xs uppercase tracking-wider text-zinc-400">
                                    Email do Cliente *
                                </Label>
                                <Input
                                    id="client_email"
                                    type="email"
                                    {...register('client_email', {
                                        required: 'Email é obrigatório',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido'
                                        }
                                    })}
                                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                    placeholder="cliente@empresa.com"
                                />
                                {errors.client_email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.client_email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="client_company" className="text-xs uppercase tracking-wider text-zinc-400">
                                    Empresa (Opcional)
                                </Label>
                                <Input
                                    id="client_company"
                                    {...register('client_company')}
                                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                    placeholder="Ex: Startup XYZ Ltda"
                                />
                            </div>
                        </div>

                        {/* Informações do Projeto */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                                Informações do Projeto
                            </h3>

                            <div>
                                <Label htmlFor="analyst_email" className="text-xs uppercase tracking-wider text-zinc-400">
                                    Email do Analista *
                                </Label>
                                <Input
                                    id="analyst_email"
                                    type="email"
                                    {...register('analyst_email', {
                                        required: 'Email do analista é obrigatório',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido'
                                        }
                                    })}
                                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                    placeholder="analista@revhackers.com"
                                />
                                {errors.analyst_email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.analyst_email.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="quarter" className="text-xs uppercase tracking-wider text-zinc-400">
                                        Quarter *
                                    </Label>
                                    <Select
                                        value={watch('quarter')}
                                        onValueChange={(value) => setValue('quarter', value as any)}
                                    >
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                            <SelectItem value="Q1">Q1 (Janeiro)</SelectItem>
                                            <SelectItem value="Q2">Q2 (Abril)</SelectItem>
                                            <SelectItem value="Q3">Q3 (Julho)</SelectItem>
                                            <SelectItem value="Q4">Q4 (Outubro)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="year" className="text-xs uppercase tracking-wider text-zinc-400">
                                        Ano *
                                    </Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        {...register('year', {
                                            required: 'Ano é obrigatório',
                                            min: { value: 2024, message: 'Ano inválido' }
                                        })}
                                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                    />
                                    {errors.year && (
                                        <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="next_rei_date" className="text-xs uppercase tracking-wider text-zinc-400">
                                    Data do Próximo REI *
                                </Label>
                                <Input
                                    id="next_rei_date"
                                    type="date"
                                    {...register('next_rei_date', { required: 'Data é obrigatória' })}
                                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                                />
                                {errors.next_rei_date && (
                                    <p className="text-red-500 text-xs mt-1">{errors.next_rei_date.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/rei')}
                                className="flex-1 btn-outline-flat"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 btn-green-flat"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {isEditing ? 'Atualizar Projeto' : 'Criar Projeto'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default REIProjectForm;
