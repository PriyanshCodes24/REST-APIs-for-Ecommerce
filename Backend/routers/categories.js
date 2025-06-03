const Category = require("../models/category");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    const categories = await Category.find();

    if (!categories) {
        res.status(500).json({ success: false });
    }
    res.send(categories);
});

router.get("/:id", async (req, res) => {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
        res.status(500).json({ msg: "The category not found" });
    }
    res.status(200).send(cat);
});

router.put("/:id", async (req, res) => {
    const cat = await Category.updateOne(
        { _id: req.params.id },
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        }
    );
    if (!cat) {
        return res.status(400).send("category not found");
    }
    res.send(cat);
});

router.post("/", async (req, res) => {
    let cat = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    cat = await cat.save();

    if (!cat) {
        return res.status(400).send("category couldnt be created");
    }

    res.send(cat);
});

router.delete("/:id", async (req, res) => {
    await Category.deleteOne({ _id: req.params.id })
        .then((cat) => {
            if (cat) {
                return res
                    .status(200)
                    .json({ success: true, message: "deleted successfully" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "couldnt find category" });
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err });
        });
});

module.exports = router;
