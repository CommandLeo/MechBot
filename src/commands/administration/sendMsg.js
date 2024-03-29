import { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

const textInput = new TextInputBuilder({ customId: 'message', label: 'Message', style: TextInputStyle.Paragraph, required: true });
const row = new ActionRowBuilder({ components: [textInput] });
const modal = new ModalBuilder({ customId: 'message-modal', title: 'Write a message', components: [row] });

export const command = {
	data: {
		name: 'sendmsg',
		description: 'Sends a message in DMs',
		type: ApplicationCommandType.ChatInput,
		options: [
			{ type: ApplicationCommandOptionType.User, name: 'user', description: 'The user to whom the message will be sent', required: true },
			{ type: ApplicationCommandOptionType.String, name: 'message', description: 'The message to send' }
		]
	},
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		let msg = interaction.options.getString('message');

		if (user.bot) return interaction.reply({ content: "Can't send the message to a bot!", ephemeral: true });

		if (!msg) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId === 'message-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			msg = modalInteraction.fields.getTextInputValue('message');
			interaction = modalInteraction;
		}

		const message = await user.send(msg).catch(() => null);
		if (!message) return await interaction.reply('Failed to send the message');
		await interaction.reply({ content: 'Message sent', ephemeral: true });
	}
};
