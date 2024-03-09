import { Guild } from "@prisma/client"
import { ICache } from "./ICache"
import { MemoryCache } from "./MemoryCache"

type CachedGuild = Pick<Guild, "channelId" | "roleId" | "mode">
const guildCache: ICache<CachedGuild> = new MemoryCache<CachedGuild>(1000 * 60 * 60)

setInterval(async () => {
  const count = await guildCache.clear()
  console.log(`Cleared ${count} guilds from the guild cache`)
}, 1000 * 60 * 10)

export function getGuildCache() {
  return guildCache
}
