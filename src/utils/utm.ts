/**
 * UTM Tracking utilities para o RevHackers Growth Hub.
 * 
 * Uso:
 *   import { buildBookingUrl } from '@/utils/utm';
 *   <Link to={buildBookingUrl('homepage', 'hero_cta')}>Auditar Minha Operação</Link>
 */

export type UtmSource =
  | 'homepage'
  | 'servicos'
  | 'metodologia'
  | 'cases'
  | 'blog'
  | 'materiais'
  | 'booking';

export type UtmMedium = 'cta' | 'banner' | 'inline' | 'modal' | 'footer';

export interface UtmParams {
  source: UtmSource;
  medium?: UtmMedium;
  campaign?: string;
  content?: string;
}

/**
 * Constrói a URL de booking com parâmetros UTM para rastreamento de conversão.
 * 
 * @example
 * buildBookingUrl('homepage', 'hero_cta')
 * // → '/booking?utm_source=homepage&utm_medium=cta&utm_campaign=auditar_operacao&utm_content=hero_cta'
 */
export function buildBookingUrl(source: UtmSource, content?: string, medium: UtmMedium = 'cta'): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: 'auditar_operacao',
    ...(content ? { utm_content: content } : {}),
  });
  return `/booking?${params.toString()}`;
}

/**
 * Captura os UTM params da URL atual e retorna como objeto.
 * Use para passar os parâmetros para sistemas de analytics ou CRM.
 */
export function captureUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const searchParams = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const val = searchParams.get(key);
    if (val) utm[key] = val;
  });
  return utm;
}

/**
 * Persiste os UTM params da URL atual no sessionStorage para uso posterior
 * (ex: quando o usuário navega para outras páginas antes de converter).
 */
export function persistUtmParams(): void {
  if (typeof window === 'undefined') return;
  const params = captureUtmParams();
  if (Object.keys(params).length > 0) {
    sessionStorage.setItem('revhackers_utm', JSON.stringify(params));
  }
}

/**
 * Recupera os UTM params persistidos no sessionStorage.
 */
export function getPersistedUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem('revhackers_utm');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
