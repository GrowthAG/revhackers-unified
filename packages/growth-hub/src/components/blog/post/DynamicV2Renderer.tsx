import React from 'react';
import KeyTakeaways from './components/KeyTakeaways';
import StrategicContext from './components/StrategicContext';
import RedFlags from './components/RedFlags';
import StrategicConclusion from './components/StrategicConclusion';
import ConceptDefinition from './components/ConceptDefinition';
import ConversionCards from './components/ConversionCards';
import EmailTemplates from './components/EmailTemplates';
import ArticleBlueprint from './components/ArticleBlueprint';
import ArticleTechStack from './components/ArticleTechStack';
import ArticleStepsGrid from './components/ArticleStepsGrid';
import ArticleCTA from './components/ArticleCTA';

interface V2Section {
    type: 'text' | 'key_takeaways' | 'strategic_context' | 'red_flags' | 'conclusion' | 'concept' | 'html' | 'cards_grid' | 'email_templates' | 'blueprint' | 'tech_stack' | 'steps_grid' | 'cta_box';
    title?: string;
    label?: string;
    content?: string;
    items?: any[];
    flags?: string[];
    points?: string[];
    authorName?: string;
    concept?: string;
    definition?: string;
    amateurView?: string;
    proView?: string;
    ctaText?: string;
    ctaLink?: string;
    description?: string;
    templates?: any[];
    // For Blueprint
    number?: string;
    result?: string;
    // For Tech Stack & Steps
    steps?: any[];
    // For CTA Box
    primaryBtnText?: string;
    secondaryBtnText?: string;
}

interface DynamicV2RendererProps {
    config: {
        sections: V2Section[];
    };
    onCTAClick?: () => void;
}

const DynamicV2Renderer = ({ config, onCTAClick }: DynamicV2RendererProps) => {
    if (!config || !config.sections) return null;

    return (
        <div className="v2-dynamic-article">
            {config.sections.map((section, index) => {
                switch (section.type) {
                    case 'text':
                        return (
                            <div key={index} className="prose prose-lg max-w-none text-gray-900 mb-8">
                                <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                            </div>
                        );

                    case 'key_takeaways':
                        return <KeyTakeaways key={index} items={section.items || []} title={section.title} />;

                    case 'strategic_context':
                        return (
                            <StrategicContext key={index} label={section.label}>
                                <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                            </StrategicContext>
                        );

                    case 'red_flags':
                        return (
                            <RedFlags
                                key={index}
                                title={section.title}
                                flags={section.flags || []}
                            />
                        );

                    case 'conclusion':
                        return (
                            <StrategicConclusion
                                key={index}
                                title={section.title}
                                description={section.description}
                                ctaText={section.ctaText}
                                ctaLink={section.ctaLink}
                                onCTAClick={onCTAClick}
                            />
                        );

                    case 'concept':
                        return (
                            <ConceptDefinition
                                key={index}
                                concept={section.concept || ''}
                                definition={section.definition || ''}
                                amateurView={section.amateurView}
                                proView={section.proView}
                            />
                        );

                    case 'cards_grid':
                        return (
                            <ConversionCards
                                key={index}
                                title={section.title}
                                items={section.items || []}
                                onCTAClick={onCTAClick}
                            />
                        );

                    case 'email_templates':
                        return (
                            <EmailTemplates
                                key={index}
                                title={section.title}
                                templates={section.templates || []}
                            />
                        );

                    case 'blueprint':
                        return (
                            <ArticleBlueprint
                                key={index}
                                title={section.title || "Blueprint"}
                                description={section.description}
                                number={section.number}
                                items={section.items || []}
                                result={section.result}
                            />
                        );

                    case 'tech_stack':
                        return (
                            <ArticleTechStack
                                key={index}
                                title={section.title}
                                items={section.items || []}
                            />
                        );

                    case 'steps_grid':
                        return (
                            <ArticleStepsGrid
                                key={index}
                                title={section.title || "Passo a Passo"}
                                steps={section.steps || []}
                            />
                        );

                    case 'cta_box':
                        return (
                            <ArticleCTA
                                key={index}
                                title={section.title}
                                description={section.description}
                                primaryBtnText={section.primaryBtnText}
                                secondaryBtnText={section.secondaryBtnText}
                                onPrimaryClick={onCTAClick}
                                onSecondaryClick={onCTAClick} // Can be customized if needed
                            />
                        );

                    case 'html':
                        return <div key={index} dangerouslySetInnerHTML={{ __html: section.content || '' }} />;

                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default DynamicV2Renderer;
