import type { QueryResultRow } from 'pg';
import type { TenantId } from '../../contracts/tenant';
import { withTenantTransaction, type QueryablePool } from '../../db/postgres';
import type { GrowthMapRecord, JsonValue, SaveGrowthMapInput } from './contracts';
import type { GrowthMapRepository } from './repository';

interface GrowthMapRow extends QueryResultRow {
  tenant_id: string;
  project_id: string;
  company_name: string;
  company_description: string;
  rei_score: string | number | null;
  growthmap_score: string | number | null;
  rei_connections_count: number;
  frameworks: Record<string, JsonValue>;
  generated_at: Date | string | null;
  updated_at: Date | string;
  created_at: Date | string;
}

function numberOrNull(value: string | number | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error('Invalid numeric value returned by database.');
  return parsed;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid timestamp returned by database.');
  return date.toISOString();
}

function mapRow(row: GrowthMapRow): GrowthMapRecord {
  return {
    tenantId: row.tenant_id,
    projectId: row.project_id,
    companyName: row.company_name,
    companyDescription: row.company_description,
    reiScore: numberOrNull(row.rei_score),
    growthmapScore: numberOrNull(row.growthmap_score),
    reiConnectionsCount: row.rei_connections_count,
    frameworks: row.frameworks,
    generatedAt: row.generated_at === null ? null : iso(row.generated_at),
    updatedAt: iso(row.updated_at),
    createdAt: iso(row.created_at),
  };
}

const RETURNING_COLUMNS = `
  tenant_id, project_id, company_name, company_description,
  rei_score, growthmap_score, rei_connections_count, frameworks,
  generated_at, updated_at, created_at
`;

/** Adapter Cloud SQL/PostgreSQL do primeiro piloto. */
export class PostgresGrowthMapRepository implements GrowthMapRepository {
  constructor(private readonly pool: QueryablePool) {}

  async projectExists(tenantId: TenantId, projectId: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM app.project_tenant_registry
           WHERE tenant_id = $1::uuid AND project_id = $2::uuid
         ) AS exists`,
        [tenantId, projectId],
      );
      return result.rows[0]?.exists === true;
    });
  }

  async findByProject(tenantId: TenantId, projectId: string): Promise<GrowthMapRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<GrowthMapRow>(
        `SELECT ${RETURNING_COLUMNS}
         FROM app.growthmap_results
         WHERE tenant_id = $1::uuid AND project_id = $2::uuid
         LIMIT 1`,
        [tenantId, projectId],
      );
      const row = result.rows[0];
      return row ? mapRow(row) : null;
    });
  }

  async upsert(tenantId: TenantId, projectId: string, input: SaveGrowthMapInput): Promise<GrowthMapRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<GrowthMapRow>(
        `INSERT INTO app.growthmap_results (
           tenant_id, project_id, company_name, company_description,
           rei_score, growthmap_score, rei_connections_count, frameworks,
           generated_at
         ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::jsonb, $9)
         ON CONFLICT (tenant_id, project_id) DO UPDATE SET
           company_name = EXCLUDED.company_name,
           company_description = EXCLUDED.company_description,
           rei_score = EXCLUDED.rei_score,
           growthmap_score = EXCLUDED.growthmap_score,
           rei_connections_count = EXCLUDED.rei_connections_count,
           frameworks = EXCLUDED.frameworks,
           generated_at = EXCLUDED.generated_at
         RETURNING ${RETURNING_COLUMNS}`,
        [
          tenantId,
          projectId,
          input.companyName.trim(),
          input.companyDescription ?? '',
          input.reiScore ?? null,
          input.growthmapScore ?? null,
          input.reiConnectionsCount ?? 0,
          JSON.stringify(input.frameworks),
          input.generatedAt ?? null,
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('GrowthMap upsert returned no row.');
      return mapRow(row);
    });
  }
}
