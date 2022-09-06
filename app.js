const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Campground = require('./model/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./model/review');


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

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.valid(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else next();
};

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campground', catchAsync(async (req, res) => {
    const campground = await Campground.find({});
    res.render('campground/index', { campground })
}));

app.get('/campground/new', (req, res) => {
    res.render('campground/new');
})

app.get('/campground/:id', catchAsync(async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campground/show", { campground });
}));

app.post('/campground', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
}))

app.get('/campground/:id/edit', catchAsync(async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campground/edit", { campground });
}));

app.put('/campground/:id', catchAsync(async (req, res) => {
    let id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campground/${campground._id}`)
}));

app.delete('/campground/:id', catchAsync(async (req, res) => {
    let id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground')
}));

app.post('/campground/:id/reviews', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!!!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Listen on port 3000');
})