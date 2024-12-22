const { Events } = require('discord.js');

const anunciosOrg = require('../../Models/anunciosOrg');


module.exports = {
    name: Events.InteractionCreate,
    once: false,
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction) {
        try {
            const { customId, member } = interaction;
            if (!interaction.isModalSubmit()) return;

            if (customId == 'anunciosModal') {
                const data = await anunciosOrg.find({ guildId: interaction.guild.id });

                if (data.length > 0) {
                    const anuncioDesc = interaction.fields.getTextInputValue('anunciosTextInput');
                    for (const anuncio of data) {
                        const anuncioChannel = member.guild.channels.cache.get(anuncio.canalAnuncios);
                        await anuncioChannel.send(anuncioDesc);
                    }
                    await interaction.reply({ content: 'Anuncio enviado correctamente a todas las org', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No hay canales registrados para anuncios 😒', ephemeral: true });
                }
            }
        } catch (error) {
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