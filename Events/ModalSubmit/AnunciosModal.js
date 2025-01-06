const { Events } = require('discord.js');
const anunciosOrg = require('../../Models/anunciosOrg');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'anunciosOrg',
    once: false,
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        const { customId, member } = interaction;
        if (!interaction.isModalSubmit()) return;

        if (customId === 'anunciosModal') {
            try {
                // Diferimos la respuesta inmediatamente para evitar el timeout
                await interaction.deferReply({ ephemeral: true });

                const data = await anunciosOrg.find({ guildId: interaction.guild.id });

                if (data.length > 0) {
                    const anuncioDesc = interaction.fields.getTextInputValue('anunciosTextInput');
                    let successCount = 0;
                    let errorCount = 0;

                    for (const anuncio of data) {
                        try {
                            const anuncioChannel = member.guild.channels.cache.get(anuncio.canalAnuncios);
                            if (anuncioChannel) {
                                await anuncioChannel.send(anuncioDesc);
                                successCount++;
                            } else {
                                errorCount++;
                                console.error(`Canal no encontrado: ${anuncio.canalAnuncios}`);
                            }
                        } catch (channelError) {
                            errorCount++;
                            console.error(`Error al enviar al canal ${anuncio.canalAnuncios}:`, channelError);
                        }
                    }

                    // Usamos editReply ya que la interacción fue diferida
                    await interaction.editReply({ 
                        content: `Anuncio enviado correctamente a ${successCount} organización(es)${
                            errorCount > 0 ? `. No se pudo enviar a ${errorCount} canal(es)` : ''
                        }` 
                    });
                } else {
                    await interaction.editReply({ 
                        content: 'No hay canales registrados para anuncios 😒'
                    });
                }
            } catch (error) {
                console.error('Error al enviar mensaje de anuncio:', error);
                
                try {
                    if (interaction.deferred) {
                        await interaction.editReply({ 
                            content: 'Ocurrió un error al enviar el anuncio.'
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'Ocurrió un error al enviar el anuncio.', 
                            ephemeral: true 
                        });
                    }
                } catch (replyError) {
                    console.error('Error al responder a la interacción:', replyError);
                }
            }
        }
    }
};