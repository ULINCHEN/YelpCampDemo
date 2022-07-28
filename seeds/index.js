const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../model/campground')
const { places, descriptors } = require('./seedhelpers');

//console.log(places[1] + descriptors[5])

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const rand = (arr) => {
    return Math.floor(Math.random() * arr.length)
}

const seedDB = async () => {
    await Campground.deleteMany({});
    const price = () => Math.floor(Math.random() * 100) + 30;
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${descriptors[rand(descriptors)]} ${places[rand(places)]}`,
            image: 'http://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas quia ad eveniet sit quam quae? Culpa beatae optio commodi et totam corporis repudiandae suscipit dolores illo, labore vero amet impedit.',
            price: price(),
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});