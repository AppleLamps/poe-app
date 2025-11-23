import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const defaultBots: Omit<Prisma.BotUncheckedCreateInput, 'ownerId'>[] = [
  {
    name: "Gemini 3 Pro",
    modelName: "google/gemini-3-pro",
    systemPrompt: "You are Gemini 3 Pro, a multimodal, long-context AI assistant. You excel at complex reasoning, creative tasks, and detailed analysis. Be helpful, accurate, and engaging in your responses.",
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    name: "GPT-5.1",
    modelName: "openai/gpt-5.1",
    systemPrompt: "You are OpenAI GPT-5.1, a high-reasoning adaptive model. You provide thoughtful, well-reasoned responses across a wide range of topics. You're analytical, precise, and strive to be helpful while maintaining ethical boundaries.",
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    name: "GPT-5.1 Chat",
    modelName: "openai/gpt-5.1-chat",
    systemPrompt: "Optimized for dialogue and conversational tasks. You're friendly, engaging, and maintain natural conversation flow while being helpful and informative. Keep responses conversational but substantive.",
    temperature: 0.8,
    maxTokens: 4096,
  },
  {
    name: "Grok 4.1 Fast",
    modelName: "xai/grok-4.1-fast",
    systemPrompt: "High-speed agentic reasoning from xAI. You provide quick, accurate responses with a touch of personality. You're efficient, direct, and maintain a slightly witty tone while being genuinely helpful.",
    temperature: 0.6,
    maxTokens: 4096,
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing default bots (keep user-created bots)
  await prisma.bot.deleteMany({
    where: { ownerId: null }
  })
  console.log('🧹 Cleaned existing default bots')

  // Create default bots
  for (const bot of defaultBots) {
    await prisma.bot.create({
      data: {
        ...bot,
        ownerId: null,
      },
    })
    console.log(`✅ Created default bot: ${bot.name}`)
  }

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
