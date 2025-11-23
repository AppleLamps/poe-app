import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { callOpenRouter, streamOpenRouterResponse } from "@/lib/openrouter"
import { chatSchema } from "@/lib/validations"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = chatSchema.safeParse(body)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { message, botId, chatId } = validationResult.data

    // Get bot details
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
      return new Response("Bot not found", { status: 404 })
    }

    // Get or create chat
    let chat
    if (chatId) {
      chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
          botId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          botId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: message,
      },
    })

    // Prepare messages for OpenRouter
    const messages = [
      {
        role: "system" as const,
        content: bot.systemPrompt,
      },
      ...chat.messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ]

    // Call OpenRouter API
    const response = await callOpenRouter({
      model: bot.modelName,
      messages,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
    })

    // Create SSE response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ""
        let streamCompleted = false
        
        try {
          for await (const chunk of streamOpenRouterResponse(response)) {
            fullResponse += chunk
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          streamCompleted = true

          // Send completion signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          // Send error to client
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`)
            )
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (closeError) {
            // Controller might already be closed
            console.error("Failed to close stream:", closeError)
          }
        } finally {
          // Always save the response, even if stream was interrupted
          // This ensures we don't lose conversation history
          if (fullResponse.trim().length > 0) {
            try {
              await prisma.message.create({
                data: {
                  chatId: chat.id,
                  role: "assistant",
                  content: fullResponse,
                },
              })
            } catch (dbError) {
              console.error("Failed to save assistant message:", dbError)
              // Log but don't throw - we've already sent the response to client
            }
          } else if (!streamCompleted) {
            // If stream failed before any content, log for debugging
            console.warn("Stream failed before receiving any content")
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
