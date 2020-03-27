const mongoose = require('mongoose');
 
const options = {
    id: false,
    timestamps: true,
    toObject: { getters: true },
    versionKey: false,
};
 
const FeatureSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, options);
 
module.exports = FeatureSchema;