
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CaseNotFound from '@/components/cases/CaseNotFound';
import CaseHero from '@/components/cases/CaseHero';
import CaseContent from '@/components/cases/CaseContent';
import { getCaseBySlug, CaseStudy as CaseStudyDB } from '@/api/cases';
import { CaseStudy } from '@/data/casesData';
import { Loader2 } from 'lucide-react';

const CasesDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [caseData, setCaseData] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCase = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // 1. Attempt to fetch from Supabase
        const dbCase = await getCaseBySlug(slug);

        if (dbCase) {
          // Map DB keys to Component keys
          const mappedCase: CaseStudy = {
            title: dbCase.title,
            category: dbCase.case_category || 'Geral',
            logo: dbCase.client_logo || '',
            coverImage: dbCase.image_url || '',
            challenge: dbCase.challenge || 'Desafio não informado.',
            solution: dbCase.solution || 'Solução não informada.',
            results: typeof dbCase.results === 'string' ? [dbCase.results] : [],
            metrics: Array.isArray(dbCase.metrics)
              ? dbCase.metrics.map((m: any) => ({ value: m.value, label: m.label }))
              : [{ value: dbCase.primary_metric || '', label: 'Resultado Principal' }],
            quote: dbCase.testimonial_quote || '',
            author: dbCase.testimonial_author || '',
            role: dbCase.testimonial_role || '',
            authorImage: dbCase.testimonial_avatar || ''
          };
          setCaseData(mappedCase);
        } else {
          // 2. FALLBACK: Try Static Data
          console.log(`Case not found in DB, checking static data for slug: ${slug}`);
          // @ts-ignore - access by string key
          const staticCase = (casesData as any)[slug];

          if (staticCase) {
            console.log("Found static case:", staticCase);
            setCaseData(staticCase);
          } else {
            console.warn("Case not found in DB or Static Data");
            setCaseData(null);
          }
        }
      } catch (error) {
        console.error("Error loading case detail:", error);
        // On error, also try static fallback
        // @ts-ignore
        const staticCase = (casesData as any)[slug];
        if (staticCase) {
          setCaseData(staticCase);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCase();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="h-screen w-full flex items-center justify-center bg-black">
          <Loader2 className="h-10 w-10 text-revgreen animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!caseData) {
    return (
      <PageLayout>
        <CaseNotFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CaseHero caseData={caseData} />
      <CaseContent caseData={caseData} />
    </PageLayout>
  );
};

export default CasesDetalhe;
