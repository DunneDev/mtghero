const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const axios = require('axios');
const session = require('express-session');
const Card = require('./models/card');

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

// Server Setup
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('path', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'teferi' }));

// Start of Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// All singles for sale
app.get('/singles', async (req, res) => {
    const cards = await Card.find({ quantity: { $gt: 0 } });
    res.render('singles/index', { cards, title: 'Shop Singles' });
});

// Specific card for sale
app.get('/singles/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('singles/show', { card, title: card.name });
});

// Search page for card to sell
app.get('/sell', (req, res) => {
    res.render('sell/sell', { title: 'Sell Singles' });
});

// Handle Selling of cards
app.post('/sell', async (req, res) => {
    for (const id of req.session.buyList) {
        const card = await Card.findOne({ id });
        card.quantity += 1;
        await card.save();
    }
    req.session.buyList = [];
    res.redirect('/singles');
});

// page to add card to buylist
app.get('/sell/card/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('sell/card', { card, title: card.name });
});

// add card to buylist
app.post('/sell/card/:id', (req, res) => {
    const cardId = req.params.id;
    if (!req.session.buyList) {
        req.session.buyList = [req.params.id];
    } else {
        req.session.buyList.push(req.params.id);
    }
    res.redirect('/sell');
});

// search for cards to sell
app.get('/sell/search', async (req, res) => {
    try {
        const result = await axios.get(
            'https://api.scryfall.com/cards/search',
            {
                params: { q: req.query.name }
            }
        );

        for (let i = 0; i < result.data.data.length; i++) {
            downloadCard(result.data.data[i]);
        }
        res.render('sell/search-results', {
            title: 'Search Results',
            cards: result.data.data,
            query: req.query.name
        });
    } catch (e) {
        res.send('INVALID SEARCH, PLEASE ADD A REAL PAGE HERE SEB');
    }
});

// Page for cart
app.get('/cart', async (req, res) => {
    cart = [];
    if (req.session.buyList) {
        for (id of req.session.buyList) {
            const card = await Card.findOne({ id });
            cart.push(card);
        }
    }
    res.render('cart', {
        cart,
        title: 'cart'
    });
});

// Start Server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

// downloads card if not already downloaded
async function downloadCard(apiCard) {
    const card = await Card.findOne({ id: apiCard.id });
    if (!card) {
        let cardImg;
        if (apiCard.card_faces) {
            cardImg = apiCard.card_faces[0].image_uris;
        } else {
            cardImg = apiCard.image_uris;
        }
        const newCard = new Card({
            id: apiCard.id,
            name: apiCard.name,
            price: apiCard.prices.usd,
            images: cardImg,
            quantity: 0
        });

        await newCard.save();
        console.log('saved ' + apiCard.name);
    }
}
