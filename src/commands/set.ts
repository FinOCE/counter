import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { CountingStrategyProvider } from "../modes/CountingStrategyProvider"

export const set = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Configure how Counter behaves in your server")
    .setDMPermission(false)
    .setNSFW(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("channel")
        .setDescription("Set the channel where Counter will count messages")
        .addChannelOption(option =>
          option.setName("channel").setDescription("The channel where Counter will count messages").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("role")
        .setDescription("Set the role to give users that mess up counting")
        .addRoleOption(option =>
          option.setName("role").setDescription("The role to give users that mess up counting").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("mode")
        .setDescription("Set the gamemode to play")
        .addStringOption(option =>
          option
            .setName("mode")
            .setDescription("The gamemode to play")
            .setRequired(true)
            .setChoices(...CountingStrategyProvider.listStrategies().map(({ name, value }) => ({ name, value })))
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {}
}
