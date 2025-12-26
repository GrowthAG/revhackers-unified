import { REIQuestion } from '@/types/rei';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface REIQuestionStepProps {
    questions: REIQuestion[];
    form: UseFormReturn<any>;
}

export default function REIQuestionStep({ questions, form }: REIQuestionStepProps) {
    return (
        <div className="space-y-6">
            {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">
                        {question.label} {!question.optional && '*'}
                    </label>

                    {question.type === 'input' && (
                        <Input
                            {...form.register(question.id)}
                            className="w-full bg-white border-zinc-200 text-black focus:border-black h-11"
                            placeholder={question.placeholder}
                        />
                    )}

                    {question.type === 'textarea' && (
                        <textarea
                            {...form.register(question.id)}
                            className="w-full bg-white border border-zinc-200 rounded-sm px-4 py-3 text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-zinc-400 h-24"
                            placeholder={question.placeholder}
                        />
                    )}

                    {question.type === 'select' && (
                        <select
                            {...form.register(question.id)}
                            className="w-full bg-white border border-zinc-200 rounded-sm px-4 py-3 text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        >
                            <option value="">Selecione...</option>
                            {question.options?.map((opt) => (
                                <option
                                    key={typeof opt === 'string' ? opt : opt.value}
                                    value={typeof opt === 'string' ? opt : opt.value}
                                >
                                    {typeof opt === 'string' ? opt : opt.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {question.type === 'radio' && question.options && (
                        <div className="space-y-2">
                            {question.options.map((opt) => {
                                const value = typeof opt === 'string' ? opt : opt.value;
                                const label = typeof opt === 'string' ? opt : opt.label;
                                return (
                                    <label key={value} className="flex items-center space-x-3 p-2 rounded hover:bg-zinc-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            value={value}
                                            {...form.register(question.id)}
                                            className="accent-black"
                                        />
                                        <span className="text-zinc-600 text-sm">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {form.formState.errors[question.id] && (
                        <p className="text-red-500 text-xs">
                            {form.formState.errors[question.id]?.message as string}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
