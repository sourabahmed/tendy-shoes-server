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
    const shoesCollection = tendyShoesDB.collection("shoesCollection");

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