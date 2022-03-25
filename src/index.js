/*

    THIS CODE IS VULNERABLE

    DO NOT USE


*/


const Express = require("express");
const mysql = require("mysql");
const https = require("https");
const fsP = require("fs").promises;
const fs = require("fs");
const constants = require("fs").constants;

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
        c.query("INSERT IGNORE INTO Product(id, title) VALUES (1, 'banana phone')", (err, results, fields) => {
            if (err) console.warn(err);
            c.query("INSERT IGNORE INTO Product(id, title) VALUES (2, 'banana mobile');", (err, results, fields) => {
                c.release();
            });
        });
        
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
    const { search } = req.query;
    const cat = await Cat.findOne({ name: search });
    if (!cat) {
        res.status(404);
        res.setHeader("content-type", "text/html");
        //crøss søte scrøptøng
        return res.end("Could not find a cat with name: " + search);
    }
    
    return res.json(cat);
});

// inj
app.get("/product/:id", async (req, res) => {
    const { id } = req.params;
    pool.query("SELECT * FROM Product WHERE id=" + id, (err, result, fields) => {
        if (err) {
            res.status(500);
            return res.json(err);
        }
        return res.json(result);
    });
});

// inj
app.get("/product", async (req, res) => {
    const { title } = req.query;
    const query = `SELECT * FROM Product WHERE title LIKE '${title}'`;
    console.log(query);
    pool.query(query, (err, result, fields) => {
        if (err) {
            res.status(500);
            return res.json(err);
        }
        return res.json(result);
    });
});

// s s r f
app.get("/image/*", async (req, res) => {
    const u = req.path.replace(/^\/image\//, "");
    https.get("https://" + u, (ires) => {
        Object.entries(ires.headers).forEach(([k,v]) => {
            res.setHeader(k, v);
        })
        ires.pipe(res);
    });
});

//Path trav
app.get("/*", async (req, res) => {
    const p = "public" + req.path;
    try {
        await fsP.access(p, constants.R_OK)
        fs.readFile(p, (err, data) => {
            if (err) {
                res.status = 404
                return res.end("Not found");
            }
            return res.end(data);
        });
    } catch {
        res.status = 404
        return res.end("Not found");
    }
});


app.listen(8080, () => {
    console.log("Dey see me listening");
})