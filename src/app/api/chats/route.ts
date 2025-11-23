import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const botId = searchParams.get("botId")
    const chatId = searchParams.get("chatId")

    if (chatId) {
      // Get single chat with messages
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          bot: true,
        },
      })

      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
      }

      return NextResponse.json(chat)
    } else {
      // Get all chats for a bot or all chats
      const chats = await prisma.chat.findMany({
        where: {
          userId: session.user.id,
          ...(botId && { botId }),
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

      return NextResponse.json(chats)
    }
  } catch (error) {
    console.error("Chats GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 })
    }

    const chat = await prisma.chat.deleteMany({
      where: {
        id: chatId,
        userId: session.user.id, // Only allow deleting own chats
      },
    })

    if (chat.count === 0) {
      return NextResponse.json({ error: "Chat not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Chats DELETE error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
