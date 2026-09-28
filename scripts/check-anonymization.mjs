#!/usr/bin/env node
/**
 * Fails when any published content contains institutional or course
 * identifiers from the denylist. Runs in CI over src/content and public.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const denylist = JSON.parse(readFileSync(join(root, 'scripts/anonymization-denylist.json'), 'utf8'))
const targets = ['src/content', 'public', 'src/features/study', 'src/shared/i18n']
const extensions = new Set(['.ts', '.tsx', '.json', '.md', '.svg', '.html'])

/** @param {string} directory @returns {string[]} */
function walk(directory) {
  const files = []

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    const stats = statSync(path)

    if (stats.isDirectory()) {
      files.push(...walk(path))
      continue
    }

    if ([...extensions].some((extension) => entry.endsWith(extension))) {
      files.push(path)
    }
  }

  return files
}

const violations = []

for (const target of targets) {
  const absolute = join(root, target)
  let files = []

  try {
    files = walk(absolute)
  } catch {
    continue
  }

  for (const file of files) {
    const contents = readFileSync(file, 'utf8').toLowerCase()

    for (const term of denylist.terms) {
      if (contents.includes(term.toLowerCase())) {
        violations.push({ file: relative(root, file), term })
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Anonymization check failed. Remove institutional identifiers:')

  for (const violation of violations) {
    console.error(`  ${violation.file}: "${violation.term}"`)
  }

  process.exit(1)
}

console.log('Anonymization check passed.')
