export async function showDeletedMessage(interaction) {
	const DeletedMessages = interaction.client.sequelize.model('deleted_messages');
	const deletedMessage = await DeletedMessages.findOne({ where: { messageId: interaction.customId.replace('show-deleted-message-', '') } });
	if (deletedMessage?.messageContent) {
		await interaction.reply({ content: deletedMessage.messageContent, files: deletedMessage.attachments, ephemeral: true, allowedMentions: { parse: [] } });
	} else {
		await interaction.reply({ content: 'Failed to find the message', ephemeral: true });
	}
}
