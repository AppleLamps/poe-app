"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  User, 
  Bot, 
  LogOut,
  Menu,
  X
} from "lucide-react"

interface BotItem {
  id: string
  name: string
  avatarUrl?: string
  modelName: string
  ownerId?: string
}

interface ChatItem {
  id: string
  botId: string
  bot: BotItem
  messages: Array<{ content: string; role: string }>
  createdAt: string
}

interface SidebarProps {
  selectedBot?: string
  selectedChat?: string
  onBotSelect: (botId: string) => void
  onChatSelect: (chatId: string) => void
}

export function Sidebar({ selectedBot, selectedChat, onBotSelect, onChatSelect }: SidebarProps) {
  const { data: session } = useSession()
  const [bots, setBots] = useState<BotItem[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    fetchBots()
    fetchChats()
  }, [])

  const fetchBots = async () => {
    try {
      const response = await fetch("/api/bots")
      if (response.ok) {
        const data = await response.json()
        setBots(data)
      }
    } catch (error) {
      console.error("Failed to fetch bots:", error)
    }
  }

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats")
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    }
  }

  const createNewChat = async (botId: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "", botId }),
      })
      if (response.ok) {
        fetchChats()
        onChatSelect("") // Will trigger new chat creation
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const defaultBots = bots.filter(bot => !bot.ownerId)
  const customBots = bots.filter(bot => bot.ownerId)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">OpenChatHub</h1>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {session ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback>
                    {session.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Default Bots */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Default Models
                </h3>
                <div className="space-y-2">
                  {defaultBots.map((bot) => (
                    <div key={bot.id}>
                      <Button
                        variant={selectedBot === bot.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onBotSelect(bot.id)
                          setIsMobileOpen(false)
                        }}
                      >
                        <Bot className="h-4 w-4 mr-3" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{bot.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {bot.modelName}
                          </div>
                        </div>
                      </Button>
                      
                      {/* Recent chats for this bot */}
                      {selectedBot === bot.id && (
                        <div className="ml-7 mt-1 space-y-1">
                          {chats
                            .filter(chat => chat.botId === bot.id)
                            .slice(0, 3)
                            .map((chat) => (
                              <Button
                                key={chat.id}
                                variant={selectedChat === chat.id ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => {
                                  onChatSelect(chat.id)
                                  setIsMobileOpen(false)
                                }}
                              >
                                <MessageSquare className="h-3 w-3 mr-2" />
                                <div className="truncate">
                                  {chat.messages[0]?.content.slice(0, 30) || "New chat"}...
                                </div>
                              </Button>
                            ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-muted-foreground"
                            onClick={() => createNewChat(bot.id)}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            New chat
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Bots */}
              {customBots.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    My Bots
                  </h3>
                  <div className="space-y-2">
                    {customBots.map((bot) => (
                      <Button
                        key={bot.id}
                        variant={selectedBot === bot.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onBotSelect(bot.id)
                          setIsMobileOpen(false)
                        }}
                      >
                        <Avatar className="h-6 w-6 mr-3">
                          <AvatarImage src={bot.avatarUrl || ""} />
                          <AvatarFallback className="text-xs">
                            {bot.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{bot.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {bot.modelName}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Link href="/create-bot" onClick={() => setIsMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bot
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setIsMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
