const mongoose = require("mongoose");
const Scheam = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const adminSchema = new Scheam({
    email : {
        type: String,
        required: true,
    },
});

adminSchemaSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Admin", adminSchema);