import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBotsForUser, getChatsForUser } from "@/lib/data"
import { DashboardClient } from "@/components/dashboard-client"
import { WelcomeScreen } from "@/components/welcome-screen"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <WelcomeScreen />
  }

  // Fetch data server-side
  const [bots, chats] = await Promise.all([
    getBotsForUser(),
    getChatsForUser(),
  ])

  return <DashboardClient bots={bots} chats={chats} />
}
