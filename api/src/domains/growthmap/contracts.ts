import type { TenantId } from '../../contracts/tenant';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/** Registro persistido. tenantId nunca é serializado para o frontend como autoridade. */
export interface GrowthMapRecord {
  tenantId: TenantId;
  projectId: string;
  companyName: string;
  companyDescription: string;
  reiScore: number | null;
  growthmapScore: number | null;
  reiConnectionsCount: number;
  frameworks: Record<string, JsonValue>;
  generatedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

/** Resposta pública autenticada da API; ownership já foi validado server-side. */
export type GrowthMapView = Omit<GrowthMapRecord, 'tenantId'>;

/** Body de PUT. projectId e tenantId vêm do path/contexto, nunca do body. */
export interface SaveGrowthMapInput {
  companyName: string;
  companyDescription?: string;
  reiScore?: number | null;
  growthmapScore?: number | null;
  reiConnectionsCount?: number;
  frameworks: Record<string, JsonValue>;
  generatedAt?: string | null;
}

export function toGrowthMapView(record: GrowthMapRecord): GrowthMapView {
  const { tenantId: _tenantId, ...view } = record;
  return view;
}
