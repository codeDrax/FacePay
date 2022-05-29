const express = require('express');
const path = require('path');

const app = express();
let port = process.env.PORT || 3000;

const basePath = path.join(__dirname, './public');
app.use(express.static(basePath));
// app.use(express.static('public'));

app.listen(port, (err) => {
    if (err) console.log("Something went wrong!", err);
    console.log("Server is running on port " + port + "...");
});
