const fs = require('fs');
const path = require('path');

let keyPath = path.join(__dirname, '..', 'certificates', 'key.pem');
let certPath = path.join(__dirname, '..', 'certificates', 'cert.pem');
const key = fs.readFileSync(keyPath, 'utf8');
const cert = fs.readFileSync(certPath, 'utf8');

const express = require('express');
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 444;
const app = express();
const server = https.createServer({key: key, cert: cert}, app);
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

const options = {
    target: 'https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/',
    changeOrigin: true,
    pathRewrite: {
        '^/api/riotgames/summoner-id/': ''
    },
}
app.use('/api/riotgames/summoner-id/', createProxyMiddleware(options));

const dataOptions = {
    target: 'https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/',
    changeOrigin: true,
    pathRewrite: {
        '^/api/riotgames/summoner-data/': ''
    },
}

app.use('/api/riotgames/summoner-data', createProxyMiddleware(dataOptions));

server.listen(port);