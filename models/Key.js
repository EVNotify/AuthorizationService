const mongoose = require('mongoose');
 
const options = {
    id: false,
    collection: 'authorization',
    timestamps: true,
    toObject: { getters: true },
    versionKey: false,
};
 
const KeySchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: true
    },
    hostname: String,
    quota: {
        type: Number,
        default: 0
    },
    usage: {
        type: Number,
        default: 0
    },
    features: Array
}, options);
 
module.exports = mongoose.model('Key', KeySchema);