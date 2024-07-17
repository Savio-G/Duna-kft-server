const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpqgjmx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db('dunaDb').collection('users')
    const shiftsCollection = client.db('dunaDb').collection('shifts')

    // saving users to the database
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body;
      const query = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    })

    // getting all the users from the data base
    app.get('/users', async (req, res) => {
      const users = req.body
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    // get a role of an user
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const users = req.body
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      res.send(result)
    })



    // add shifts
    app.post('/addShift', async (req, res) => {
      const body = req.body
      const result = await shiftsCollection.insertOne(body)
      res.send(result)
    })



    // get individual shifts and all the shifts

    app.get('/shifts', async (req, res) => {
      console.log(req.query.email)
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await shiftsCollection.find(query).toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('DunaKft Server is running..')
})

app.listen(port, () => {
  console.log(`DunaKft is running on port ${port}`)
})