const { Schema , model } = require('mongoose');

const anunciosOrg = new Schema({
    guildId : {
        type : String,
        required : true
    },
    canalAnuncios : {
        type : String,
        required : true
    },
    roleAnuncios : {
        type : String,
        required : true
    },
    nameAnuncios : {
        type : String,
        required : true
    }
})

module.exports = model('anunciosOrgs', anunciosOrg);
