import { Client } from "discord.js"
import dotenv from "dotenv"
import { PrismaClient, Guild, User, UserGuild } from "@prisma/client"
import { execute } from "./commands"
import { CountingStrategyProvider, ICountingStrategy } from "./modes/CountingStrategyProvider"

dotenv.config()

const prisma = new PrismaClient()

const client: Client<true> = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

// Handle counting
client.on("messageCreate", async message => {
  if (message.author.bot) return

  // TODO: Confirm the message is in the correct channel
  // TODO: Fetch below values from database (?)
  const guild = {} as unknown as Guild
  const user = {} as unknown as User
  const userGuild = {} as unknown as UserGuild

  let strategy: ICountingStrategy
  try {
    strategy = CountingStrategyProvider.getStrategy(guild.mode)
  } catch (error) {
    console.error(error)
    return
  }

  await strategy.count(message, guild, user, userGuild)
})

// Handle slash commands
client.on("interactionCreate", async interaction => {
  if (interaction.user.bot) return
  if (interaction.isChatInputCommand()) await execute(prisma, interaction)
})

// Login bot
client.once("ready", () => console.log(`Logged in as ${client.user.username}`))
client.login(process.env.TOKEN)
