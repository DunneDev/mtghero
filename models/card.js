const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    id: String,
    name: String,
    price: String,
    quantity: Number,
    images: Object
});

module.exports = mongoose.model('Card', cardSchema);
