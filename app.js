const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    await user.save();

    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {

    const user = await User.findOne({ email: req.body.email });

    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.userId = user._id;
        res.redirect("/dashboard");
    } 
    else {
        res.send("Invalid Login");
    }

});

app.get("/dashboard", async (req, res) => {

    const tasks = await Task.find({ userId: req.session.userId });

    res.render("dashboard", { tasks: tasks });

});

app.post("/addTask", async (req, res) => {

    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        completed: false,
        userId: req.session.userId
    });

    await task.save();

    res.redirect("/dashboard");
});

app.get("/complete/:id", async (req, res) => {

    await Task.findByIdAndUpdate(req.params.id, { completed: true });

    res.redirect("/dashboard");
});

app.get("/delete/:id", async (req, res) => {

    await Task.findByIdAndDelete(req.params.id);

    res.redirect("/dashboard");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});