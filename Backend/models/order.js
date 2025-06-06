const mongo = require("mongoose");

const orderSchema = mongo.Schema({
    orderItems: [
        {
            type: mongo.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true,
        },
    ],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongo.Schema.Types.ObjectId,
        ref: "User",
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
});

orderSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

orderSchema.set("toJSON", {
    virtuals: true,
});

const Order = mongo.model("Order", orderSchema);

module.exports = Order;
