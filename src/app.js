require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;

const { loadCommands, uploadCommands } = require("./utils/commandLoader");

const client = new Client({ intents: GatewayIntentBits.Guilds });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	uploadCommands(readyClient);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was ound.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
		} else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
})

loadCommands(client);

client.login(token);