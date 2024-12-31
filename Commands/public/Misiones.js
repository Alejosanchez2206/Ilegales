const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits
} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('misiones-org')
        .setDescription('Misiones de la organización')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction) {
        try {
            const misionsModal = new ModalBuilder()
                .setCustomId('misiones-modal')
                .setTitle('Misiones de la organización')

            const misionsInput = new TextInputBuilder()
                .setCustomId('misiones-input')
                .setLabel('Misiones de la organización')
                .setStyle(TextInputStyle.Paragraph)

            const componentModalMision = new ActionRowBuilder().addComponents(misionsInput)
            misionsModal.addComponents(componentModalMision)
            await interaction.showModal(misionsModal)

        } catch (e) {
            console.log('Error al enviar las misiones a la organizaciones', e);

        }
    }
}