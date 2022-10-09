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

// Landing Page
app.get('/', (req, res) => {
    res.redirect('singles');
    // ADD REAL LANGING PAGE PLEASE
    // res.render('home', { title: 'Home' });
});

// All singles for sale
app.get('/singles', async (req, res) => {
    const cards = await Card.find({ quantity: { $gt: 0 } });
    res.render('singles/index', {
        cards,
        title: 'Shop Singles',
        css: ['gallery.css']
    });
});

// Specific card for sale
app.get('/singles/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('singles/show', { card, title: card.name, css: [] });
});

app.post('/singles/:id', async (req, res) => {
    if (!req.session.cart) {
        req.session.cart = {};
    }

    if (!req.session.cart[req.params.id]) {
        req.session.cart[req.params.id] = 0;
    }

    req.session.cart[req.params.id] += Number(req.body.quantity);
    res.redirect('/singles');
});

// Search page for card to sell
app.get('/sell', (req, res) => {
    res.render('sell/sell', { title: 'Sell Singles', css: [] });
});

// Handle Selling of cards
app.post('/checkout', async (req, res) => {
    for (const id in req.session.cart) {
        const card = await Card.findOne({ id });
        card.quantity -= req.session.cart[id];
        await card.save();
    }
    req.session.cart = {};
    for (const id in req.session.buyList) {
        const card = await Card.findOne({ id });
        card.quantity += req.session.buyList[id];
        await card.save();
    }
    req.session.buyList = {};
    res.redirect('/singles');
});

// page to add card to buylist
app.get('/sell/card/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('sell/card', { card, title: card.name, css: [] });
});

// add card to buylist
app.post('/sell/card/:id', (req, res) => {
    if (!req.session.buyList) {
        req.session.buyList = {};
        //req.session.buyList[req.params.id] = Number(req.body.quantity);
    }

    if (!req.session.buyList[req.params.id]) {
        req.session.buyList[req.params.id] = 0;
    }
    req.session.buyList[req.params.id] += Number(req.body.quantity);
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
            query: req.query.name,
            css: []
        });
    } catch (e) {
        res.send('INVALID SEARCH, PLEASE ADD A REAL PAGE HERE SEB');
    }
});

// Page for cart
app.get('/cart', async (req, res) => {
    cart = [];
    if (req.session.cart) {
        for (id in req.session.cart) {
            const card = await Card.findOne({ id });
            card.quantity = req.session.cart[id];
            cart.push(card);
        }
    }
    buyList = [];
    if (req.session.buyList) {
        for (id in req.session.buyList) {
            const card = await Card.findOne({ id });
            card.quantity = req.session.buyList[id];
            buyList.push(card);
        }
    }
    res.render('cart', {
        cart,
        buyList,
        title: 'cart',
        css: []
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
