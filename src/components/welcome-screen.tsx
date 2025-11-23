"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, MessageSquare, Zap, Shield } from "lucide-react"

export function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bot className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            OpenChatHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chat with multiple AI models in one beautiful interface. 
            Access Gemini, GPT-5, Grok, and more through OpenRouter.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/api/auth/signin">
              <Button size="lg" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Chatting
              </Button>
            </Link>
            <Link href="/create-bot">
              <Button variant="outline" size="lg" className="gap-2">
                <Bot className="h-4 w-4" />
                Create Bot
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Multi-Model Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access the latest AI models including Gemini 3 Pro, GPT-5.1, and Grok 4.1 Fast
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>Custom Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build your own AI assistants with custom prompts, personalities, and settings
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your chats are encrypted and stored securely. Sign in with Google for instant access.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Available Models */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Available Models</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Google Gemini 3 Pro",
              "OpenAI GPT-5.1",
              "OpenAI GPT-5.1 Chat", 
              "xAI Grok 4.1 Fast"
            ].map((model) => (
              <div
                key={model}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
              >
                {model}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
