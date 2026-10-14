import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { prepareMigrationFolder } from './migrationFolder';

describe('prepareMigrationFolder', () => {
  it('keeps upstream migrations for the default search provider', () => {
    expect(prepareMigrationFolder('/upstream', 'pg_search').folder).toBe('/upstream');
  });

  it('preserves schema migrations and original SQL while omitting ParadeDB indexes', () => {
    const source = mkdtempSync(path.join(tmpdir(), 'muqyy-migration-test-'));
    const files = {
      '0001_schema.sql': 'CREATE TABLE example(id text);',
      '0090_enable_pg_search.sql': 'CREATE EXTENSION pg_search;',
      '0093_add_bm25_indexes_with_icu.sql': 'CREATE INDEX USING bm25;',
    };
    for (const [name, content] of Object.entries(files))
      writeFileSync(path.join(source, name), content);
    const prepared = prepareMigrationFolder(source, 'pg_like');
    try {
      expect(readFileSync(path.join(prepared.folder, '0001_schema.sql'), 'utf8')).toBe(
        files['0001_schema.sql'],
      );
      for (const name of Object.keys(files).slice(1)) {
        expect(readFileSync(path.join(prepared.folder, name), 'utf8')).toContain('SELECT 1;');
        expect(readFileSync(path.join(source, name), 'utf8')).toBe(
          files[name as keyof typeof files],
        );
      }
    } finally {
      prepared.cleanup();
      rmSync(source, { force: true, recursive: true });
    }
  });
});
