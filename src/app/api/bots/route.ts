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
    const botId = searchParams.get("id")

    if (botId) {
      // Get single bot
      const bot = await prisma.bot.findFirst({
        where: {
          id: botId,
          OR: [
            { ownerId: null }, // Default bots
            { ownerId: session.user.id }, // User's custom bots
          ],
        },
      })

      if (!bot) {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 })
      }

      return NextResponse.json(bot)
    } else {
      // Get all bots (default + user's custom bots)
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

      return NextResponse.json(bots)
    }
  } catch (error) {
    console.error("Bots GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, avatarUrl, systemPrompt, modelName, temperature, maxTokens } = await request.json()

    if (!name || !systemPrompt || !modelName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bot = await prisma.bot.create({
      data: {
        ownerId: session.user.id,
        name,
        avatarUrl,
        systemPrompt,
        modelName,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 4096,
      },
    })

    return NextResponse.json(bot, { status: 201 })
  } catch (error) {
    console.error("Bots POST error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, avatarUrl, systemPrompt, modelName, temperature, maxTokens } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing bot ID" }, { status: 400 })
    }

    const bot = await prisma.bot.updateMany({
      where: {
        id,
        ownerId: session.user.id, // Only allow updating own bots
      },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(systemPrompt && { systemPrompt }),
        ...(modelName && { modelName }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
      },
    })

    if (bot.count === 0) {
      return NextResponse.json({ error: "Bot not found or not authorized" }, { status: 404 })
    }

    const updatedBot = await prisma.bot.findUnique({
      where: { id },
    })

    return NextResponse.json(updatedBot)
  } catch (error) {
    console.error("Bots PUT error:", error)
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
    const botId = searchParams.get("id")

    if (!botId) {
      return NextResponse.json({ error: "Missing bot ID" }, { status: 400 })
    }

    const bot = await prisma.bot.deleteMany({
      where: {
        id: botId,
        ownerId: session.user.id, // Only allow deleting own bots
      },
    })

    if (bot.count === 0) {
      return NextResponse.json({ error: "Bot not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bots DELETE error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
