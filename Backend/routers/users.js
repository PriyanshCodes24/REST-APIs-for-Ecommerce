const User = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const secret = process.env.secret;

router.get("/", async (req, res) => {
    const users = await User.find().select("-passHash");

    if (!users) {
        res.status(500).json({ success: false });
    }
    res.send(users);
});

router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).send("this user not found");
    }

    if (user && bcrypt.compareSync(req.body.password, user.passHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            {
                expiresIn: "1d",
            }
        );
        res.status(200).send({ email: user.email, token: token });
    } else {
        res.status(400).send("password is wrong");
    }
});

router.get("/:id", async (req, res) => {
    let user = await User.findById(req.params.id).select("-passHash");

    if (!user) {
        return res.status(500).send("id was not found");
    }
    res.status(200).send(user);
});

router.post("/", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passHash: bcrypt.hashSync(req.body.password, 11),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();

    if (!user) {
        return res.status(400).send("user cannot be created");
    }

    res.send(user);
});

router.post("/signup", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passHash: bcrypt.hashSync(req.body.password, 11),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();

    if (!user) {
        return res.status(400).send("user cannot be created");
    }

    res.send(user);
});

router.delete("/:id", async (req, res) => {
    await User.deleteOne({ _id: req.params.id })
        .then((user) => {
            if (user) {
                return res
                    .status(200)
                    .json({ success: true, msg: "deleted user" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, msg: "couldnt delete" });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get("/get/count", async (req, res) => {
    const count = await User.countDocuments();

    if (!count) {
        res.status(500).json({ success: false });
    }
    res.send({
        userCount: count,
    });
});

module.exports = router;
