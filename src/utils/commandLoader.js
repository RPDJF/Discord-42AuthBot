const fs = require("node:fs");
const path = require("node:path");
const { Collection, Client, REST, Routes } = require("discord.js");

module.exports = {
	/**
	 * 
	 * @param {Client} client 
	 */
	loadCommands(client) {
		client.commands = new Collection();
		const foldersPath = path.join(__dirname, "..", "commands");
		const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith(".js"));
		for (const file of commandFiles) {
			const filePath = path.join(foldersPath, file);
			const command = require(filePath);
			if ("data" in command && "execute" in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	},
	/**
	 * 
	 * @param {Client} client 
	 */
	uploadCommands(client) {
		console.log(client.token);
		const rest = new REST().setToken(client.token);

		(async () => {
			try {
				console.log(`Started refreshing ${client.commands.size} application (/) commands.`);
				const data = await rest.put(
					Routes.applicationCommands(client.user.id),
					{ body: client.commands.map(command => command.data.toJSON()) },
				)
				console.log(`Successfully reloaded ${data.length} application (/) commands.`);
			} catch (error) {
				console.error(error);
			}
		})();
	}
}