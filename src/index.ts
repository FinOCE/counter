import { Client } from "discord.js"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { execute } from "./commands"
import { count, isMode } from "./utils/count"

dotenv.config()

const prisma = new PrismaClient()

const client: Client<true> = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

// Handle counting
client.on("messageCreate", async message => {
  if (message.author.bot || message.channel.isDMBased()) return

  // Fetch db data about the user and guild
  const guild = await prisma.guild.findFirst({
    where: { id: message.guildId! },
    include: { users: { where: { userId: message.author.id }, include: { user: true } } }
  })
  if (!guild) return

  const userGuild = guild.users[0]
  const user = userGuild.user

  // TODO: Cache mode to avoid fetching on every message

  // Parse message content using guild's mode
  if (!isMode(guild.mode)) return
  const parsed = count(guild.mode, message.content)
  if (parsed === null) return

  // Update db stats
  if (guild.count + 1 === parsed) {
    await prisma.guild.update({
      where: { id: message.guildId! },
      data: {
        count: { increment: 1 },
        lastCountDate: new Date(),
        currentStartDate: parsed === 1 ? new Date() : guild.currentStartDate,
        totalCount: { increment: 1 },
        highScore: guild.count >= (guild.highScore ?? 0) ? { set: guild.count + 1 } : undefined,
        highScoreDate: guild.count >= (guild.highScore ?? 0) ? new Date() : guild.highScoreDate,
        users: {
          update: {
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId! } },
            data: {
              totalCount: { increment: 1 },
              lastCountDate: new Date(),
              highScore: guild.count >= (userGuild.highScore ?? 0) ? { set: guild.count + 1 } : undefined,
              highScoreDate: guild.count >= (userGuild.highScore ?? 0) ? new Date() : userGuild.highScoreDate,
              user: {
                update: {
                  where: { id: user.id },
                  data: {
                    totalCount: { increment: 1 },
                    lastCountDate: new Date(),
                    highScore: guild.count >= (user.highScore ?? 0) ? { set: guild.count + 1 } : undefined,
                    highScoreDate: guild.count >= (user.highScore ?? 0) ? new Date() : user.highScoreDate
                  }
                }
              }
            }
          }
        }
      }
    })

    // TODO: Send message
  } else if (user.lives >= 1) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lives: { decrement: 1 }
      }
    })

    // TODO: Send message
  } else if (guild.lives >= 1) {
    await prisma.guild.update({
      where: { id: message.guildId! },
      data: {
        lives: { decrement: 1 }
      }
    })

    // TODO: Send message
  } else {
    await prisma.guild.update({
      where: { id: message.guildId! },
      data: {
        count: 0,
        lastCountDate: new Date(),
        currentStartDate: null,
        totalFails: { increment: 1 },
        users: {
          update: {
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId! } },
            data: {
              totalFails: { increment: 1 },
              lastCountDate: new Date(),
              user: {
                update: {
                  where: { id: user.id },
                  data: {
                    totalFails: { increment: 1 },
                    lastCountDate: new Date()
                  }
                }
              }
            }
          }
        }
      }
    })

    // TODO: Send message
    // TODO: Add can't count role
  }
})

// Handle slash commands
client.on("interactionCreate", async interaction => {
  if (interaction.user.bot) return
  if (interaction.isChatInputCommand()) await execute(prisma, interaction)
})

// Login bot
client.once("ready", () => console.log(`Logged in as ${client.user.username}`))
client.login(process.env.TOKEN)
