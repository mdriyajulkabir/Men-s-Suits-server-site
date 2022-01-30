const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iyyd2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run (){
    try {
        await client.connect();
        const database = client.db('mensSuits');
        const serviceCollection = database.collection('suits')
        const myOrderCollection = database.collection('myOrder')
        const usersCollection = database.collection('users')
        const customerReview = database.collection('review')
        // GET API
        app.get('/services', async(req, res)=>{
            const cursor = serviceCollection.find({})
            const services = await cursor.toArray();
            res.send(services)
        })
        // GET SINGLE API
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.json(service)

        })
        // Post
        app.post('/services',async(req, res) =>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result)
            console.log(result);
        });

        // My order Post
        app.post('/myorder', async(req, res) =>{
            const order = req.body
            const result = await myOrderCollection.insertOne(order)
            console.log(order)
            res.json(result)
        })

        //  // All my order
         app.get('/myorder', async(req, res)=>{
            const cursor = myOrderCollection.find({})
            const order = await cursor.toArray();
            res.json(order)
        });
        // Delete order
        app.delete('/myorder/:id', async (req, res) =>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await myOrderCollection.deleteOne(query)
            console.log(' deleting user id' , result);
            res.json(result)
        })

        // My order Get
        app.get('/myorder', async(req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const cursor = myOrderCollection.find(query);
            const order = await cursor.toArray();
            res.json(order)
        })
       
        // Post user information
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })

        // update users
        app.put('/users', async (req, res) =>{
            const user = req.body;
            const filter = {email: user.email}
            const options = {upsert: true}
            const updateDoc = {$set: user}
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })
        // make admin 
        app.put('/users/admin', async(req, res) =>{
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email}
            const updateDoc = {$set: {role: 'admin'}}
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        // get Users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        // post review
        app.post('/review',async(req, res) =>{
            const service = req.body;
            const result = await customerReview.insertOne(service);
            res.json(result)
            console.log(result);
        });
        // post get
        app.get('/review', async(req, res)=>{
            const cursor = customerReview.find({})
            const services = await cursor.toArray();
            res.send(services)
        });
    }
    finally{

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Mens suits  server is running');
})

app.listen(port, () => {
    console.log("server is running", port);
})
