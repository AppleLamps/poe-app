"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, 
  Bot, 
  MessageSquare, 
  Settings, 
  Trash2,
  User,
  Copy,
  Check
} from "lucide-react"

interface Bot {
  id: string
  name: string
  avatarUrl?: string
  systemPrompt: string
  modelName: string
  temperature: number
  maxTokens: number
  ownerId?: string
  createdAt: string
  _count?: {
    chats: number
  }
}

interface Chat {
  id: string
  createdAt: string
  messages: Array<{ content: string; role: string }>
}

export default function BotProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string
  
  const [bot, setBot] = useState<Bot | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchBot()
    fetchChats()
  }, [botId])

  const fetchBot = async () => {
    try {
      const response = await fetch(`/api/bots?id=${botId}`)
      if (response.ok) {
        const data = await response.json()
        setBot(data)
      }
    } catch (error) {
      console.error("Failed to fetch bot:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chats?botId=${botId}`)
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    }
  }

  const deleteBot = async () => {
    if (!bot || bot.ownerId !== session?.user?.id) return
    
    if (!confirm(`Are you sure you want to delete "${bot.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/bots?id=${botId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/")
      } else {
        console.error("Failed to delete bot")
      }
    } catch (error) {
      console.error("Error deleting bot:", error)
    }
  }

  const copySystemPrompt = async () => {
    if (!bot) return
    
    try {
      await navigator.clipboard.writeText(bot.systemPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const startNewChat = () => {
    router.push(`/?bot=${botId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p>Loading bot profile...</p>
        </div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Bot Not Found</CardTitle>
            <CardDescription>
              The bot you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go Back Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = bot.ownerId === session?.user?.id
  const modelDisplayName = bot.modelName.split("/").pop()?.replace(/-/g, " ") || bot.modelName

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Bot Profile</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={startNewChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
              
              {isOwner && (
                <>
                  <Link href={`/create-bot?edit=${botId}`}>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={deleteBot}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bot Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={bot.avatarUrl || ""} />
                    <AvatarFallback>
                      <Bot className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{bot.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {modelDisplayName}
                      </Badge>
                      {isOwner && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">System Prompt</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{bot.systemPrompt}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={copySystemPrompt}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature</span>
                      <span>{bot.temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Tokens</span>
                      <span>{bot.maxTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(bot.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Chats</span>
                      <span>{chats.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner</span>
                      <span>{isOwner ? "You" : "System"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Chats */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Chats</CardTitle>
                <CardDescription>
                  Your conversation history with {bot.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first conversation with {bot.name}
                    </p>
                    <Button onClick={startNewChat}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {chats.map((chat) => (
                        <Link
                          key={chat.id}
                          href={`/?bot=${botId}&chat=${chat.id}`}
                          className="block"
                        >
                          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(chat.createdAt).toLocaleDateString()} •{" "}
                                      {new Date(chat.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  
                                  {chat.messages.length > 0 && (
                                    <div className="space-y-2">
                                      {chat.messages.slice(0, 2).map((message, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                          {message.role === "user" ? (
                                            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                          ) : (
                                            <Bot className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                          )}
                                          <p className="text-sm line-clamp-2">
                                            {message.content}
                                          </p>
                                        </div>
                                      ))}
                                      {chat.messages.length > 2 && (
                                        <p className="text-xs text-muted-foreground ml-6">
                                          +{chat.messages.length - 2} more messages
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
