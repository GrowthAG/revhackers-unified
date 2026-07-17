const DISABLED_DEPLOY_RESULT = Object.freeze({
  ok: false,
  code: 'LEGACY_FTP_DEPLOY_DISABLED',
  reason: 'GCP_MIGRATION_IN_PROGRESS',
});

export function failLegacyDeploy(entrypoint = 'legacy-deploy') {
  console.error(
    JSON.stringify({
      ...DISABLED_DEPLOY_RESULT,
      entrypoint,
    }),
  );
  process.exitCode = 1;
  return DISABLED_DEPLOY_RESULT;
}
