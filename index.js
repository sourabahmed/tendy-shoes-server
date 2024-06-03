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