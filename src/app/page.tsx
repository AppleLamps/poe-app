"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { WelcomeScreen } from "@/components/welcome-screen"

export default function Home() {
  const { data: session } = useSession()
  const [selectedBot, setSelectedBot] = useState<string>()
  const [selectedChat, setSelectedChat] = useState<string>()

  if (!session) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
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
