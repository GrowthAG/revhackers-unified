import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    breadcrumbs?: { name: string; url: string }[];
    faq?: { question: string; answer: string }[];
    wordCount?: number;
    keywords?: string[];
}

export const SEOProvider = ({ children }: { children: React.ReactNode }) => {
    return <HelmetProvider>{children}</HelmetProvider>;
};

const SEO = ({
    title,
    description,
    canonical,
    image = "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67f7fc91b95d208445a1317a.jpeg",
    type = 'website',
    publishedTime,
    modifiedTime,
    author = "RevHackers",
    breadcrumbs,
    faq,
    wordCount,
    keywords,
}: SEOProps) => {

    const siteTitle = "RevHackers | Revenue Operations & Growth B2B";
    const fullTitle = title === "Home" ? siteTitle : `${title} | RevHackers`;
    const currentUrl = canonical || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');

    // Schema.org: ProfessionalService (main entity - GEO essential)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": "https://revhackers.com.br/#organization",
        "name": "RevHackers",
        "alternateName": ["RevHackers Growth Hub", "RevHackers Consultoria", "RevHackers RevOps"],
        "url": "https://revhackers.com.br",
        "logo": {
            "@type": "ImageObject",
            "url": "https://revhackers.com.br/brand/revhackers-mark.png",
            "width": 256,
            "height": 256
        },
        "image": "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67f7fc91b95d208445a1317a.jpeg",
        "description": "A primeira consultoria de Revenue Operations do Brasil. Integramos IA, CRM e automações para escalar operações B2B em São Paulo e todo o país.",
        "slogan": "Revenue Architecture for B2B Growth",
        "foundingDate": "2023",
        "founders": [
            {
                "@type": "Person",
                "name": "Giulliano Alves",
                "jobTitle": "Co-Founder & Growth Engineer",
                "url": "https://www.linkedin.com/in/giullianoalves/"
            },
            {
                "@type": "Person",
                "name": "Luna M.",
                "jobTitle": "Co-Founder & Revenue Architect"
            }
        ],
        "sameAs": [
            "https://www.linkedin.com/company/revhackers",
            "https://www.instagram.com/revhackers",
            "https://academy.revhackers.com.br"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "addressCountry": "BR",
            "postalCode": "01000-000"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -23.5505,
            "longitude": -46.6333
        },
        "areaServed": [
            { "@type": "Country", "name": "Brasil" },
            { "@type": "City", "name": "São Paulo" },
            { "@type": "City", "name": "Curitiba" },
            { "@type": "City", "name": "Rio de Janeiro" },
            { "@type": "City", "name": "Belo Horizonte" },
            { "@type": "City", "name": "Florianópolis" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços de Revenue Operations",
            "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Implementação de CRM (HubSpot, Salesforce, Pipedrive)", "url": "https://revhackers.com.br/servicos/ecossistema-crm" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Automação de Vendas com IA (SDR Digital)", "url": "https://revhackers.com.br/servicos/automacao-inteligente" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tração & Mídia Paga B2B", "url": "https://revhackers.com.br/servicos/tracao-midia-paga" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Founder-Led Growth & Social Selling", "url": "https://revhackers.com.br/servicos/founder-led-growth" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sites de Alta Conversão B2B", "url": "https://revhackers.com.br/servicos/web-conversion" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Operations (Agentes de IA)", "url": "https://revhackers.com.br/servicos/ai-operations" } }
            ]
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "sales",
            "url": "https://revhackers.com.br/booking",
            "availableLanguage": ["Portuguese", "English"]
        },
        "priceRange": "$$$",
        "knowsLanguage": ["pt-BR", "en"],
        "knowsAbout": [
            "Revenue Operations", "RevOps", "Growth B2B", "CRM Implementation",
            "Sales Automation", "Account Based Marketing", "ABM", "HubSpot",
            "Salesforce", "Pipeline Management", "Lead Qualification AI",
            "Founder-Led Growth", "B2B SaaS Growth", "Revenue Architecture"
        ]
    };

    // Schema.org: WebSite with SearchAction (sitelinks searchbox for Google)
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://revhackers.com.br/#website",
        "url": "https://revhackers.com.br",
        "name": "RevHackers",
        "description": "A primeira consultoria de Revenue Operations do Brasil.",
        "publisher": { "@id": "https://revhackers.com.br/#organization" },
        "inLanguage": "pt-BR",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://revhackers.com.br/blog?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    // Schema.org: BlogPosting (for blog posts - more specific type, better SEO indexing)
    const articleSchema = type === 'article' ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title.substring(0, 110), // Google limits headline to 110 chars
        "image": image ? [image] : [],
        "datePublished": publishedTime || new Date().toISOString(),
        "dateModified": modifiedTime || publishedTime || new Date().toISOString(),
        "author": [{
            "@type": "Person",
            "name": author,
            "url": "https://revhackers.com.br/quem-somos"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "RevHackers",
            "logo": {
                "@type": "ImageObject",
                "url": "https://revhackers.com.br/brand/revhackers-mark.png",
                "width": 256,
                "height": 256
            }
        },
        "description": description,
        ...(wordCount ? { "wordCount": wordCount } : {}),
        ...(keywords && keywords.length > 0 ? { "keywords": keywords.join(', ') } : {}),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
        },
        "url": currentUrl,
        "inLanguage": "pt-BR",
        "isPartOf": {
            "@type": "Blog",
            "@id": "https://revhackers.com.br/blog",
            "name": "Blog RevHackers",
            "publisher": { "@id": "https://revhackers.com.br/#organization" }
        },
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".article-content p:first-of-type"]
        }
    } : null;

    // BreadcrumbList Schema (enables rich snippets in SERPs)
    const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    } : null;

    // FAQPage Schema (enables FAQ rich snippets)
    const faqSchema = faq && faq.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // Combine all schemas
    const schemas: any[] = [organizationSchema, websiteSchema];
    if (articleSchema) schemas.push(articleSchema);
    if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    if (faqSchema) schemas.push(faqSchema);

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Language / GEO / International */}
            <html lang="pt-BR" />
            <meta property="og:locale" content="pt_BR" />
            <link rel="alternate" hrefLang="pt-BR" href={currentUrl} />
            <link rel="alternate" hrefLang="x-default" href={currentUrl} />

            {/* Open Graph / Facebook / LinkedIn */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="RevHackers Growth Hub" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* GEO / Local SEO Signals (Critical for GEO ranking) */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="geo.region" content="BR-SP" />
            <meta name="geo.placename" content="São Paulo" />
            <meta name="geo.position" content="-23.5505;-46.6333" />
            <meta name="ICBM" content="-23.5505, -46.6333" />

            {/* AI / GEO Optimization (Helps AI engines extract and cite content) */}
            <meta name="format-detection" content="telephone=no" />

            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {author && <meta name="author" content={author} />}

            {/* Knowledge Graph + Structured Data Injection */}
            <script type="application/ld+json">
                {JSON.stringify(schemas)}
            </script>
        </Helmet>
    );
};

export default SEO;
