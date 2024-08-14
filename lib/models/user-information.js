'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInformationSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        min: 0,
        max: 200
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserInformation', userInformationSchema);
