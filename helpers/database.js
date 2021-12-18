import _ from 'lodash';
import { MongoClient } from 'mongodb';
import Sequelize from 'sequelize';
import SequelizeAuto from 'sequelize-auto';
import * as dataAnalyser from './dataAnalyser.js';
import * as generalHelper from './general.js';

const sequelizeDialects = {
  mysql: 'mysql',
  postgresql: 'postgres',
  mariadb: 'mariadb',
  sqlite: 'sqlite',
  mssql: 'mssql'
};

export function getDatabaseSchemas(database, params) {
  if (database === 'mongodb') {
    return getMongodbSchemas(params);
  }
  else if (['mysql', 'postgresql'].includes(database)) {
    return getSQLSchemas(database, params);
  }
  return Promise.reject('This database is not available for the moment');
};

export const getMongodbConnectionUrl = params => {
  const protocol = `mongodb${params.srv ? '+srv' : ''}`;
  const cred = `${params.user}${params.user ? ':' : ''}${params.password}`;
  const host = `${params.host}${!params.srv ? `:${params.port}` : ''}`;
  const dbAndParams = `${params.name}${params.ssl?'?ssl=true':''}`;
  const uri = `${protocol}://${cred}${cred ? '@' : ''}${host}/${dbAndParams}`;
  return uri;
};

export const getSQLConnectionUrl = (database, params) => {
  const protocol = sequelizeDialects[database];
  const cred = `${params.user}${params.user ? ':' : ''}${params.password}`;
  const host = `${params.host}:${params.port}`;
  const uri = `${protocol}://${cred}${cred ? '@' : ''}${host}/${params.name}`;
  return uri;
};

const getMatchingCollection = (datasets, idsToLookFor) => {
  let potentialCollection = '';
  Object.keys(datasets).forEach(collectionName => {
    const collectionData = datasets[collectionName];
    const allIds = collectionData.map(itemData => itemData._id.toString());
    idsToLookFor.forEach(value => {
      if (allIds.includes(value)) {
        potentialCollection = collectionName;
      }
    });
  });
  return potentialCollection;
};

const getRelationships = datasets => {
  const relationships = {};

  Object.keys(datasets).map(collectionName => {
    relationships[collectionName] = [];
    const foreignKeys = {};
    const collectionData = datasets[collectionName];

    collectionData.forEach(itemData => {
      Object.keys(itemData).map(fieldKey => {
        const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
        if (fieldKey !== '_id' && checkForHexRegExp.test(itemData[fieldKey])) {
          if (foreignKeys[fieldKey]) {
            foreignKeys[fieldKey].push(itemData[fieldKey].toString());
          }
          else {
            foreignKeys[fieldKey] = [itemData[fieldKey].toString()];
          }
        }
      });
    });

    Object.keys(foreignKeys).map(fieldKey => {
      const values = foreignKeys[fieldKey];
      const matchingCollection = getMatchingCollection(datasets, values);
      if (matchingCollection) {
        relationships[collectionName].push({ field: fieldKey, ref: matchingCollection });
      }
    });

  });

  return relationships;
};

const getMongodbSchemas = params => {
  return new Promise(async (resolve, reject) => {

    if (!params.host) { return reject('host parameter is undefined'); }
    if (!params.name) { return reject('name parameter is undefined'); }

    await generalHelper.timeout(2000);

    // Get mongodb connection url
    const uri = getMongodbConnectionUrl(params);

    const client = await MongoClient.connect(uri, { useNewUrlParser: true })
      .catch(err => {
        reject(err.message);
        return null;
      });

    if (!client) {
      return;
    }

    // Connect to the proper db
    const db = client.db(params.name);

    const datasets = {};
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const collectionData = await db.collection(collection.name).find().limit(50).toArray();
      datasets[collection.name] = collectionData;
    }

    // Find potential relationships
    const relationships = getRelationships(datasets);

    let cleanSchemas = [];
    Object.keys(datasets).map(collectionName => {
      const collectionData = datasets[collectionName];
      const cleanSchema = dataAnalyser.analyse(collectionData, relationships[collectionName]);
      cleanSchemas.push({
        collection: collectionName,
        schema: cleanSchema
      });
    });

    // Order by model name
    cleanSchemas = _.orderBy(cleanSchemas, ['collection'], ['asc']);

    client.close();

    resolve(cleanSchemas);
  });
};

const getSQLSchemas = (database, params) => {
  return new Promise(async (resolve, reject) => {

    if (!params.host) {
      return reject('host parameter is undefined');
    }
    if (!params.name) {
      return reject('name parameter is undefined');
    }
    if (!sequelizeDialects[database]) {
      return reject('undefined database dialect');
    }

    const sqlConnectionUrl = getSQLConnectionUrl(database, params);
    const sequelize = new Sequelize(sqlConnectionUrl);

    // Try database connection
    const reqCo = await sequelize.authenticate()
      .then(() => {
        return 'ok';
      })
      .catch(e => {
        return null;
      });

    if (!reqCo) {
      return reject('Please check your credentials');
    }

    const auto = new SequelizeAuto(sequelize, null, null, {
      // host: params.host,
      // port: params.port,
      // dialect: sequelizeDialects[database], // 'mysql' | 'mariadb' | 'sqlite' | 'postgres' | 'mssql',
      directory: './models-tmp', // where to write files
      // noWrite: true,
      // noInitModels: true,
      schema: params.schema,
      additional: {
        timestamps: false
      }
    });

    let cleanSchemas = [];

    // Connect to the database
    const data = await auto.run().catch(e => {
      console.log('===err', e);
    });

    if (!data) {
      return;
    }

    if (data && data.text) {
      Object.keys(data.text).forEach(tableName => {
        if (tableName === 'SequelizeMeta') {
          return;
        }
        // Remove schema name from table name "schema.table" => "table"
        const cleanTableName = tableName.substring(tableName.indexOf('.') + 1)
        cleanSchemas.push({
          collection: cleanTableName,
          schema: data.text[tableName]
        });
      });
      // Order by model name
      cleanSchemas = _.orderBy(cleanSchemas, ['collection'], ['asc']);
    }

    resolve(cleanSchemas);
  });
};