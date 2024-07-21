const { SlashCommandBuilder, Interaction } = require("discord.js");
const db = require("../utils/db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("login")
		.setDescription("Login into 42 network"),
	/**
	 * 
	 * @param {Interaction} interaction 
	 */
	async execute(interaction) {
		const state = `${interaction.user.id}_${Math.random().toString(36).substring(7)}`;

		const guildDoc = await db.getData("guilds", interaction.guild.id);
		if (!guildDoc.users) {
			guildDoc.users = [{
				id: interaction.user.id,
			}];
		}
		let userDoc = guildDoc.users.find(u => u.id === interaction.user.id);
		if (!userDoc) {
			userDoc = {
				id: interaction.user.id,
			};
			guildDoc.users.push(userDoc);
		}
		// If user is already logged in, delete the old state
		if (userDoc.state) {
			await db.deleteData("states", userDoc.state);
		}
		userDoc.state = state;
		// Write the data to the database in guilds collection
		await db.writeData("guilds", interaction.guild.id, guildDoc);
		// Get and write the state to the database in states collection
		const stateDoc = await db.getData("states", state);
		stateDoc.guild = interaction.guild.id;
		stateDoc.user = interaction.user.id;
		await db.writeData("states", state, stateDoc);

		interaction.reply({
			content: `Please click this link to login: [Login](https://api.intra.42.fr/oauth/authorize?client_id=${process.env.AUTH_UID}&redirect_uri=${process.env.AUTH_REDIRECT_URI}&response_type=code&state=${state})`,
			ephemeral: true,
		});
	},
}