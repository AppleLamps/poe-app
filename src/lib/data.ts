import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getBotsForUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const bots = await prisma.bot.findMany({
    where: {
      OR: [
        { ownerId: null }, // Default bots
        { ownerId: session.user.id }, // User's custom bots
      ],
    },
    orderBy: [
      { ownerId: "asc" }, // Default bots first
      { createdAt: "desc" },
    ],
  })

  return bots
}

export async function getChatsForUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      bot: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Get last message for preview
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return chats
}

