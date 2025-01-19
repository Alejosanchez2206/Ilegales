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
        .setName('anunciar-org')
        .setDescription('Mensaje de anuncio para la organización')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction) {
        try {
            const anunciosModal = new ModalBuilder()
                .setCustomId('anunciosModal')
                .setTitle('Mensaje de anuncio')

            const anunciosTextInput = new TextInputBuilder()
                .setCustomId('anunciosTextInput')
                .setLabel('Escribe tu anuncio')
                .setStyle(TextInputStyle.Paragraph)

            const componentModal = new ActionRowBuilder().addComponents(anunciosTextInput)

            anunciosModal.addComponents(componentModal)

            await interaction.showModal(anunciosModal)
        } catch (error) {
            console.error('Error al enviar mensaje de anuncio:', error);
        }
    }
};