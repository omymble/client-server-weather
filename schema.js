let mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

let Cities = mongoose.model('Cities', dbSchema);
module.exports = Cities;