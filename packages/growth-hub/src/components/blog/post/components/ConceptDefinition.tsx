
interface ConceptDefinitionProps {
    concept: string;
    definition: string;
    amateurView?: string;
    proView?: string;
}

const ConceptDefinition = ({ concept, definition, amateurView, proView }: ConceptDefinitionProps) => {
    return (
        <div className="my-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                {concept}
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed font-medium">
                {definition}
            </p>

            {(amateurView && proView) && (
                <div className="grid md:grid-cols-2 gap-6 not-prose">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Visão Amadora</div>
                        <p className="text-gray-600 italic">"{amateurView}"</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Visão Profissional</div>
                        <p className="text-emerald-900 font-medium">"{proView}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConceptDefinition;
