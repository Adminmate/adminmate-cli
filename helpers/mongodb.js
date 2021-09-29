import { MongoClient } from 'mongodb';
import * as dataAnalyser from './dataAnalyser.js';

export function getDatabaseSchema(host, port = 27017, user, password, dbName, srv = false, ssl = false, cb) {
  const uri = `mongodb${srv?'+srv':''}://${user}${user?':':''}${password}${user?'@':''}${host}${!srv?`:${port}`:''}/${dbName}${ssl?'?ssl=true':''}`;
  MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
    if (err) return console.error(err);

    const db = client.db(dbName);

    const cleanSchemas = [];

    const collections = await db.listCollections().toArray();
    for (const collection of collections) {

      // if (collection.name === 'projects') {
      const collectionData = await db.collection(collection.name).find().limit(50).toArray();
      const cleanSchema = dataAnalyser.analyse(collectionData);

      // console.log('====', collectionData);

      cleanSchemas.push({
        collection: collection.name,
        schema: cleanSchema
      });
      // }
    }

    client.close();

    cb(cleanSchemas);
  });
};