const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const axios = require('axios');
const session = require('express-session');
const Card = require('./models/card');

mongoose.connect('mongodb://localhost:27017/mtghero', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('path', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'teferi' }));

app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/singles', async (req, res) => {
    const cards = await Card.find({ quantity: { $gt: 0 } });
    res.render('singles/index', { cards, title: 'Shop Singles' });
});

app.get('/singles/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('singles/show', { card, title: card.name });
});

app.get('/sell', (req, res) => {
    res.render('sell/sell', { title: 'Sell Singles' });
});

app.post('/sell', async (req, res) => {
    for (const id of req.session.buyList) {
        const result = await Card.find({ id });
        result[0].quantity += 1;
        await result[0].save();
    }
    req.session.buyList = [];
    res.redirect('/singles');
});

app.get('/sell/card/:id', async (req, res) => {
    const result = await Card.find({ id: req.params.id });
    res.render('sell/card', { card: result[0], title: result[0].name });
});

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
    // get search results

    const result = await axios.get('https://api.scryfall.com/cards/search', {
        params: { q: parseName(req.query.name) }
    });

    for (let i = 0; i < result.data.data.length; i++) {
        // console.log('CARD STARTS HERE ------------------');
        // console.log(result.data.data[i]);
        downloadCard(result.data.data[i]);
    }

    res.render('sell/search-results', {
        title: 'Search Results',
        cards: result.data.data,
        query: req.query.name
    });
});

app.get('/cart', async (req, res) => {
    cart = [];
    if (req.session.buyList) {
        for (id of req.session.buyList) {
            const result = await Card.find({ id });
            cart.push(result[0]);
        }
    }
    res.render('cart', {
        cart,
        title: 'cart'
    });
});

// app.post('/sell/search', async (req, res) => {
//     // get search results

//     const result = await axios.get('https://api.scryfall.com/cards/search', {
//         params: { q: parseName(req.body.name) }
//     });

//     for (let i = 0; i < result.data.data.length; i++) {
//         // console.log('CARD STARTS HERE ------------------');
//         // console.log(result.data.data[i]);
//         downloadCard(result.data.data[i]);
//     }

//     res.redirect('/singles');
// });

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

function parseName(name) {
    return name.replace(/  +/g, '+');
}

// downloads card if not already downloaded
async function downloadCard(card) {
    const result = await Card.find({ id: card.id });
    if (result.length === 0) {
        let cardImg;
        if (card.card_faces) {
            cardImg = card.card_faces[0].image_uris;
        } else {
            cardImg = card.image_uris;
        }
        const newCard = new Card({
            id: card.id,
            name: card.name,
            price: card.prices.usd,
            images: cardImg,
            quantity: 0
        });

        await newCard.save();
        console.log('saved ' + card.name);
    }
}
