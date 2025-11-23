"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Bot, Save } from "lucide-react"

const AVAILABLE_MODELS = [
  { id: "google/gemini-3-pro", name: "Google Gemini 3 Pro" },
  { id: "openai/gpt-5.1", name: "OpenAI GPT-5.1" },
  { id: "openai/gpt-5.1-chat", name: "OpenAI GPT-5.1 Chat" },
  { id: "xai/grok-4.1-fast", name: "xAI Grok 4.1 Fast" },
]

export default function CreateBotPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    avatarUrl: "",
    systemPrompt: "",
    modelName: "",
    temperature: 0.7,
    maxTokens: 4096,
  })

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to create custom bots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/api/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.systemPrompt || !formData.modelName) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const bot = await response.json()
        router.push("/")
      } else {
        console.error("Failed to create bot")
      }
    } catch (error) {
      console.error("Error creating bot:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create Custom Bot</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
              <CardDescription>
                Design your own AI assistant with custom personality and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Bot Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Code Assistant, Creative Writer"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
                    <Input
                      id="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <Label htmlFor="modelName">AI Model *</Label>
                  <Select
                    value={formData.modelName}
                    onValueChange={(value) => handleInputChange("modelName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* System Prompt */}
                <div>
                  <Label htmlFor="systemPrompt">System Prompt *</Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
                    placeholder="You are a helpful AI assistant. You should be friendly, professional, and provide detailed answers."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    This defines your bot's personality, behavior, and capabilities.
                  </p>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Advanced Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">
                        Temperature: {formData.temperature}
                      </Label>
                      <input
                        type="range"
                        id="temperature"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => handleInputChange("temperature", parseFloat(e.target.value))}
                        className="w-full mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Controls randomness (0 = focused, 2 = creative)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="100"
                        max="32000"
                        value={formData.maxTokens}
                        onChange={(e) => handleInputChange("maxTokens", parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum response length
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.systemPrompt || !formData.modelName}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Bot"}
                  </Button>
                  <Link href="/">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
