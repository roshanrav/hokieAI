import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
import ENV from '../config.js'

async function connect(){
    console.log("namaste")
    // const getUri = mongod.getUri();

    // mongoose.set('strictQuery', true)
    // const db = await mongoose.connect(getUri);
    const db = await mongoose.connect("mongodb+srv://roshanravindran:Sai%4012345@hokieai.ib58qtn.mongodb.net/hokieAI?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try{
    //     const client = new MongoClient("mongodb+srv://roshanravindran:Sai@12345@hokieai.ib58qtn.mongodb.net/?retryWrites=true&w=majority&appName=hokieAI", {
    //     serverApi: {
    //       version: ServerApiVersion.v1,
    //       strict: true,
    //       deprecationErrors: true,
    //     }
    //   });
      const db = await mongoose.connect("mongodb+srv://roshanravindran:Sai%4012345@hokieai.ib58qtn.mongodb.net/hokieAI?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    }
    catch(error)
    {
        console.log(error)
    }
    console.log("namaste thala")
    console.log("Database Connected")
    return db;
}

export default connect;