export const command = {
	data: {
		name: 'deleteemojiservers',
		description: 'Deletes the emoji servers',
		defaultPermission: false
	},
	async execute(interaction) {
		const guilds = interaction.client.guilds.cache.filter(guild => guild.name == 'Mech Emoji Server');
		guilds.forEach(guild => guild.delete());
	}
};
