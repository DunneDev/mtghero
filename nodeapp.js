const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const axios = require('axios');
const session = require('express-session');
const Card = require('./models/card');
const Precon = require('./models/precon');
const Booster = require('./models/booster');

// Connect to db
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
// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'teferi' }));

// Start of Routes

// Landing Page
app.get('/', (req, res) => {
    //res.redirect('/singles');
    // ADD REAL LANGING PAGE PLEASE
    res.render('home', { title: 'Home', css: ['landing.css'] });
});

// All singles for sale
app.get('/singles', async (req, res) => {
    // Set defaults if not in query
    let limit;
    if (!req.query.l) {
        limit = 20;
    } else {
        limit = Number(req.query.l);
    }

    let page;
    if (!req.query.p) {
        page = 1;
    } else {
        page = Number(req.query.p);
    }

    let search;
    if (!req.query.q) {
        search = '';
    } else {
        search = req.query.q;
    }

    //Calculate the maximum pages
    const pageMax = Math.ceil(
        (await Card.find({
            quantity: { $gt: 0 },
            name: new RegExp(search, 'i')
        }).count()) / limit
    );

    //handle too big of page count
    if (page > pageMax) {
        page = pageMax;
    }

    //handle invalid search
    if (pageMax === 0) {
        res.send('INVALID SEARCH, PLEASE ADD A REAL PAGE HERE SEB');
    } else {
        //Get cards from db
        const cards = await Card.find({
            quantity: { $gt: 0 },
            name: new RegExp(search, 'i')
        })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('singles/index', {
            cards,
            title: 'Shop Singles',
            css: ['gallery.css'],
            page,
            limit,
            search,
            pageMax
        });
    }
});

// Specific card for sale
app.get('/singles/:id', async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    res.render('singles/show', { card, title: card.name, css: ['show.css'] });
});

// add card to cart
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

// all precons
app.get('/precons', async (req, res) => {
    const precons = await Precon.find({ quantity: { $gt: 0 } });

    res.render('precons/precons', {
        precons,
        title: 'Shop Precons',
        css: ['gallery.css']
    });
});

// all boosters
app.get('/boosters', async (req, res) => {
    const boosters = await Booster.find({ quantity: { $gt: 0 } });

    res.render('boosters/boosters', {
        boosters,
        title: 'Shop Boosters',
        css: ['gallery.css']
    });
});

// Search page for card to sell
app.get('/sell', (req, res) => {
    res.render('sell/sell', {
        title: 'Sell Singles',
        css: ['sell_search.css']
    });
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
        // search api for card
        const result = await axios.get(
            'https://api.scryfall.com/cards/search',
            {
                params: { q: req.query.name }
            }
        );

        // Remove cards that do not have a price (alchemy)
        let invalidCard;
        do {
            invalidCard = false;
            for (let i = 0; i < result.data.data.length; i++) {
                if (!result.data.data[i].prices.usd) {
                    result.data.data.splice(i, 1);
                    invalidCard = true;
                    break;
                }
            }
        } while (invalidCard);

        // process each valid card
        for (let i = 0; i < result.data.data.length; i++) {
            result.data.data[i].cardImg = await downloadCard(
                result.data.data[i]
            );
        }

        // render search results
        res.render('sell/search-results', {
            title: 'Search Results',
            cards: result.data.data,
            query: req.query.name,
            css: ['gallery.css']
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

// contact information page
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us', css: ['contact.css'] });
});

// Terms and Conditions
app.get('/terms', (req, res) => {
    res.render('terms', { title: 'Terms and Conditions', css: [] });
});

// Start Server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

// downloads card if not already downloaded
async function downloadCard(apiCard) {
    let card = await Card.findOne({ id: apiCard.id });
    if (!card) {
        let cardImg;
        if (apiCard.card_faces) {
            cardImg = apiCard.card_faces[0].image_uris;
        } else {
            cardImg = apiCard.image_uris;
        }
        card = new Card({
            id: apiCard.id,
            name: apiCard.name,
            price: apiCard.prices.usd,
            images: cardImg,
            quantity: 0
        });

        await card.save();
        console.log(`saved ${card.name}`);
    }

    return card.images;
}

// (async () => {
//     const booster = new Booster({
//         name: 'test',
//         price: 12,
//         quantity: 12,
//         image: 'test'
//     });

//     await booster.save();
//     console.log('saved');
// })();
