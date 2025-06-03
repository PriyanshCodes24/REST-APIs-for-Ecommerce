const mongo = require("mongoose");

const orderItemSchema = mongo.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: {
        type: mongo.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
});

const OrderItem = mongo.model("OrderItem", orderItemSchema);

module.exports = OrderItem;
