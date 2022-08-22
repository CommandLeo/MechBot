import { SelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

import { client } from '../index.js';

export async function handlePollVote(interaction) {
	await interaction.deferReply({ ephemeral: true });
	const Polls = client.sequelize.model('polls');
	const poll = await Polls.findOne({ where: { pollId: interaction.customId.replace('poll-vote-', '') } });

	if (!poll) return await interaction.editReply('Poll not found');

	const vote = poll.votes[interaction.member.id];

	const selectMenu = new SelectMenuBuilder({
		custom_id: `poll-selectoption-${poll.pollId}`,
		placeholder: `Vote for '${poll.question.length > 135 ? `${poll.question.slice(0, 135)}...` : poll.question}'`,
		options: poll.options.map(option => ({ label: option, value: option, default: option == vote }))
	});
	const row = new ActionRowBuilder({ components: [selectMenu] });

	await interaction.editReply({ components: [row] });
}

export async function handlePollVoteReceived(interaction) {
	await interaction.deferReply({ ephemeral: true });
	const [vote] = interaction.values;
	const Polls = client.sequelize.model('polls');
	const poll = await Polls.findOne({ where: { pollId: interaction.customId.replace('poll-selectoption-', '') } });
	if (!poll) return await interaction.editReply('Poll not found');

	await poll.update({ votes: { ...poll.votes, [interaction.member.id]: vote } });
	await interaction.editReply('Your vote has been recorded');
}

export async function handlePollVoteRetracted(interaction) {
	await interaction.deferReply({ ephemeral: true });
	const Polls = client.sequelize.model('polls');
	const poll = await Polls.findOne({ where: { pollId: interaction.customId.replace('poll-retract-', '') } });

	if (!poll) return await interaction.editReply('Poll not found');

	const votes = { ...poll.votes };
	delete votes[interaction.member.id];
	await poll.update({ votes });
	await interaction.editReply('Vote removed');
}

export async function getPollResults(poll) {
	const { options, question, votes } = poll;

	const counts = Object.values(votes).reduce((acc, val) => ({ ...acc, [val]: (acc[val] || 0) + 1 }), {});
	const data = options.map(option => counts[option] || 0);

	const configuration = {
		type: 'bar',
		options: {
			indexAxis: 'y',
			scales: {
				y: {
					ticks: {
						font: {
							size: 32
						}
					}
				},
				x: {
					ticks: {
						precision: 0,
						font: {
							size: 20
						}
					}
				}
			},
			layout: {
				padding: 20
			},
			plugins: {
				title: {
					display: true,
					text: question.length > 60 ? `${question.slice(0, 60)}...` : question,
					font: {
						size: 50
					}
				},
				legend: {
					display: false
				}
			}
		},
		data: {
			labels: options,
			datasets: [
				{
					data,
					backgroundColor: options.join() == 'Yes,No' ? ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'] : 'rgba(54, 162, 235, 0.2)',
					borderColor: options.join() == 'Yes,No' ? ['rgba(75, 192, 192, 1)', 'rgba(255,99,132,1)'] : 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				}
			]
		}
	};
	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1000, height: 600, backgroundColour: 'white' });
	return await chartJSNodeCanvas.renderToBuffer(configuration);
}
