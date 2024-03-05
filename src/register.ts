import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import { register } from "./commands"

dotenv.config()

const rest = new REST().setToken(process.env.TOKEN)

// Register commands
rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), { body: register() })
  .then(() => console.log("Successfully registered commands"))
