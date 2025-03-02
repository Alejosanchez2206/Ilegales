const { Schema, model } = require('mongoose');

const logsPuntos = new Schema({
    guildId: {
        type: String,
        required: true
    },
    point: {
        type: Number,
        required: true
    },
    orgAddPoints: {
        type: String,
        required: true
    },
    userAddpoints: {
        type: String,
        required: true
    },
    motiveAddpoints: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
    versionKey: false

})

module.exports = model('logsPuntos', logsPuntos);