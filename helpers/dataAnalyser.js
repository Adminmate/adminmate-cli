const _ = require('lodash');
const moment = require('moment');

let _dataStructure = {};
let _finalDataStructure = {};

const analyse = (dataSet, relationships) => {
  if (!Array.isArray(dataSet)) {
    return 'Should be an array';
  }

  const cleanDataSet = dataSet.map(dataItem => JSON.parse(JSON.stringify(dataItem)));

  // Explore the dataset structure
  const dataSetStructure = iterate(cleanDataSet);

  // Clean the dataset structure
  const cleanDataSetStructure = cleanDataStructure(dataSetStructure, cleanDataSet.length, relationships);

  return cleanDataSetStructure;
};

// Data analyser ------------------------------------------------------------------------

const getDataType = data => {
  if (data === null) {
    return 'string';
  }
  else if (typeof data === 'string') {
    // Check if it is a valid mongodb id
    const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
    if (checkForHexRegExp.test(data)) {
      return 'objectid';
    }
    // Check if it is a valid date
    if (data.length === 24 && moment(data).isValid()) {
      return 'date';
    }
  }

  return typeof data;
};

const setElementProperties = (path, value) => {
  if (path === '_id' || path === '__v' || path.endsWith('._id')) {
    return;
  }

  const currentProperties = _.get(_dataStructure, path);

  let elementProperties = {};
  if (!currentProperties) {
    elementProperties = {
      type: getDataType(value),
      count: 1
    };
  }
  else {
    elementProperties = { ...currentProperties };
    elementProperties.count += 1;
  }

  _.set(_dataStructure, path, elementProperties);
};

const iterate = dataSet => {
  _dataStructure = {};
  iterateRecursive(dataSet);
  return _dataStructure;
};

const iterateRecursive = (obj, cursor = '') => {
  const isArray = Array.isArray(obj);

  Object.keys(obj).forEach(key => {
    const realKey = isArray ? 0 : key;
    const path = cursor ? `${cursor}.${realKey}` : realKey;

    if (obj[key] && typeof obj[key] === 'object') {
      iterateRecursive(obj[key], path);
    }
    else {
      // console.log(`path: ${path}, key: ${key}, value: ${obj[key]}`);
      setElementProperties(path, obj[key]);
    }
  });
};

// Data structure cleaning --------------------------------------------------------------

const cleanDataStructure = (dataSetStructure, totalCount, relationships) => {
  _finalDataStructure = {};
  cleanDataStructureRecursive(dataSetStructure, '', totalCount, relationships);
  return _finalDataStructure;
};

const cleanDataStructureRecursive = (obj, cursor = '', dataSetLength, relationships) => {
  Object.keys(obj).forEach(key => {
    const path = cursor ? `${cursor}.${key}` : key;

    if (obj[key] && typeof obj[key] === 'object' && typeof obj[key].type === 'undefined') {
      cleanDataStructureRecursive(obj[key], path, dataSetLength, relationships);
    }
    else {
      const currentProperties = _.get(_dataStructure, path);
      const newProperties = { ...currentProperties };

      // Add the required property if needed
      if (currentProperties.count === dataSetLength) {
        newProperties.required = true;
      }

      // Check potential relationship for this path
      const matchingRelationships = relationships.find(r => r.field === path);
      if (matchingRelationships) {
        newProperties.ref = matchingRelationships.ref;
      }

      // Remove count
      delete newProperties.count;

      _.set(_finalDataStructure, path, newProperties);
    }
  });
};

module.exports.analyse = analyse;
