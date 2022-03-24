/*

    THIS CODE IS VULNERABLE

    DO NOT USE


*/


const Express = require("express");
const mysql = require("mysql");
const https = require("https");

const app = new Express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cats', (err, success) => {
    if (err) return console.warn("ERROR", err);
});

const pool = mysql.createPool({
    connectionLimit: 5,
    host:"127.0.0.1",
    port: 3306,
    user:"user",
    password:"myskel",
    database: "products"
})

pool.getConnection((err, c) => {
    if (err) return console.warn(err);
    c.query(`CREATE TABLE IF NOT EXISTS Product (
        id int primary key auto_increment,
        title varchar(255) not null
    )`, (err, results, fields) => {
        if (err) console.warn(err);
        c.query("INSERT INTO Product(title) VALUES ('banana phone')");
        c.release();
    })
})


const Cat = mongoose.model('Cat', { name: String });
Cat.find({name: "fish"}).then((success) => {
    if (success.length == 0) {
        let a = new Cat({ name: "fish"});
        let b = new Cat({ name: "donkey"});
        a.save((err, _) => { if (err) console.log(err); })
        b.save((err, _) => { if (err) console.log(err); })
    }
})

// nosql inj
app.get("/cat", async (req, res) => {
    const search = req.query.search;
    console.log(req.query);
    const cat = await Cat.find({ name: search });
    res.json(cat);
});

// inj
app.get("/product/:id", async (req, res) => {
    const id = req.params.id;
    pool.query("SELECT * FROM Product WHERE id=" + id, (err, result, fields) => {
        if (err) {
            res.status(500);
            return res.json(err);
        }
        return res.json(result);
    });
});

// s s r f
app.get("/image/*", async (req, res) => {
    const u = req.path.replace(/^\/image/, "");
    https.get("https:/" + u, (ires) => {
        Object.entries(ires.headers).forEach(([k,v]) => {
            res.setHeader(k, v);
        })
        ires.pipe(res);
    });
});



app.listen(8080, () => {
    console.log("Dey see me listening");
})