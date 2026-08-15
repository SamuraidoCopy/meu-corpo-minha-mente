import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationsDirectory = resolve(process.cwd(), 'supabase/migrations')

describe('database migrations', () => {
    it('uses unqualified index names accepted by PostgreSQL', () => {
        const qualifiedIndexNames: string[] = []

        for (const filename of readdirSync(migrationsDirectory)) {
            if (!filename.endsWith('.sql')) continue

            const sql = readFileSync(resolve(migrationsDirectory, filename), 'utf8')
            const indexPattern = /create\s+(?:unique\s+)?index(?:\s+if\s+not\s+exists)?\s+([^\s]+)/gi

            for (const match of sql.matchAll(indexPattern)) {
                if (match[1].includes('.')) {
                    qualifiedIndexNames.push(`${filename}: ${match[1]}`)
                }
            }
        }

        expect(qualifiedIndexNames).toEqual([])
    })
})
