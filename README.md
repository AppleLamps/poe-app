# OpenChatHub - Multi-Model Chat Platform

A modern, production-ready multi-model chat application built with Next.js 16, TypeScript, and Vercel deployment in mind. Chat with multiple AI models including Gemini, GPT-5, and Grok through OpenRouter API.

## ✨ Features

- **Multi-Model Support**: Access Google Gemini 3 Pro, OpenAI GPT-5.1, GPT-5.1 Chat, and xAI Grok 4.1 Fast
- **Custom Bot Builder**: Create personalized AI assistants with custom prompts, avatars, and advanced settings
- **Real-time Streaming**: Edge-compatible SSE streaming for instant responses with proper error handling
- **Modern UI**: Beautiful interface built with shadcn/ui components and TailwindCSS
- **Authentication**: Secure Google OAuth integration with NextAuth.js
- **Chat History**: Persistent conversations with search, organization, and bot profile pages
- **Mobile Responsive**: Optimized for all devices with collapsible sidebar and touch-friendly interface
- **Bot Management**: View, edit, and delete custom bots with detailed statistics
- **Environment Validation**: Built-in validation for required environment variables

## 🚀 Tech Stack

- **Frontend**: Next.js 16 App Router, TypeScript 5, TailwindCSS 4, shadcn/ui
- **Backend**: Next.js Route Handlers with Edge Runtime
- **Database**: PostgreSQL with Prisma ORM 7
- **Authentication**: NextAuth.js v4 with Google OAuth
- **AI Integration**: OpenRouter API with streaming support
- **Deployment**: Vercel-optimized with Edge Functions
- **UI Components**: Radix UI primitives with custom styling
- **Development**: ESLint, TypeScript strict mode, React Compiler enabled

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (Vercel Postgres, Neon, Supabase, or local)
- OpenRouter API key
- Google OAuth credentials (for authentication)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd poe-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/openchathub"

# OpenRouter API
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

**Note**: The app includes built-in environment validation and will fail fast with clear error messages if required variables are missing.

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed default bots
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User**: Authentication and user management with NextAuth integration
- **Bot**: AI bot configurations (default and custom) with advanced settings
- **Chat**: Conversation sessions with bot relationships
- **Message**: Individual chat messages with role-based content
- **Account/Session/VerificationToken**: NextAuth.js authentication models

## 🤖 Available AI Models

- **Google Gemini 3 Pro**: Multimodal, long-context AI (`google/gemini-3-pro`)
- **OpenAI GPT-5.1**: High-reasoning adaptive model (`openai/gpt-5.1`)
- **OpenAI GPT-5.1 Chat**: Optimized for dialogue (`openai/gpt-5.1-chat`)
- **xAI Grok 4.1 Fast**: High-speed agentic reasoning (`xai/grok-4.1-fast`)

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**

   ```bash
   npx vercel
   ```

2. **Environment Variables**
   Set these in your Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your deployed URL (e.g., `https://your-app.vercel.app`)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

3. **Database Setup**
   - Use Vercel Postgres, NeonDB, or Supabase for production
   - Run `npm run db:push` to sync schema
   - Run `npm run db:seed` to create default bots

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes (Edge Runtime)
│   │   ├── auth/        # NextAuth endpoints
│   │   ├── bots/        # Bot CRUD operations
│   │   ├── chat/        # Chat streaming endpoint
│   │   └── chats/       # Chat management
│   ├── bot/[id]/        # Bot profile pages
│   ├── create-bot/      # Bot builder interface
│   └── page.tsx         # Main dashboard
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── chat-interface.tsx
│   ├── sidebar.tsx
│   ├── providers.tsx
│   └── welcome-screen.tsx
├── lib/                # Utility libraries
│   ├── auth.ts         # NextAuth configuration
│   ├── env.ts          # Environment validation
│   ├── openrouter.ts   # OpenRouter API client
│   └── prisma.ts       # Database client
└── types/              # TypeScript definitions
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed default bots
- `npm run db:reset` - Reset database

## 🌟 Key Features

### Edge Runtime Streaming

The chat API uses Vercel Edge Runtime for optimal performance:

```typescript
export const runtime = "edge"
```

### Real-time SSE

Server-Sent Events provide instant streaming responses with proper error handling:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of streamOpenRouterResponse(response)) {
        // Stream chunks to client
      }
      // Save to database with error handling
    } catch (error) {
      controller.error(error)
    }
  }
})
```

### Custom Bot Creation

Users can create personalized AI assistants with:

- Custom names and avatars
- System prompts for personality
- Model selection from available providers
- Temperature control (0-2)
- Token limits (100-32000)

### Bot Management

- View detailed bot profiles with statistics
- Edit custom bot configurations
- Delete custom bots with confirmation
- Copy system prompts easily
- View chat history per bot

### Environment Validation

Built-in validation ensures all required environment variables are present:

```typescript
import { validateEnv } from './lib/env'
validateEnv() // Validates on startup
```

## 🔐 Security Features

- Secure authentication with NextAuth.js
- Environment variable validation
- Proper error handling in streaming
- User-specific data isolation
- Safe database operations with cascading deletes
- Input validation on all API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check environment variables are properly set
2. Ensure database connection is working
3. Verify OpenRouter API key is valid
4. Search existing [GitHub issues](../../issues)
5. Create a new issue with detailed information

---

Built with ❤️ for the AI community
