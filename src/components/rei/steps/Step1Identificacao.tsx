import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface Step1Props {
    form: UseFormReturn<any>;
    onEmailBlur?: (email: string) => void;
}

export default function Step1Identificacao({ form, onEmailBlur }: Step1Props) {
    const email = form.watch('email');

    const handleBlur = () => {
        if (email && onEmailBlur) {
            onEmailBlur(email);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-black mb-3 uppercase tracking-[0.15em]">
                    Identificação
                </h2>
                <p className="text-zinc-500 text-sm">
                    Digite seu email para começarmos o diagnóstico
                </p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Corporativo *
                </label>
                <Input
                    {...form.register('email')}
                    type="email"
                    placeholder="seu@email.com.br"
                    onBlur={handleBlur}
                    className="bg-white border-zinc-200 text-black focus:border-black h-12 text-base"
                />
                {form.formState.errors.email && (
                    <p className="text-red-500 text-xs font-medium">
                        {form.formState.errors.email.message as string}
                    </p>
                )}
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-sm">
                <p className="text-xs text-zinc-600 leading-relaxed">
                    💡 <strong>Dica:</strong> Se você já é nosso cliente, seus dados serão preenchidos automaticamente.
                </p>
            </div>
        </div>
    );
}
