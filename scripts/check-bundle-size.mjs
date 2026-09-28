#!/usr/bin/env node
/**
 * Fails when the built assets exceed the performance budgets.
 * Budgets are documented in docs/performance.md.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')

const BUDGETS = {
  entryBytes: 150_000,
  chunkBytes: 170_000,
  totalBytes: 2_300_000,
}

function walk(directory) {
  const files = []

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)

    if (statSync(path).isDirectory()) {
      files.push(...walk(path))
      continue
    }

    files.push(path)
  }

  return files
}

const files = walk(dist)
const rows = []
let total = 0

for (const file of files) {
  const gzipped = gzipSync(readFileSync(file)).length

  total += gzipped

  if (file.endsWith('.js')) {
    rows.push({ file: relative(root, file), bytes: gzipped })
  }
}

rows.sort((left, right) => right.bytes - left.bytes)

const failures = []
const entry = rows.find((row) => /assets\/index-.*\.js$/.test(row.file))

if (entry && entry.bytes > BUDGETS.entryBytes) {
  failures.push(
    `entry chunk ${entry.file} is ${String(entry.bytes)} B (budget ${String(BUDGETS.entryBytes)} B)`,
  )
}

for (const row of rows) {
  if (row.bytes > BUDGETS.chunkBytes) {
    failures.push(
      `chunk ${row.file} is ${String(row.bytes)} B (budget ${String(BUDGETS.chunkBytes)} B)`,
    )
  }
}

if (total > BUDGETS.totalBytes) {
  failures.push(`total dist is ${String(total)} B gzipped (budget ${String(BUDGETS.totalBytes)} B)`)
}

const format = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

console.log('Largest JavaScript chunks (gzipped):')

for (const row of rows.slice(0, 6)) {
  console.log(`  ${format(row.bytes).padStart(9)}  ${row.file}`)
}

console.log(`Total dist (gzipped): ${format(total)}`)

if (failures.length > 0) {
  console.error('\nBundle size budget exceeded:')

  for (const failure of failures) {
    console.error(`  ${failure}`)
  }

  process.exit(1)
}

console.log('Bundle size budget OK.')
