const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require("dotenv").config();


const app = express()
const port = process.env.PORT;

app.use(cors());
app.use(express.json());


function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}


const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // await client.connect();
    const tendyShoesDB = client.db("tendyShoesDB");
    const userDB = client.db("userDB");

    const shoesCollection = tendyShoesDB.collection("shoesCollection");
    const userCollection = userDB.collection("userCollection");

    // Create singel data 
    app.post("/products",  verifyToken, async(req, res) => {
      const productData = req.body;
      const result = await shoesCollection.insertOne(productData);
      res.send(result);
      console.log("data added")
    })
    //get all products
    app.get("/products", async(req, res) => {
      const shoesData = shoesCollection.find();
      const result = await shoesData.toArray();
      res.send(result);
    })

    //get single product
    app.get("/products/:id", async(req, res) => {
      const id = req.params.id;
      const productData =await shoesCollection.findOne({_id: new ObjectId(id)});
      res.send(productData);
    })
    // update single data
    app.patch("/products/:id", verifyToken, async(req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await shoesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    })
    // delete single data
    app.delete("/products/:id", verifyToken, async(req, res) => {
      const id = req.params.id;
      const productData =await shoesCollection.deleteOne({_id: new ObjectId(id)});
      res.send(productData);
    })

    // user
    app.post("/user", async (req, res) => {
      const user = req.body;

      const token = createToken(user);
      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          statu: "success",
          message: "Login success",
          token,
        });
      }
      await userCollection.insertOne(user);
      return res.send({ token });
    });

    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });


    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.log);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})