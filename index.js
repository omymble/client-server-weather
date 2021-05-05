const API_KEY = '349adfe04241534f6ed0cfe457001bf0'
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const fetch = require('node-fetch')
const PORT = process.env.PORT || 3000
const app = express()
const mydb = 'mongodb+srv://usrnm:psswrd@cluster0.h3a6w.mongodb.net/favourites?retryWrites=true&w=majority'
const Cities = require('./schema')

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

async function start() {
    try {
        await mongoose.connect(mydb, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log('Server has been started')
        })
    } catch (e) {
        console.log(e)
    }
}

function byName(city){
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then((response) => {
            if(response.ok){
                return response.json();
            }
        })
}

function byCoords(lat, lon){
    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then((response) => {
            if(response.ok){
                return response.json();
            }
        })
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.get('/weather/city', (req, res) => {
    byName(req.query.q)
        .then((data) => {
            if(data != null) { res.json(data); }
            else { res.sendStatus(404); }
        })
        .catch((err) => { res.sendStatus(500); })
})

app.get('/weather/coordinates', (req, res) => {
    byCoords(req.query.lat, req.query.lon)
        .then((data) => {
            if(data != null) { res.json(data); }
            else { res.sendStatus(404); }
        })
        .catch((err) =>{ res.sendStatus(500); })
})

app.post('/favourites/add', (req, res) => {
    Cities.findOne({name: req.query.q}, function(err, ct){
        if(err){return console.log(err);}
        if(ct) { res.sendStatus(400); }
        else {
            let nc = new Cities({name: req.query.q});
            nc.save();
            res.sendStatus(200);
        }
    });
})

app.delete('/favourites/delete', (req, res) => {
    Cities.findOneAndDelete({name: req.query.q}, function(err, result){
        if(err){return console.log(err);}
        res.sendStatus(200);
    });
})

app.get('/favourites/list', (req, res) => {
    Cities.find({}, function(err, cities){
        if(err){return console.log(err);}
        res.send(cities);
    });
});


start();
