import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { botSchema, botUpdateSchema, botIdSchema } from "@/lib/validations"

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

    const body = await request.json()
    
    // Validate request body
    const validationResult = botSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, avatarUrl, systemPrompt, modelName, temperature, maxTokens } = validationResult.data

    const bot = await prisma.bot.create({
      data: {
        ownerId: session.user.id,
        name,
        avatarUrl,
        systemPrompt,
        modelName,
        temperature,
        maxTokens,
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

    const body = await request.json()

    // Validate request body
    const validationResult = botUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { id, name, avatarUrl, systemPrompt, modelName, temperature, maxTokens } = validationResult.data

    // Build update data object, only including defined fields
    const updateData: {
      name?: string
      avatarUrl?: string | null
      systemPrompt?: string
      modelName?: string
      temperature?: number
      maxTokens?: number
    } = {}
    
    if (name !== undefined) updateData.name = name
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt
    if (modelName !== undefined) updateData.modelName = modelName
    if (temperature !== undefined) updateData.temperature = temperature
    if (maxTokens !== undefined) updateData.maxTokens = maxTokens

    const bot = await prisma.bot.updateMany({
      where: {
        id,
        ownerId: session.user.id, // Only allow updating own bots
      },
      data: updateData,
    })

    if (bot.count === 0) {
      return NextResponse.json({ error: "Bot not found or not authorized" }, { status: 404 })
    }

    const updatedBot = await prisma.bot.findFirst({
      where: { id, ownerId: session.user.id },
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

    // Validate bot ID format
    const idValidation = botIdSchema.safeParse(botId)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid bot ID format", details: idValidation.error.errors },
        { status: 400 }
      )
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
