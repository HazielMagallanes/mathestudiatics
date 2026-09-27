# Anonymization policy / Política de anonimización

> This document is part of the product, not an afterthought: content that reaches
> the public repository must not identify people or institutions, and must be
> original prose.
>
> Este documento es parte del producto, no un agregado: el contenido que llega al
> repositorio público no debe identificar personas ni instituciones, y debe ser
> prosa original.

## Rules

1. **Original writing only.** Theory pages and exercise wording are written from
   scratch. Source PDFs are never copied verbatim, partially or in full.
2. **No identity data.** Names of professors, students or staff, email addresses,
   phone numbers, signatures, and any personal identifiers must not appear.
3. **No institution data.** University names, faculties, course names/codes,
   department names, institutional logos and headers are removed.
4. **Neutral framing.** Exercises and theory describe mathematics itself; actors
   in word problems use generic, locale-appropriate placeholder names
   (randomized for exercises).
5. **Private sources stay private.** The `material/` directory with the original
   PDFs is git-ignored and never published; it is reference material for authoring
   only.
6. **No third-party content.** Exercise archetypes are inspired by standard
   curricula; no external problem sets are reproduced.

## Enforcement

- A denylist check runs in CI over `src/content/**` and `public/**`
  (added in milestone M7; see `scripts/check-anonymization.mjs` when it lands).
- Reviewers reject any PR that adds identifying or verbatim material.
- The policy applies to commits, comments, docs, fixtures and test data alike.

## Scope

Applies to everything committed to this repository, including translations in
English and Spanish, documentation, screenshots and example seeds.
