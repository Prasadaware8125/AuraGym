const mongoose = require("mongoose");
const Scheam = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const memberSchema = new Scheam({
    name: {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    },
});

memberSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Member", memberSchema);