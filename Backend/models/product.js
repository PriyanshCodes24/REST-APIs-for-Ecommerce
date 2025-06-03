const mongo = require("mongoose");

const prodSchema = mongo.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    richDescription: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    images: [
        {
            type: String,
            // default: "",
        },
    ],
    brand: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    category: {
        type: mongo.Schema.Types.ObjectId,
        ref: "Catagory",
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

prodSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

prodSchema.set("toJSON", {
    virtuals: true,
});

const Product = mongo.model("Product", prodSchema);

module.exports = Product;
