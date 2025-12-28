
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CaseNotFound from '@/components/cases/CaseNotFound';
import CaseHero from '@/components/cases/CaseHero';
import CaseContent from '@/components/cases/CaseContent';
import { getCaseBySlug, CaseStudy as CaseStudyDB } from '@/api/cases';
import { CaseStudy, casesData } from '@/data/casesData';
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
        // 1. Try Supabase first
        console.log(`🔄 Fetching case from Supabase: ${slug}`);
        const dbCase = await getCaseBySlug(slug);

        if (dbCase) {
          // 2. Load static data as base for missing fields (techStack, logoScale, etc)
          // @ts-ignore
          const staticCase = (casesData as any)[slug] || {};

          // 3. Map DB keys to Component keys, with STRICT preference for Static Data on Technical Narrative
          // This ensures NoVibeCode HARD integrity against incomplete DB records.
          const mappedCase: CaseStudy = {
            title: dbCase.title || staticCase.title,
            category: dbCase.case_category || staticCase.category || 'Geral',
            logo: dbCase.client_logo || staticCase.logo || '',
            coverImage: dbCase.image_url || staticCase.coverImage || '',

            // 🛡️ Technical Narrative: "Safe Hybrid" Logic
            // Priority: DB > Static.
            // Safety: Only use DB if it has substantial content (> 10 chars). Otherwise fallback to Static.
            challenge: (dbCase.challenge && dbCase.challenge.length > 10) ? dbCase.challenge : staticCase.challenge || 'Desafio não informado.',
            solution: (dbCase.solution && dbCase.solution.length > 10) ? dbCase.solution : staticCase.solution || 'Solução não informada.',
            results: (dbCase.results && dbCase.results.length > 10) ? dbCase.results.split('\n').filter(Boolean) : (staticCase.results || []),
            metrics: (Array.isArray(dbCase.metrics) && dbCase.metrics.length > 0) ? dbCase.metrics.map((m: any) => ({ value: m.value, label: m.label })) : (staticCase.metrics || []),

            // Testimonial & Author can come from DB
            quote: dbCase.testimonial || staticCase.quote || '',
            author: dbCase.testimonial_author || staticCase.author || '',
            role: dbCase.testimonial_role || staticCase.role || '',
            authorImage: dbCase.testimonial_avatar || staticCase.authorImage || '',

            // Static-only technical fields
            techStack: staticCase.techStack || [],
            logoScale: staticCase.logoScale || 1.4
          };

          setCaseData(mappedCase);
          console.log("✅ Case loaded from Supabase (+ static fallback for rich fields)");
        } else {
          // 4. Full Static Fallback
          // @ts-ignore
          const staticCase = (casesData as any)[slug];
          if (staticCase) {
            console.log("✅ Using STATIC data (not found in DB):", slug);
            setCaseData(staticCase);
          } else {
            console.warn("❌ Case not found in Static or DB");
            setCaseData(null);
          }
        }
      } catch (error) {
        console.error("Error loading case detail:", error);
        // On error, try static fallback
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
