var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const storyModel = require('./stories');
var upload = require('./multer');
const utils = require('../utils/util');

var passport = require('passport');
var localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});
router.get('/storydisplay', function(req, res) {
  res.render('story', {footer: false});
});

router.get('/like/:postid',async function(req, res) {
  const post =await postModel.findOne({_id: req.params.postid});
  const user =await userModel.findOne({username: req.session.passport.user});
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  } else{
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});


router.get('/saveposts/:savepostid',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  if(user.saved.includes(req.params.savepostid)){
    user.saved.splice(user.saved.indexOf(req.params.savepostid), 1);
  }
  else{
    user.saved.push(req.params.savepostid)
  }
    await user.save();
  res.json(user)
});

router.get('/saveposts',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).
  populate( {path:'saved',
  populate:{path:"user"} }).exec();
  
  const savedPostDets  = user.saved.map((post) => (post))
  console.log(savedPostDets);
  
  

     res.render('saved.ejs',{footer:true, user, savedPostDets })
})


router.get('/feed',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");
  const posts = await postModel.find().populate("user");
  const story = await storyModel.find().populate("user");
  

  // const newposts = posts.map((post) => ({...post, date: utils.formatRelativeTime(new Date(post.date))}));
  res.render('feed', {footer: true, posts,user, story,dater:utils.formatRelativeTime});
});

// --------------story route--------
router.get('/story/:userId',async (req, res) => {
  const user = await userModel.findOne({_id:req.params.userId}).populate('stories')

  res.json(user);

})
router.get('/storylike/:storyUserId',async (req, res) => {
  const user = await userModel.findOne({username: req.session.passport.user})
  const story = await storyModel.findOne({_id:req.params.storyUserId})
  if (story.likes.indexOf(user._id) === -1) {
    story.likes.push(user._id);
  } else {
      story.likes.splice(story.likes.indexOf(user._id), 1)
  }
  await story.save() 
  const Completestory = await storyModel.findOne({_id:req.params.storyUserId}).populate("likes")


  res.json(Completestory);

})


router.get('/profile',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");  
   res.render('profile', {footer: true, user});
});

router.get('/profile/:user',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");  
  const userprofile = await userModel.findOne({username: req.params.user}).populate("posts");  

   res.render('userprofile', {footer: true, userprofile,user});
});

router.get('/search', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});

  res.render('search', {footer: true, user});
});

router.get('/search/:idsearch', isLoggedIn,async function(req, res) {
  let pattern = `^${req.params.idsearch}`;
  let regex = new RegExp(pattern);

  const userkenam = await userModel.find({username: {$regex: regex}});

  res.json(userkenam);
});


router.get('/edit',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('edit', {footer: true, user});
});

router.get('/upload',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('upload', {footer: true, user});
});

router.post('/register', function(req, res, next){
  const userData = new userModel({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      });
      userModel.register(userData, req.body.password)
      .then(function(registereduser){
        passport.authenticate("local")(req,res,function(){
          res.redirect('/feed');
        })
      })
})

router.post('/login', passport.authenticate("local",{
  successRedirect:"/feed",
  failureRedirect:"/login",
}), function(req, res){});

router.get('/logout',function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req ,res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}


///-------------- for image upload
router.post('/update',isLoggedIn, async function(req, res){
  const user = await userModel.findOneAndUpdate(
    {username: req.session.passport.user},                 //unique
    {username: req.body.username, name: req.body.name, bio: req.body.bio},      //updated data   //jo jo cheze update hongi
    {new:true});
  req.login(user, function(err){
    if(err) throw err;
    res.redirect("/profile");
  });
  });

  
  router.post('/upload',isLoggedIn,upload.single("image"),async function(req,res){
    const user = await userModel.findOne({username: req.session.passport.user});
    if (req.body.uploadkaro == "postkaro") {
      const post = await postModel.create({
        picture: req.file.filename,
        user: user._id,
        caption: req.body.caption,    
      });
      
      user.posts.push(post._id);                 //new posts feed pe push hongi.
      await user.save();
      
    } else {
      const story = await storyModel.create({
        picture: req.file.filename,
        user: user._id,
        caption: req.body.caption,
      });
      user.stories.push(story._id);                 //new posts feed pe push hongi.
      await user.save();

    }
    res.redirect('/feed');
  })


  router.post('/updateImage',isLoggedIn, upload.single('image'),async function(req, res){
    const user = await userModel.findOne({username: req.session.passport.user});
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect('/edit');
});

router.get('/follow/:userID',isLoggedIn,async function(req, res){
  const user = await userModel.findOne({username: req.session.passport.user});
  const oppositeUser = await userModel.findOne({_id: req.params.userID});
  if(user.following.indexOf(oppositeUser._id) == -1){
    user.following.push(oppositeUser._id);
    oppositeUser.followers.push(user._id)
  }else{
    user.following.splice(user.following.indexOf(oppositeUser._id), 1);
    oppositeUser.followers.splice(user.following.indexOf(oppositeUser._id), 1);

  }
  await user.save()
  await oppositeUser.save()
  res.redirect('back');
});

module.exports = router;
