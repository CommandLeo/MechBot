import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } from 'discord.js';

import { client } from '../index.js';
import { getPollResults } from '../utilities/polls.js';

const pollOptions = Array.from({ length: 20 }, (_, i) => ({
	type: ApplicationCommandOptionType.String,
	name: `option-${i + 1}`,
	description: `Option ${i + 1} for the poll`
}));

export const command = {
	data: {
		name: 'poll',
		description: 'Manages polls',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'create',
				description: 'Creates a poll',
				options: [
					{ type: ApplicationCommandOptionType.String, name: 'question', description: 'The question for the poll', required: true },
					...pollOptions,
					{ type: ApplicationCommandOptionType.Attachment, name: 'image', description: 'An image for the poll' }
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'end',
				description: 'Ends a poll',
				options: [{ type: ApplicationCommandOptionType.String, name: 'poll-id', description: 'The id of the poll', required: true }]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'results',
				description: 'Prints the results of a poll',
				options: [{ type: ApplicationCommandOptionType.String, name: 'poll-id', description: 'The id of the poll', required: true }]
			}
		]
	},
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'create') {
			const question = interaction.options.getString('question');
			const attachment = interaction.options.getAttachment('image');
			let options = [...new Set(Array.from({ length: 20 }, (_, i) => interaction.options.getString(`option-${i + 1}`)).filter(option => option))];
			if (options.length < 2) options = ['Yes', 'No'];

			const message = await interaction.deferReply({ fetchReply: true });
			const pollId = message.id;

			const embed = new EmbedBuilder({
				title: question.length > 256 ? `${question.slice(0, 253)}...` : question,
				description: options.map(option => `- ${option}`).join('\n'),
				footer: { text: `Poll Id: ${pollId}` },
				color: 0x3498db,
				timestamp: Date.now()
			});
			if (attachment?.contentType.startsWith('image/')) embed.setImage(attachment.url);

			const voteButton = new ButtonBuilder({
				customId: `poll-vote-${pollId}`,
				label: 'Vote',
				emoji: '🗳',
				style: ButtonStyle.Primary
			});
			const retractButton = new ButtonBuilder({
				customId: `poll-retract-${pollId}`,
				label: 'Retract',
				style: ButtonStyle.Danger
			});
			const row = new ActionRowBuilder({ components: [voteButton, retractButton] });

			await interaction.editReply({ embeds: [embed], components: [row] });

			const Polls = client.sequelize.model('polls');
			await Polls.create({ pollId, channelId: message.channel.id, question, options, votes: {} });
		} else if (subCommand === 'end') {
			await interaction.deferReply({ ephemeral: true });

			const pollId = interaction.options.getString('poll-id');

			const Polls = client.sequelize.model('polls');
			const poll = await Polls.findOne({ where: { pollId } });
			if (!poll) return await interaction.editReply('Poll not found');

			const channelId = poll.channelId;
			const channel = await client.GUILD.channels.fetch(channelId);
			const message = await channel?.messages.fetch(pollId);

			if (!message) return await interaction.editReply('Failed to find the message of the poll');

			const buffer = await getPollResults(poll);
			const image = new AttachmentBuilder(buffer, { name: 'poll-results.png' });
			const resultsEmbed = new EmbedBuilder({
				color: 0x3498db,
				title: 'Poll Results',
				image: { url: 'attachment://poll-results.png' }
			});

			await message.edit({ components: [], files: [image], embeds: [message.embeds[0], resultsEmbed] });
			await interaction.editReply('Poll ended');
		} else if (subCommand === 'results') {
			await interaction.deferReply();

			const pollId = interaction.options.getString('poll-id');

			const Polls = client.sequelize.model('polls');
			const poll = await Polls.findOne({ where: { pollId } });
			if (!poll) return await interaction.editReply('Poll not found');

			const buffer = await getPollResults(poll);
			await interaction.editReply({ files: [buffer] });
		}
	}
};
