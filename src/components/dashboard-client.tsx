"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

interface BotItem {
  id: string
  name: string
  avatarUrl?: string | null
  modelName: string
  ownerId?: string | null
}

interface ChatItem {
  id: string
  botId: string
  bot: BotItem
  messages: Array<{ content: string; role: string }>
  createdAt: Date | string
}

interface DashboardClientProps {
  bots: BotItem[]
  chats: ChatItem[]
}

export function DashboardClient({ bots, chats }: DashboardClientProps) {
  const [selectedBot, setSelectedBot] = useState<string>()
  const [selectedChat, setSelectedChat] = useState<string>()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        bots={bots}
        chats={chats}
        selectedBot={selectedBot}
        selectedChat={selectedChat}
        onBotSelect={setSelectedBot}
        onChatSelect={setSelectedChat}
      />
      <div className="flex-1 lg:ml-0">
        {selectedBot ? (
          <ChatInterface botId={selectedBot} chatId={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to OpenChatHub</h2>
              <p className="text-muted-foreground">
                Select a model from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

