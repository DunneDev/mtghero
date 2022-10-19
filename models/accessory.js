const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accessorySchema = new Schema({
    name: String,
    price: Number,
    quantity: Number,
    image: String
});

module.exports = mongoose.model('Accessory', accessorySchema);
