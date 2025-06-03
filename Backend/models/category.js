const mongo = require("mongoose");

const categorySchema = mongo.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
});
const Category = mongo.model("Catagory", categorySchema);

module.exports = Category;
