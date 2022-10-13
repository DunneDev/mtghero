const mongoose = require('mongoose');
const cards = require('./cards.json');
const Card = require('../models/card');
const card = require('../models/card');

// Setup Database
mongoose.connect('mongodb://localhost:27017/mtghero', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

const seedDB = async () => {
    await Card.deleteMany({});
    const entries = 200,
        min = 3,
        max = 20,
        len = cards.length;
    let ids = {};
    for (let i = 0; i < entries; i++) {
        let card;
        do {
            card = cards[Math.floor(Math.random() * len)];
        } while (ids[card.id] || card.prices.usd === null);
        ids[card.id] = true;
        let cardImg;
        if (card.image_uris) {
            cardImg = card.image_uris;
        } else {
            cardImg = card.card_faces[0].image_uris;
        }
        // if (card.card_faces) {
        //     cardImg = card.card_faces[0].image_uris;
        // } else {
        //     cardImg = card.image_uris;
        // }
        // if (!cardImg) {
        //     console.log(card);
        // }
        const newCard = new Card({
            id: card.id,
            name: card.name,
            price: card.prices.usd,
            images: cardImg,
            quantity: Math.floor(Math.random() * (max - min) + min)
        });
        await newCard.save();
    }
};

seedDB().then(() => {
    db.close();
});
