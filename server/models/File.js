const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileURl: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true
    },
}, {timestamps: true});

const File = mongoose.model('File', FileSchema);

module.exports = File;