const Order = require("../models/order");
const express = require("express");
const OrderItem = require("../models/order-item");
const { populate } = require("dotenv");

const router = express.Router();

router.get(`/`, async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name")
        .sort({ dateOrdered: -1 });

    if (!orders) {
        res.status(500).json({ success: false });
    }
    res.send(orders);
});

router.get("/:id", async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name")
        .populate({
            path: "orderItems",
            populate: { path: "product", populate: "category" },
        });

    if (!order) {
        res.status(500).json({ success: false });
    }
    res.send(order);
});

router.put("/:id", async (req, res) => {
    const order = await Order.updateOne(
        { _id: req.params.id },
        {
            status: req.body.status,
        },
        { new: true }
    );
    if (!order) {
        return res.status(400).send("Order not found");
    }
    res.send(order);
});

router.delete("/:id", async (req, res) => {
    await Order.findByIdAndDelete(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndDelete(orderItem);
                });
                return res.status(200).json({
                    success: true,
                    message: "deleted successfully",
                });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "couldnt find Order" });
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err });
        });
});

router.post("/", async (req, res) => {
    let orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    );

    orderItemsIds = await orderItemsIds;

    const totalPrices = await Promise.all(
        (
            await orderItemsIds
        ).map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                "product",
                "price"
            );
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });
    order = await order.save();

    if (!order) {
        return res.status(400).send("order couldnt be created");
    }

    res.send(order);
});

router.get("/get/totalsales", async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
        return res.status(400).send("The totalSales cannot be generated");
    }
    res.status(200).send({ totalSales: totalSales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
    const order = await Order.countDocuments();

    if (!order) {
        return res.status(500).send("Couldnt find product");
    }
    res.json({ prodCount: order });
});

router.get(`/get/userOrders/:userId`, async (req, res) => {
    const userOrders = await Order.find({ user: req.params.userId })
        .populate({
            path: "orderItems",
            populate: {
                path: "product",
                populate: "category",
            },
        })
        .sort({ dateOrdered: -1 });

    if (!userOrders) {
        res.status(500).json({ success: false });
    }
    res.send(userOrders);
});

module.exports = router;
