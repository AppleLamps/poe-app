import { z } from "zod"

// Allowed model names (must match AVAILABLE_MODELS in create-bot page)
export const ALLOWED_MODELS = [
  "google/gemini-3-pro",
  "openai/gpt-5.1",
  "openai/gpt-5.1-chat",
  "xai/grok-4.1-fast",
] as const

// Bot creation/update schema
export const botSchema = z.object({
  name: z.string().min(1).max(100),
  avatarUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  systemPrompt: z.string().min(1).max(4000),
  modelName: z.enum(ALLOWED_MODELS),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8192).default(4096),
})

// Bot update schema (all fields optional except id)
// Note: IDs are CUIDs from Prisma, using string validation with length check
export const botUpdateSchema = z.object({
  id: z.string().min(1).max(128), // CUID format, not UUID
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  systemPrompt: z.string().min(1).max(4000).optional(),
  modelName: z.enum(ALLOWED_MODELS).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
})

// Chat message schema
// Note: IDs are CUIDs from Prisma, using string validation with length check
export const chatSchema = z.object({
  botId: z.string().min(1).max(128), // CUID format, not UUID
  chatId: z.string().min(1).max(128).optional(), // CUID format, not UUID
  message: z.string().min(1).max(8000),
})

// Bot ID schema for DELETE endpoint
export const botIdSchema = z.string().min(1).max(128) // CUID format, not UUID

