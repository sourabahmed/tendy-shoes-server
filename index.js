const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = 3000

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://tendy-shoes-user:tendy-shoes-pass@cluster0.fdqyro7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    const tendyShoesDB = client.db("tendyShoesDB");
    const userDB = client.db("userDB");

    const shoesCollection = tendyShoesDB.collection("shoesCollection");
    const userCollection = userDB.collection("userCollection");

    // Create singel data 
    app.post("/products", async(req, res) => {
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
    app.patch("/products/:id", async(req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const productData =await shoesCollection.updateOne({_id: new ObjectId(id)}, {$set: updatedData});
      res.send(productData);
    })
    // delete single data
    app.delete("/products/:id", async(req, res) => {
      const id = req.params.id;
      const productData =await shoesCollection.deleteOne({_id: new ObjectId(id)});
      res.send(productData);
    })

    // user
    app.post("/user", async (req, res) => {
      const user = req.body;
      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          status: "success",
          message: "Login success",
        });
      }
      const result = await userCollection.insertOne(user);
      return res.send(result)
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