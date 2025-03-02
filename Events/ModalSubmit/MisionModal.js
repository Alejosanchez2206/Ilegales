const { Events, ChannelType } = require('discord.js');
const misionOrg = require('../../Models/misionesOrg');

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
        if (!interaction.isModalSubmit() || interaction.customId !== 'misiones-modal') return;        
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const misionesDesc = interaction.fields.getTextInputValue('misiones-input').trim();
            if (!misionesDesc) {
                return await interaction.editReply({ 
                    content: '❌ El mensaje no puede estar vacío' 
                });
            }

            const data = await misionOrg.find({ guildId: interaction.guild.id }).lean();
            if (!data.length) {
                return await interaction.editReply({ 
                    content: 'ℹ️ No hay canales configurados para enviar misiones' 
                });
            }

            let successCount = 0;
            let errorCount = 0;
            const messageParts = splitMessage(misionesDesc);

            // Procesar cada canal configurado
            for (const { canalAnuncios } of data) {
                try {
                    const channel = interaction.guild.channels.cache.get(canalAnuncios);
                    
                    if (!channel?.isTextBased() || channel.type !== ChannelType.GuildText) {
                        errorCount++;
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
                `✅ Mensajes enviados a ${successCount} canal(es)`,
                errorCount > 0 ? `❌ Fallos en ${errorCount} canal(es)` : ''
            ].filter(Boolean).join('\n');

            await interaction.editReply({ content: response });

        } catch (error) {
            console.error('Error general:', error);
            await interaction.editReply({ 
                content: '⚠️ Error al procesar la solicitud' 
            }).catch(() => {});
        }
    }
};