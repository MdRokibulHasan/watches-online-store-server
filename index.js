const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9lpvp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const database = client.db("online_watch_store");
    const productCollection = database.collection("products");
    const cartCollection = database.collection("cart");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    // GET Products API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // user post database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // get user admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // Make admin api
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // admin post product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    // load cart data to user id

    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cartCollection.find(query).toArray();
      res.json(result);
      // console.log(uid);
    });

    // add data to cart collection
    app.post("/product/add", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.json(result);
    });

    // delete order  Product
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: id };
      const result = await cartCollection.deleteOne(query);
      res.json(result);
      // console.log(result);
    });

    // purchase Delete product
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      // console.log(id);
      const query = { uid: uid };
      const result = await cartCollection.deleteMany(query);
      res.json(result);
      // console.log(result);
    });
    // get order API

    app.get("/orders", async (req, res) => {
      const cursor = cartCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });
    // update order api
    app.put("/confirmation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const orders = {
        $set: {
          status: "Shipping",
        },
      };
      const result = await cartCollection.updateOne(query, orders);
      // res.json(result);
      console.log(result);
    });
    // user review POST API

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });
  } finally {
    // await client, close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running My Server");
});

app.listen(port, () => {
  console.log("Running Server on Port", port);
});
