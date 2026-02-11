const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
    },
    accesscode: {
        type: String,
        required: true,
    },
    members: {
        type: Schema.Types.ObjectId,
        ref: "Member"
    }
});

adminSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});

module.exports = mongoose.model("Admin", adminSchema);