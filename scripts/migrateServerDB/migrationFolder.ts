import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** pg_like uses ordinary PostgreSQL queries and does not need ParadeDB indexes. */
export const prepareMigrationFolder = (source: string, searchProvider?: string) => {
  if (searchProvider !== 'pg_like') return { cleanup: () => {}, folder: source };
  const folder = mkdtempSync(path.join(tmpdir(), 'muqyy-lobehub-migrations-'));
  cpSync(source, folder, { recursive: true });
  for (const filename of ['0090_enable_pg_search.sql', '0093_add_bm25_indexes_with_icu.sql']) {
    writeFileSync(
      path.join(folder, filename),
      'SELECT 1; -- pg_like does not use ParadeDB indexes\n',
    );
  }
  return { cleanup: () => rmSync(folder, { force: true, recursive: true }), folder };
};
