const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const express = require("express");
const mongo = require("mongoose");
const fs = require("fs");

const router = express.Router();

const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = isValid ? null : new Error("Invalid image type");
        cb(uploadError, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(" ").join("-");
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

// const uploadOptions = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 },
// });

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/", async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(",") };
    }

    const products = await Product.find(filter).populate("category");

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

router.put("/:id", async (req, res) => {
    if (!mongo.isValidObjectId(req.body.category)) {
        return res.status(400).send("Invalid category ID");
    }

    const prod = await Product.updateOne(
        { _id: req.params.id },
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );
    if (!prod) {
        return res.status(400).send("product couldnt be found");
    }
    res.status(200).send(prod);
});

router.get("/:id", async (req, res) => {
    const prod = await Product.findById(req.params.id);

    if (!prod) {
        return res.status(404).send("Couldnt find product");
    }
    res.status(200).send(prod);
});
router.get("/get/count", async (req, res) => {
    const prod = await Product.countDocuments();

    if (!prod) {
        return res.status(500).send("Couldnt find product");
    }
    res.json({ prodCount: prod });
});

router.get("/get/featured/:count", async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const prod = await Product.find({ isFeatured: true }).limit(+count);

    if (!prod) {
        return res.status(500).send("Couldnt find product");
    }
    res.json({ prodCount: prod });
});

router.post("/", upload.single("image"), async (req, res) => {
    // if (!mongoose.isValidObjectId(req.body.category)) {
    //     return res.status(400).send("Invalid category ID");
    // }
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send("Invalid category");
    }
    const file = req.file;
    if (!file) {
        return res.status(400).send("No image uploaded");
    }

    const filename = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${filename}`,
        // image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    const savedProduct = await newProduct.save();
    if (!savedProduct)
        res.status(500).json({ success: false, error: error.message });
    res.status(201).json(savedProduct);
});

router.put("/images/:id", upload.array("images", 10), async (req, res) => {
    if (!mongo.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product id");
    }

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let imagesPaths = [];
    const files = req.files;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.fileName}`);
        });
    }
    const prod = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths,
        },
        {
            new: true,
        }
    );

    if (!prod) {
        return res.status(500).send("the prod couldnt be updated");
    }
    res.send(prod);
});

router.delete("/:id", async (req, res) => {
    await Product.deleteOne({ _id: req.params.id })
        .then((cat) => {
            if (cat) {
                return res.status(200).json({ success: true, msg: "deleted" });
            } else {
                return res
                    .status(404)
                    .json({ success: false, msg: "couldnt delete" });
            }
        })
        .catch((err) => {
            res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
