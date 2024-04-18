const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    picture:String,
    caption: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    time:Number,
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    
    
  
});

module.exports = mongoose.model('story',storySchema);