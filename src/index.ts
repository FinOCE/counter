import { Client, EmbedBuilder } from "discord.js"
import dotenv from "dotenv"
import { Guild, PrismaClient } from "@prisma/client"
import { execute } from "./commands"
import { count, isMode } from "./utils/count"
import { getGuildCache } from "./cache/GuildCache"

// Setup clients and caches
dotenv.config()

const prisma = new PrismaClient()
const client: Client<true> = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

const guildCache = getGuildCache()

// Handle counting
client.on("messageCreate", async message => {
  if (message.author.bot || message.channel.isDMBased()) return

  // Check channelId with cache then fetch full data
  let cachedGuild = await guildCache.get(message.guildId!)
  let fetchedGuild: Guild | null = null

  if (cachedGuild) {
    if (!cachedGuild.channelId) return
  } else {
    const res = await prisma.guild.findFirst({ where: { id: message.guildId! } })
    if (!res || !res.channelId) return

    fetchedGuild = res
    await guildCache.set(message.guildId!, {
      channelId: fetchedGuild.channelId,
      roleId: fetchedGuild.roleId,
      mode: fetchedGuild.mode
    })
    cachedGuild = await guildCache.get(message.guildId!)
  }

  // Parse message content using guild's mode
  if (!isMode(cachedGuild!.mode)) return
  const parsed = count(cachedGuild!.mode, message.content)
  if (parsed === null) return

  // Fetch all relevant data from db
  const guild = fetchedGuild ?? (await prisma.guild.findFirst({ where: { id: message.guildId! } }))
  if (!guild) return

  const user =
    (await prisma.user.findFirst({ where: { id: message.author.id } })) ??
    (await prisma.user.create({ data: { id: message.author.id } }))
  const userGuild =
    (await prisma.userGuild.findFirst({ where: { userId: message.author.id, guildId: message.guildId! } })) ??
    (await prisma.userGuild.create({ data: { guildId: message.guildId!, userId: message.author.id } }))

  // TODO: Only make these fetches/creates when necessary or periodically (will massively speed up the bot)

  // Update db stats
  if (guild.count + 1 === parsed) {
    // Correctly counted
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

    await message.react("✅").catch(console.error)
  } else if (user.lives >= 1) {
    // Incorrectly counted, using user life
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lives: { decrement: 1 }
      }
    })

    await message.react("⚠️").catch(console.error)

    const embed = new EmbedBuilder().setDescription(
      `Wrong number, you used a life! You now have ${user.lives - 1} lives left.`
    ) // TODO: Add link to vote to get more lives
    message.reply({ embeds: [embed] }).catch(console.error)
  } else if (guild.lives >= 1) {
    // Incorrectly counted, using guild life
    await prisma.guild.update({
      where: { id: message.guildId! },
      data: {
        lives: { decrement: 1 }
      }
    })

    await message.react("⚠️").catch(console.error)
    if (guild.roleId) await message.member!.roles.add(guild.roleId).catch(console.error)

    const embed = new EmbedBuilder().setDescription(
      `Wrong number, but the server count has been saved by a server life! You now have ${
        guild.lives - 1
      } server lives left.`
    ) // TODO: Add link to vote to get more lives
    message.reply({ embeds: [embed] }).catch(console.error)
  } else {
    // Incorrectly counted, no lives left
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

    await message.react("❌").catch(console.error)
    if (guild.roleId) await message.member!.roles.add(guild.roleId).catch(console.error)

    const embed = new EmbedBuilder().setDescription(
      `Count ruined at **${guild.count}**! You must now restart the count. Good luck!`
    ) // TODO: Add link to vote to get more lives
    message.reply({ embeds: [embed] }).catch(console.error)
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
