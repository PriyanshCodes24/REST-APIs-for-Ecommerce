// const Product = require("../models/product");

const jwt = require("express-jwt").expressjwt;

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked,
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
            { url: /\/api\/v1\/product(.*)/, methods: ["GET", "OPTIONS"] },
            { url: /\/api\/v1\/category(.*)/, methods: ["GET", "OPTIONS"] },
            `${api}/user/login`,
            `${api}/user/signup`,
        ],
    });
}

async function isRevoked(req, token) {
    return !token.payload.isAdmin;
}

module.exports = authJwt;
