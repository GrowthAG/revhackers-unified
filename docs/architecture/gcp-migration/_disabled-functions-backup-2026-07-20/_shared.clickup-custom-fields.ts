// supabase/functions/_shared/clickup-custom-fields.ts

// -----------------------------------------------------------------------------
// ClickUp Custom Fields Helper
// -----------------------------------------------------------------------------
// Utilizado para garantir e popular o campo customizado `hub_project_id` nas
// tasks geradas pelo hub. Este campo e o elo inquebravel que impede perdas de
// sincronia em renomeacoes de pasta no frontend.
// -----------------------------------------------------------------------------

export async function ensureHubProjectIdField(spaceId: string, apiKey: string): Promise<string> {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/field`;
    const headers = { 'Authorization': apiKey, 'Content-Type': 'application/json' };

    // 1. Busca os campos da subconta/space
    const res = await fetch(url, { headers });

    if (!res.ok) {
        throw new Error(`Failed to fetch custom fields for space ${spaceId}: ${await res.text()}`);
    }

    const json = await res.json();
    const fields = json.fields || [];

    const existingField = fields.find((f: any) => f.name === 'hub_project_id');

    if (existingField) {
        return existingField.id;
    }

    // 2. Se nao existir, cria o campo
    const createRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: "hub_project_id",
            type: "short_text",
            hide_from_guests: true
        })
    });

    if (!createRes.ok) {
        throw new Error(`Failed to create hub_project_id custom field: ${await createRes.text()}`);
    }

    const createdJson = await createRes.json();
    return createdJson.id;
}

export function buildCustomFieldsPayload(hubProjectId: string | null, fieldId: string | null): any[] {
    if (!hubProjectId || !fieldId) return [];

    return [
        {
            id: fieldId,
            value: hubProjectId
        }
    ];
}
