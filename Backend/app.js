const express = require("express");
const app = express();
const morgan = require("morgan");
const mongo = require("mongoose");
const cors = require("cors");
const authJwt = require("./helper/jwt");
const errHandler = require("./helper/error-handler");
require("dotenv/config");

app.use(cors());
app.options("*", cors());

// middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Routes
const productsRoute = require("./routers/products");
const usersRoute = require("./routers/users");
const categoriesRoute = require("./routers/categories");
const ordersRoute = require("./routers/orders");

const api = process.env.API_URL;

app.use(`${api}/product`, productsRoute);
app.use(`${api}/user`, usersRoute);
app.use(`${api}/category`, categoriesRoute);
app.use(`${api}/order`, ordersRoute);

// Database
mongo
    .connect(process.env.CONNECT_URI)
    .then(() => {
        console.log("Success");
    })
    .catch((err) => {
        console.log(err);
    });

//server
app.listen(3001);
