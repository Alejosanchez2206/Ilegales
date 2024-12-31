const { Events } = require('discord.js');
const misionOrg = require('../../Models/misionesOrg');


module.exports = {
    name: Events.InteractionCreate,
    customId: 'misionesOrg',
    once: false,

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { customId, member } = interaction;
        if (!interaction.isModalSubmit()) return;
        if (customId === 'misiones-modal') {
            try {
                const data = await misionOrg.find({ guildId: interaction.guild.id });

                if (data.length > 0) {
                    const misionesDesc = interaction.fields.getTextInputValue('misiones-input');
                    for (const mision of data) {
                        const anuncioChannel = interaction.guild.channels.cache.get(mision.canalAnuncios);
                        await anuncioChannel.send(misionesDesc);
                    }

                    await interaction.reply({ content: 'Misiones enviadas con éxito', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No hay misiones configuradas', ephemeral: true });
                }
            } catch (e) {
                console.error('Error al enviar mensaje de anuncio:', error);
                // Asegúrate de manejar el error correctamente
                if (error.code === 'InteractionAlreadyReplied') {
                    console.error('La respuesta a esta interacción ya se ha enviado o diferido.');
                } else if (!interaction.replied) {
                    await interaction.reply({ content: 'Ocurrió un error al enviar el anuncio.', ephemeral: true });
                }
            }
        }
    }
}