import {createNewApplicationForm, fetchApplicationResponses} from "../../utilities/googleapis.js";
import {client, config} from "../../index.js";
import {splitString, SplittingStrategies} from "../../utilities/split.js";
import {ApplicationCommandOptionType} from "discord.js";

export const command = {
    data: {
        name: 'application',
        description: 'Manage applications',
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'manual-retrieve',
                description: 'Manual trigger for retrieving applications form google forms.',
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'create',
                description: 'Creates a new form',
            }
        ]
    },
    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === 'manual-retrieve') {
            await interaction.deferReply({content: 'Retrieving applications...', ephemeral: true});
            await interaction.editReply({content: await retrieveAndAssembleApplications()});
            return;
        }
        if (subcommand === 'create') {
            await interaction.deferReply({content: 'Creating a new application'});
            await createNewApplicationForm(interaction);
            return;
        }
        // Otherwise it's a deny command
        const users = Array.from({length: 24}, (_, i) => interaction.options.getUser(`user-${i + 1}`)).filter(user => user?.bot == false);
        let reason = interaction.options.getString('reason');

        if (!users.length) return await interaction.reply({content: 'Invalid users!', ephemeral: true});

        const results = await Promise.allSettled(users.map(async user => await user.send(`Unfortunately your application for the Mechanists server hasn't been accepted${reason ? ':\n' + reason : ''}`)));

        await interaction.reply(`${results.filter(result => result.status === 'fulfilled').length}/${results.length} messages have been successfully sent`);
    }
};

async function retrieveAndAssembleApplications() {
    const responses = (await fetchApplicationResponses()).values;
    const headers = responses[0];
    const keyIndex = headers.indexOf(process.env.APPLICATION_KEY_TITLE);

    const guild = await client.guilds.fetch(config["guild-id"]);
    const channel = await guild.channels.fetch(config["applications-channel-id"]);

    for (const response of responses.slice(1)) {
        if (response.length === 0) continue;
        const message = await channel.send(response[keyIndex]);
        const thread = await channel.threads.create({
            name: `Application from ${response[keyIndex]}`,
            startMessage: message.id,
            autoArchiveDuration: "MAX",
            reason: "Automated application thread"
        })
        for (const header of headers) {
            const index = headers.indexOf(header);
            const splits = splitString(response[index], 2000, true, [SplittingStrategies.ON_WHITESPACE, SplittingStrategies.ANYWHERE]);
            await thread.send(`**${header.trim()}**\n=> ${splits[0]}`);
            for (const split of splits.slice(1)) {
                await thread.send(split);
            }
        }
    }

    return "a";
}
