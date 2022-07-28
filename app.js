const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Campground = require('./model/campground');
const methodOverride = require('method-override');
const campground = require('./model/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campground', async (req, res) => {
    const campground = await Campground.find({});
    res.render('campground/index', { campground })
})

app.get('/campground/new', (req, res) => {
    res.render('campground/new');
})

app.get('/campground/:id', async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campground/show", { campground });
})

app.post('/campground', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
})

app.get('/campground/:id/edit', async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campground/edit", { campground });
})

app.put('/campground/:id', async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campground/${campground._id}`)
})

app.delete('/campground/:id', async (req, res) => {
    let id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground')
})

app.listen(3000, () => {
    console.log('Listen on port 3000')
})