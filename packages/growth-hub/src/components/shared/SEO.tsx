import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
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
    author = "RevHackers"
}: SEOProps) => {

    const siteTitle = "RevHackers | Revenue Operations & Growth B2B";
    const fullTitle = title === "Home" ? siteTitle : `${title} | RevHackers`;
    const currentUrl = canonical || window.location.href;

    // Schema.org Structured Data for "Organization" (GEO Essential)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Consulting",
        "name": "RevHackers",
        "alternateName": "RevHackers Growth Hub",
        "url": "https://revhackers.com",
        "logo": "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/67f7fc91b95d208445a1317a.jpeg",
        "description": "Consultoria especializada em Revenue Operations, ABM e Growth B2B. Unificamos Marketing, Vendas e CS para escalar operações complexas.",
        "foundingDate": "2023",
        "founders": [
            {
                "@type": "Person",
                "name": "Giulliano P.",
                "jobTitle": "Co-Founder & Growth Engineer"
            },
            {
                "@type": "Person",
                "name": "Luna M.",
                "jobTitle": "Co-Founder & Revenue Architect"
            }
        ],
        "sameAs": [
            "https://www.linkedin.com/company/revhackers",
            "https://www.instagram.com/revhackers"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BR"
        },
        "priceRange": "$$$"
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook / LinkedIn */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="RevHackers Growth Hub" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* GEO / AI Optimization Tags */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {author && <meta name="author" content={author} />}

            {/* Knowledge Graph Injection */}
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>
        </Helmet>
    );
};

export default SEO;
