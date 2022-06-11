import { logMessageDeleted, logMemePrisoner } from '../../loggers.js';
import { giveTempRole } from '../../utilities.js';

export const command = {
	data: {
		name: 'Delete Message',
		type: 'MESSAGE'
	},
	async execute(interaction) {
		const message = await interaction.channel.messages.fetch(interaction.targetId);
		await message.delete().catch(() => console.error(`Failed to context-menu delete a message in #${message.channel.name}`));

		const DeletedMessages = interaction.client.sequelize.model('deleted_messages');
		DeletedMessages.create({ messageId: message.id, messageContent: message.content, attachments: message.attachments.map(attachment => attachment.url) });

		logMessageDeleted(message, interaction.member);
		await interaction.reply({ content: 'Message deleted', ephemeral: true });

		const MEME_CHANNEL = interaction.client.CHANNELS.MEMES;
		const MEME_PRISONER_ROLE = interaction.client.ROLES.MEME_PRISONER;

		if (interaction.channel.id == MEME_CHANNEL.id) {
			await giveTempRole(message.member, MEME_PRISONER_ROLE, 1000 * 60 * 60 * 24, 'Inappropriate behaviour in #memes');
			logMemePrisoner(message.member);
		}
	}
};
