import { ApplicationCommandType, ApplicationCommandOptionType, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder } from 'discord.js';
import ms from 'ms';

import { createReminder } from '../utilities/reminders.js';

const textInput = new TextInputBuilder({ customId: 'reminder', label: 'Reminder', style: TextInputStyle.Paragraph, required: true });
const row = new ActionRowBuilder({ components: [textInput] });
const modal = new ModalBuilder({ customId: 'reminder-modal', title: 'Write the reminder', components: [row] });

const MS_IN_ONE_MONTH = 2592000000;

export const command = {
	data: {
		name: 'remindme',
		description: 'Sets a reminder',
		type: ApplicationCommandType.ChatInput,
		options: [
			{ type: ApplicationCommandOptionType.String, name: 'time', description: 'How much time you will be reminded in', required: true },
			{ type: ApplicationCommandOptionType.String, name: 'message', description: 'The message to remind' }
		]
	},
	async execute(interaction) {
		const time = ms(interaction.options.getString('time'));
		let msg = interaction.options.getString('message');

		if (!time || time > MS_IN_ONE_MONTH) return interaction.reply({ content: 'Invalid time', ephemeral: true });

		if (!msg) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId == 'reminder-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			msg = modalInteraction.fields.getTextInputValue('reminder');
			interaction = modalInteraction;
		}

		await createReminder(interaction.member, interaction.channel, msg, time);

		await interaction.reply(`Reminder set for ${ms(time, { long: true })} from now`);
	}
};
