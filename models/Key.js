const mongoose = require('mongoose');
 
const options = {
    id: false,
    collection: 'authentication',
    timestamps: true,
    toObject: { getters: true },
    versionKey: false,
};
 
const KeySchema = new mongoose.Schema({
    key: String,
    hostname: String,
    quota: Number,
    usage: Number,
    features: Array
}, options);
 
module.exports = mongoose.model('Key', KeySchema);