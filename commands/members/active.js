export const command = {
	data: {
		name: 'active',
		description: 'Makes you active'
	},
	async execute(interaction) {
		const roleManager = interaction.member.roles;
		const PONG_ROLE = interaction.client.ROLES.PONG;
		const TOOM_ROLE = interaction.client.ROLES.TOOM;
		if (roleManager.cache.has(TOOM_ROLE.id)) {
			await roleManager.remove(TOOM_ROLE);
			await roleManager.add(PONG_ROLE);
			await interaction.reply('Now active again');
		} else {
			await interaction.reply('You are already active');
		}
	}
};
