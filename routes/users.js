const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/newinstacloneDB');

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  bio: String,
  profileImage:String,
  saved:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"}],
  posts:[{type: mongoose.Schema.Types.ObjectId, ref: "post"}],
  followers:[{type: mongoose.Schema.Types.ObjectId, ref: "user"}],
  following:[{type: mongoose.Schema.Types.ObjectId, ref: "user"}],
  stories:[{type: mongoose.Schema.Types.ObjectId, ref:"story"}]
});

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);