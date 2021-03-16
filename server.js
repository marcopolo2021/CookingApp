const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require('dotenv').config();

//Models
const User = require("./models/user");

app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//EJS
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: false
}))


//Sign Up
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.post("/signup", (req, res) => {

    const newUser = new User({
        username: req.body.username
    });

    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.render("signup");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("signup");
            });
        }
    });

    /* When using bcrypt
    bcrypt.hash(req.body.password, 10, (err, hashpswd) => {
        const user = {
            username: req.body.username,
            password: hashpswd
        }

        User.create(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                res.render("index");
            }
        });
    });*/
});

//Login
app.get("/login", (req, res) => {
    res.render("login");
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  });

app.get('/dashboard', (req, res) =>{
    res.render('dashboard');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('login');
  });

/*
app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local'),
                function (req, res) {
                    // If this function gets called, authentication was successful.
                    // `req.user` contains the authenticated user.
                    res.redirect('dashboard' + req.user.username);
                };
        }
    });
    */

    /*  when using bcrypt
    User.findOne({
        username: req.body.username
    }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(req.body.password, foundUser.password, (err, same) => {
                    if (same == true) {
                        res.render("index");
                    } else {
                        res.send("Error: Wrong password!");
                    }
                });
            } else {
                res.send("Error: User " + req.body.username + " not found!");
            }
        }
    });
});*/

app.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`)
});

//**** Routes ****/
app.get('/', (req, res) => {
    res.render("index", {});
})