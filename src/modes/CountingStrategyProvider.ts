import { Guild, User, UserGuild } from "@prisma/client"
import { Message } from "discord.js"

export class CountingStrategyProvider {
  public static getStrategy(strategy: string): ICountingStrategy {
    switch (strategy) {
      // TODO: Add strategies here (needs "default" strategy)
      default:
        throw new Error(`Strategy ${strategy} not found`)
    }
  }

  public static listStrategies(): ICountingStrategy[] {
    return [] // TODO: Add strategies here (needs "default" strategy)
  }
}

export interface ICountingStrategy {
  name: string
  value: string

  count(message: Message, guild: Guild, user: User, userGuild: UserGuild): Promise<void>
}
