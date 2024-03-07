const {Router} = require("express");
const multer = require('multer');
const path = require('path');
const Blog = require("../models/blog");
const User = require("../models/user");
const router = Router();
const Comment = require('../models/comment');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.resolve(`./public/images/`));
    },
    filename: function(req,file,cb){
        const filename = `${Date.now()} - ${file.originalname}`;
        cb(null,filename);
    }
});
const upload = multer({storage:storage});

router.get('/add-new',async(req,res)=>{
    let user ;
    if(req.user._id) user = await User.findById(req.user._id);
    return res.render('addBlog',{
        user: req.user,
        userName: (req.user && user) ? user.fullName : undefined,
    })
});

router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    let comments = await Comment.find({ blogId: req.params.id });
    comments = await Comment.populate(comments, { path: "createdBy", select: "userImage fullName" });
    let user = undefined ;
    if(req.user && req.user._id) user = await User.findById(req.user._id);
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
      userName: (req.user && user) ? user.fullName : undefined,    });
  });

router.post('/comment/:blogId',async(req,res)=>{
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
  return res.redirect(`/blog/${req.params.blogId}`);
})

router.post('/',upload.single('coverImage'), async(req,res)=>{
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURl: `/images/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;