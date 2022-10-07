const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Card = require('./models/card');
const { captureRejectionSymbol } = require('events');
const { createDiffieHellman } = require('crypto');

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

app.set('view engine', 'ejs');
app.set('path', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/test', async (req, res) => {
    const card = new Card({
        id: '323db259-d35e-467d-9a46-4adcb2fc107c',
        name: 'Opt',
        price: '0.10',
        quantity: 5
    });

    await card.save();
    res.send(card);
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
