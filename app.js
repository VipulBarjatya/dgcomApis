let express = require("express");
let app = express();
// From Reading value from dotenv file
let dotenv = require("dotenv");
dotenv.config();
// For logging purposes
let morgan = require("morgan");
let fs = require("fs");
let port = process.env.PORT || 9800;
let cors = require("cors");
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let mongoUrl = process.env.MongoLive;
let bodyParser = require("body-parser");
let db;

// middleware
app.use(morgan("short", { stream: fs.createWriteStream("./app.logs") }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("This is from Express page");
});

// category
app.get("/category", (req, res) => {
  db.collection("category")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// products
app.get("/products", (req, res) => {
  let query = {};
  let shopId = Number(req.query.shopId);
  let productId = Number(req.query.productId);
  if (shopId) {
    query = { shop_id: shopId };
  } else if (productId) {
    query = { "productType.productType_id": productId };
  }
  db.collection("products")
    .find(query)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/filter/:productId", (req, res) => {
  let query = {};
  let sort = { cost: 1 };
  let productId = Number(req.params.productId);
  let brandId = Number(req.query.brandId);
  let lcost = Number(req.query.lcost);
  let hcost = Number(req.query.hcost);
  if (req.query.sort) {
    sort = { cost: req.query.sort };
  }

  if (brandId && lcost && hcost) {
    query = {
      "productType.productType_id": productId,
      "brandType.brandType_id": brandId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  } else if (brandId) {
    query = {
      "productType.productType_id": productId,
      "brandType.brandType_id": brandId,
    };
  } else if (lcost && hcost) {
    query = {
      "productType.productType_id": productId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  }
  db.collection("products")
    .find(query)
    .sort(sort)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.post("/placeOrder", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

/* // Product Specefic
// laptop

app.get("/laptop", (req, res) => {
  db.collection("laptop")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// smartphone

app.get("/smartphone", (req, res) => {
  db.collection("smartphone")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// smartwatch

app.get("/smartwatch", (req, res) => {
  db.collection("smartwatch")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// music

app.get("/music", (req, res) => {
  db.collection("music")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// camera

app.get("/camera", (req, res) => {
  db.collection("camera")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
}); */

// connection with mongo
MongoClient.connect(mongoUrl, (err, client) => {
  if (err) console.log(`Error while connecting`);
  db = client.db("ecommerce");
  app.listen(port, () => {
    console.log(`Listening to port ${port}`);
  });
});

// app.listen(port, () => {
//   console.log(`Listening to port ${port}`);
// });
