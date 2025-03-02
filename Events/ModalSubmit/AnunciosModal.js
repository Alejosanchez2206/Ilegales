const { Events, ChannelType } = require('discord.js');
const anunciosOrg = require('../../Models/anunciosOrg');

// Función para dividir mensajes largos
const splitMessage = (text, maxLength = 1900) => {
    const chunks = [];
    while (text.length > 0) {
        let chunk = text.slice(0, maxLength);
        const lineBreak = chunk.lastIndexOf('\n');
        const space = chunk.lastIndexOf(' ');
        
        const splitIndex = lineBreak > 0 ? lineBreak : space > 0 ? space : maxLength;
        chunk = chunk.slice(0, splitIndex).trim();
        chunks.push(chunk);
        text = text.slice(splitIndex).trim();
    }
    return chunks;
};

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'anunciosModal') return;

        try {
            await interaction.deferReply({ ephemeral: true });
            
            const anuncioDesc = interaction.fields.getTextInputValue('anunciosTextInput').trim();
            if (!anuncioDesc) {
                return await interaction.editReply({ 
                    content: '❌ El anuncio no puede estar vacío' 
                });
            }

            const data = await anunciosOrg.find({ guildId: interaction.guild.id }).lean();
            if (!data.length) {
                return await interaction.editReply({ 
                    content: 'ℹ️ No hay canales configurados para anuncios' 
                });
            }

            let successCount = 0;
            let errorCount = 0;
            const messageParts = splitMessage(anuncioDesc);

            // Procesar cada canal configurado
            for (const { canalAnuncios } of data) {
                try {
                    const channel = interaction.guild.channels.cache.get(canalAnuncios);
                    
                    // Validar el canal
                    if (!channel?.isTextBased() || channel.type !== ChannelType.GuildText) {
                        errorCount++;
                        console.error(`Canal inválido: ${canalAnuncios}`);
                        continue;
                    }

                    // Verificar permisos del bot
                    if (!channel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
                        errorCount++;
                        console.error(`Sin permisos en: ${canalAnuncios}`);
                        continue;
                    }

                    // Enviar cada parte del mensaje
                    for (const part of messageParts) {
                        await channel.send(part);
                    }
                    
                    successCount++;
                } catch (error) {
                    errorCount++;
                    console.error(`Error en canal ${canalAnuncios}:`, error);
                }
            }

            // Construir respuesta final
            const response = [
                `📢 Anuncio enviado a ${successCount} organización(es)`,
                errorCount > 0 ? `❌ Fallos en ${errorCount} canal(es)` : ''
            ].filter(Boolean).join('\n');

            await interaction.editReply({ content: response });

        } catch (error) {
            console.error('Error general:', error);
            await interaction.editReply({ 
                content: '⚠️ Error crítico al procesar el anuncio' 
            }).catch(() => {});
        }
    }
};