import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
const prisma = new PrismaClient({ adapter })
const ENEM_API_URL = process.env['ENEM_API_URL'] ?? 'https://api.enem.dev/v1'
const RATE_LIMIT_MS = 500

interface ENEMQuestion {
  readonly index: number
  readonly year: number
  readonly discipline: string
  readonly context?: string
  readonly files?: string[]
  readonly alternativesIntroduction?: string
  readonly statement: string
  readonly alternatives: Array<{ letter: string; text: string }>
  readonly correctAlternative: string
}

const DISCIPLINE_TOPIC_MAP: Record<string, string> = {
  'Matemática': 'matematica',
  'Linguagens, Códigos e suas Tecnologias': 'linguagens',
  'Ciências da Natureza e suas Tecnologias': 'ciencias',
  'Ciências Humanas e suas Tecnologias': 'humanas',
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchQuestions(year: number): Promise<ENEMQuestion[]> {
  const response = await fetch(`${ENEM_API_URL}/exams/${year}/questions`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${year}: ${response.status}`)
  }
  return response.json() as Promise<ENEMQuestion[]>
}

async function importYear(year: number): Promise<void> {
  console.log(`Importing ${year}...`)
  const questions = await fetchQuestions(year)

  const topics = await prisma.topic.findMany({ select: { id: true, slug: true } })
  const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t.id]))

  let imported = 0
  let skipped = 0

  for (const q of questions) {
    const topicSlug = DISCIPLINE_TOPIC_MAP[q.discipline]
    const topicId = topicSlug ? topicBySlug[topicSlug] : undefined

    if (!topicId) {
      skipped++
      continue
    }

    const externalId = `enem-${year}-${q.index}`
    const existing = await prisma.question.findUnique({
      where: { externalId },
      select: { id: true },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.question.create({
      data: {
        externalId,
        year: q.year,
        index: q.index,
        topicId,
        statement: q.statement,
        alternatives: q.alternatives.map((a) => ({ key: a.letter, text: a.text })),
        correctKey: q.correctAlternative,
        difficulty: 3,
      },
    })

    imported++
    await sleep(RATE_LIMIT_MS)
  }

  console.log(`${year}: imported ${imported}, skipped ${skipped}`)
}

async function main(): Promise<void> {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  for (const year of years) {
    await importYear(year)
  }
  console.log('Import complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
