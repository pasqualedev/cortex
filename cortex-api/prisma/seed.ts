import 'dotenv/config'
import { PrismaClient, CognitiveAttribute } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
const prisma = new PrismaClient({ adapter })

async function main(): Promise<void> {
  await prisma.topic.createMany({
    data: [
      { name: 'Matemática', slug: 'matematica', cognitiveAttribute: CognitiveAttribute.LOGICA },
      { name: 'Ciências da Natureza', slug: 'ciencias', cognitiveAttribute: CognitiveAttribute.CIENCIAS },
      { name: 'Linguagens e Códigos', slug: 'linguagens', cognitiveAttribute: CognitiveAttribute.INTERPRETACAO },
      { name: 'Ciências Humanas', slug: 'humanas', cognitiveAttribute: CognitiveAttribute.MEMORIA },
    ],
    skipDuplicates: true,
  })

  await prisma.achievement.createMany({
    data: [
      { id: 'first-challenge', name: 'Primeiro Passo', type: 'SESSION', threshold: 1, icon: 'footsteps-outline', description: 'Complete seu primeiro desafio' },
      { id: 'streak-3', name: 'Três em Sequência', type: 'STREAK', threshold: 3, icon: 'flame-outline', description: '3 dias de estudo consecutivos' },
      { id: 'streak-7', name: 'Semana Perfeita', type: 'STREAK', threshold: 7, icon: 'flame', description: '7 dias de estudo consecutivos' },
      { id: 'streak-30', name: 'Mês Dedicado', type: 'STREAK', threshold: 30, icon: 'trophy-outline', description: '30 dias de estudo consecutivos' },
      { id: 'perfect-session', name: 'Mente Afiada', type: 'PERFECT', threshold: 1, icon: 'star-outline', description: '10/10 em um único desafio' },
      { id: 'questions-50', name: 'Meio Centenário', type: 'VOLUME', threshold: 50, icon: 'library-outline', description: '50 questões respondidas' },
      { id: 'questions-100', name: 'Centenário', type: 'VOLUME', threshold: 100, icon: 'library', description: '100 questões respondidas' },
      { id: 'questions-500', name: 'Maratonista', type: 'VOLUME', threshold: 500, icon: 'medal-outline', description: '500 questões respondidas' },
      { id: 'level-5', name: 'Córtex Ativado', type: 'LEVEL', threshold: 5, icon: 'flash-outline', description: 'Atingir Nível 5' },
      { id: 'level-10', name: 'Cérebro Pleno', type: 'LEVEL', threshold: 10, icon: 'hardware-chip-outline', description: 'Atingir Nível 10' },
      { id: 'logica-80', name: 'Lógico Avançado', type: 'SKILL', threshold: 80, icon: 'calculator-outline', description: 'Atributo Lógica ≥ 80%' },
    ],
    skipDuplicates: true,
  })

  console.log('Seed completed.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
