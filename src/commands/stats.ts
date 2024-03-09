import { PrismaClient } from "@prisma/client"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const stats = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("See stats about a user or server")
    .setDMPermission(false)
    .setNSFW(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName("user")
        .setDescription("See stats about a user")
        .addUserOption(option => option.setName("user").setDescription("The user to see stats about"))
    )
    .addSubcommand(subcommand => subcommand.setName("server").setDescription("See stats about this server")),
  execute: async (prisma: PrismaClient, interaction: ChatInputCommandInteraction) => {}
}
