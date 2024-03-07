// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const Blog = require('./models/blog');
const User = require('./models/user');
const app = express();
const PORT = process.env.PORT || 8400;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => {
console.log('MongoDB connected');
})
.catch(err => {
console.error('MongoDB connection error:', err);
process.exit(1); // Exit the process if unable to connect to MongoDB
});


app.use(express.urlencoded({extended:false}));

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")))

app.get('/', async (req, res) => {
    const allBlog = await Blog.find({});
    let userName;
    if (req.user) {
        const user = await User.findById(req.user._id);
        userName = user ? user.fullName : undefined;
    }
    return res.render('home', {
        user: req.user,
        blogs: allBlog,
        userName: userName,
    });
});


app.use('/user',userRouter);
app.use('/blog',blogRouter);

app.listen(PORT,()=> console.log(`Working fined at port: ${PORT}`));