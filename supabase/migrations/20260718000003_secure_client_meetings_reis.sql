-- Fecha os 2 ultimos itens pendentes da varredura completa (ver
-- 20260718000000/1/2): client_meetings e reis, ambas com SELECT publico
-- (`qual: true`) sem nenhum consumidor anonimo legitimo no codigo.
--
-- client_meetings: expunha notas de reuniao (event_notes), link/hash de
-- video de gravacao (video_url, drive_file_id), email e nome de contato do
-- cliente (client_email, client_contact_name) e lista de participantes
-- (attendees jsonb) a qualquer visitante anonimo. Unico ponto do codigo que
-- faz SELECT direto e src/api/clientMeetings.ts:fetchMeetingRecording -
-- grep confirmado, funcao sem nenhum chamador em todo src/ (codigo morto).
-- supabase/functions/google-meetings/index.ts tambem le a tabela, mas usa
-- service_role (ignora RLS, nao depende desta policy). Escrita ja estava
-- corretamente restrita a service_role antes desta migration - so a
-- leitura estava aberta.
--
-- reis: id/created_at/created_by/data (jsonb generico). Zero referencia em
-- src/ ou supabase/functions/ (grep confirmado) e zero linhas na tabela
-- (SELECT count(*) = 0, confirmado ao vivo). Tabela morta.

DROP POLICY IF EXISTS "Allow read client_meetings" ON public.client_meetings;

CREATE POLICY "client_meetings_authenticated_select"
ON public.client_meetings FOR SELECT
TO authenticated
USING (true);

REVOKE ALL ON public.client_meetings FROM anon;

DROP POLICY IF EXISTS "reis_anon_select" ON public.reis;
REVOKE ALL ON public.reis FROM anon;
