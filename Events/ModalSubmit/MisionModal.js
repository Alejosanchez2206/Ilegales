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
                // Diferimos la respuesta inmediatamente para evitar el timeout
                await interaction.deferReply({ ephemeral: true });

                const data = await misionOrg.find({ guildId: interaction.guild.id });

                if (data.length > 0) {
                    const misionesDesc = interaction.fields.getTextInputValue('misiones-input');
                    let successCount = 0;
                    let errorCount = 0;

                    for (const mision of data) {
                        try {
                            const anuncioChannel = interaction.guild.channels.cache.get(mision.canalAnuncios);
                            if (anuncioChannel) {
                                await anuncioChannel.send(misionesDesc);
                                successCount++;
                            } else {
                                errorCount++;
                                console.error(`Canal no encontrado: ${mision.canalAnuncios}`);
                            }
                        } catch (channelError) {
                            errorCount++;
                            console.error(`Error al enviar al canal ${mision.canalAnuncios}:`, channelError);
                        }
                    }

                    // Usamos editReply ya que la interacción fue diferida
                    await interaction.editReply({ 
                        content: `Misiones enviadas con éxito a ${successCount} canal(es)${
                            errorCount > 0 ? `. No se pudo enviar a ${errorCount} canal(es)` : ''
                        }` 
                    });
                } else {
                    await interaction.editReply({ 
                        content: 'No hay misiones configuradas'
                    });
                }
            } catch (error) {
                console.error('Error al enviar mensaje de misiones:', error);
                
                try {
                    if (interaction.deferred) {
                        await interaction.editReply({ 
                            content: 'Ocurrió un error al enviar las misiones'
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'Ocurrió un error al enviar las misiones', 
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