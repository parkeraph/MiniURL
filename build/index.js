"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../MiniURL.db');
const express = require("express");
const app = express();
const port = 3000;
app.get("/", function (req, res) {
    res.send("Alive");
});
app.get("/", (req, res) => {
    let rows = [];
    db.each("select * from URLS", (err, row) => {
        if (err)
            console.log("error", err);
        rows.push(row);
    });
    console.log(rows);
    res.send(rows);
});
app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
});
