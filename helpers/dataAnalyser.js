import _ from 'lodash';
import moment from 'moment';

let dataStructure = {};
let finalDataStructure = {};

export function analyse(dataSet) {
  dataStructure = {};
  finalDataStructure = {};

  if (!Array.isArray(dataSet)) {
    return 'Should be an array';
  }

  const cleanDataSet = dataSet.map(dataItem => JSON.parse(JSON.stringify(dataItem)));

  // (Array.isArray(dataSet) ? dataSet : [dataSet]).forEach((data, i) => iterate(data, i+1))
  iterate(cleanDataSet);

  // const dataSetLength = (Array.isArray(dataSet) ? dataSet.length : 1);
  cleanDataStructure(dataStructure, '', cleanDataSet.length);

  return finalDataStructure;
}

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

  const currentProperties = _.get(dataStructure, path);

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

  _.set(dataStructure, path, elementProperties);
};

const iterate = (obj, cursor = '') => {
  const isArray = Array.isArray(obj);

  Object.keys(obj).forEach(key => {
    const realKey = isArray ? 0 : key;
    const path = cursor ? `${cursor}.${realKey}` : realKey;

    if (obj[key] && typeof obj[key] === 'object') {
      iterate(obj[key], path);
    }
    else {
      // console.log(`path: ${path}, key: ${key}, value: ${obj[key]}`);
      setElementProperties(path, obj[key]);
    }
  });
};

const cleanDataStructure = (obj, cursor = '', dataSetLength) => {
  const isArray = Array.isArray(obj);
  Object.keys(obj).forEach(key => {
    const realKey = isArray ? 0 : key;
    const path = cursor ? `${cursor}.${realKey}` : realKey;

    if (obj[key] && typeof obj[key] === 'object' && typeof obj[key].type === 'undefined') {
      cleanDataStructure(obj[key], path, dataSetLength);
    }
    else {
      const currentProperties = _.get(dataStructure, path);
      const newProperties = { ...currentProperties };

      // Add the required property if needed
      if (currentProperties.count === dataSetLength) {
        newProperties.required = true;
      }
      delete newProperties.count;

      _.set(finalDataStructure, path, newProperties);
    }
  });
};