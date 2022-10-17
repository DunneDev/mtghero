const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boosterSchema = new Schema({
    name: String,
    price: Number,
    quantity: Number,
    image: String
});

module.exports = mongoose.model('Booster', boosterSchema);
