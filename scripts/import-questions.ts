import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()
const BASE_URL = "https://api.enem.dev/v1"

const examListSchema = z.object({
  exams: z.array(z.object({ year: z.number() })),
})

const questionListSchema = z.object({
  questions: z.array(
    z.object({
      index: z.number(),
      discipline: z.string(),
      context: z.string().optional().default(""),
      files: z.array(z.string()).optional().default([]),
      alternatives: z.array(z.object({ letter: z.string(), text: z.string() })),
      correctAlternative: z.string(),
    })
  ),
})

/** Topic and subtopic assigned to each normalized ENEM area */
const TOPIC_MAP: Record<string, { topic: string; subtopic: string }> = {
  Matemática: { topic: "Matemática Geral", subtopic: "Sem classificação" },
  Humanas: { topic: "Humanas Geral", subtopic: "Sem classificação" },
  Natureza: { topic: "Natureza Geral", subtopic: "Sem classificação" },
  Linguagens: { topic: "Linguagens Geral", subtopic: "Sem classificação" },
}

/**
 * Normalizes a discipline string to one of the four ENEM areas.
 * @param discipline - Raw discipline name from the API
 */
function normalizeArea(discipline: string): string {
  if (discipline.includes("Matemática")) return "Matemática"
  if (discipline.includes("Humanas")) return "Humanas"
  if (discipline.includes("Natureza")) return "Natureza"
  if (discipline.includes("Linguagens")) return "Linguagens"
  return discipline
}

/**
 * Pauses execution for the given number of milliseconds.
 * @param ms - Duration in milliseconds
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetches a URL with automatic retry on HTTP 429 (rate limit).
 * @param url - The URL to fetch
 * @param retries - Number of attempts before throwing
 */
async function fetchWithRetry(url: string, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)
    if (res.status === 429) {
      console.log("Rate limited — waiting 3s...")
      await delay(3000)
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res.json()
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

/**
 * Imports all questions for a single exam year into the database.
 * @param year - The exam year to import
 */
async function importYear(year: number): Promise<void> {
  console.log(`\nImporting year ${year}...`)
  const raw = await fetchWithRetry(`${BASE_URL}/exams/${year}/questions`)
  const parsed = questionListSchema.safeParse(raw)
  if (!parsed.success) throw new Error(`Invalid question list response for year ${year}: ${parsed.error.message}`)

  const questions = parsed.data.questions
  console.log(`  Found ${questions.length} questions`)

  for (const q of questions) {
    const area = normalizeArea(q.discipline)
    const { topic, subtopic } = TOPIC_MAP[area] ?? {
      topic: "Outros",
      subtopic: "Sem classificação",
    }

    await prisma.question.upsert({
      where: { externalId: `${year}-${q.index}` },
      create: {
        externalId: `${year}-${q.index}`,
        year,
        index: q.index,
        area,
        topic,
        subtopic,
        statement: q.context,
        alternatives: q.alternatives.map((a) => ({
          key: a.letter,
          text: a.text,
        })),
        correctKey: q.correctAlternative,
        imageUrl: q.files[0] ?? null,
      },
      update: {},
    })

    await delay(1100) // respect 1 req/sec rate limit
  }

  console.log(`  Done importing ${year}`)
}

/**
 * Entry point: fetches all available exam years and imports each one sequentially.
 */
async function main(): Promise<void> {
  const raw = await fetchWithRetry(`${BASE_URL}/exams`)
  const parsed = examListSchema.safeParse(raw)
  if (!parsed.success) throw new Error(`Invalid exams list response: ${parsed.error.message}`)

  const years = parsed.data.exams.map((e) => e.year).sort()
  console.log(`Found exams for years: ${years.join(", ")}`)

  for (const year of years) {
    await importYear(year)
  }

  console.log("\nImport complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
