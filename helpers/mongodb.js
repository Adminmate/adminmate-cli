import parseSchema from 'mongodb-schema'
import { MongoClient } from 'mongodb';

export function getDatabaseSchema(host, port = 27017, user, password, dbName, srv = false, ssl = false, cb) {
  const uri = `mongodb${srv?'+srv':''}://${user}${user?':':''}${password}${user?'@':''}${host}${!srv?`:${port}`:''}/${dbName}`;
  MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
    if (err) return console.error(err);

    const db = client.db(dbName);

    const cleanSchemas = [];

    const collections = await db.listCollections().toArray();
    for (const collection of collections) {

      const collectionSchema = await parseSchema(db.collection(collection.name).find(), { storeValues: false });
      //if (err) return console.error(err);

      const cleanSchema = getFieldsConf(
        collectionSchema.fields.filter(fieldConf => fieldConf.name !== '__v')
      );

      // if (collection.name !== 'project_members') {
      // console.log('====collectionSchema', JSON.stringify(collectionSchema, null, 2));
      console.log('===cleanSchema', collection.name, JSON.stringify(cleanSchema, null, 2));
      // }

      cleanSchemas.push({
        collection: collection.name,
        schema: collectionSchema
      });
    }

    client.close();

    cb(cleanSchemas);
  });
};

const getFieldsConf = fields => {
  return fields.map(fieldConf => getFieldConf(fieldConf))
};

const getFieldConf = fieldConf => {
  let isRequired = false;
  let fieldType = '';
  let fields;

  fieldConf.types.forEach(type => {
    if (type.name !== 'Undefined') {
      fieldType = type.name;

      if (fieldConf.total_count === type.count) {
        isRequired = true;
      }
    }
    if (type.name === 'Document' && type.fields) {
      fields = getFieldsConf(type.fields);
    }
    else if (type.name === 'Array' && type.types) {
      fields = getFieldConf(type);
    }
  });

  // if (fieldConf.name === 'environments') {
  //   console.log(JSON.stringify(fieldConf, null, 2));
  // }

  const field = {
    name: fieldConf.name,
    type: fieldType,
    required: isRequired
  };

  if (fields) {
    field.fields = fields;
  }

  return field;
};