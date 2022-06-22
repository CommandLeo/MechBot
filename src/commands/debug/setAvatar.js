import { client } from '../../index.js';

export const command = {
	data: {
		name: 'setavatar',
		description: 'Sets the avatar'
	},
	async execute(interaction) {
		await client.user.setAvatar('https://cdn.discordapp.com/attachments/700017974500786216/982020388634632192/Mechanists_Logo_2.png');
		await interaction.reply('Avatar set');
	}
};
