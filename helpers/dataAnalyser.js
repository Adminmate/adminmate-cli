import _ from 'lodash';

let dataStructure = {};
let finalDataStructure = {};

export function analyse(dataSet) {
  // (Array.isArray(dataSet) ? dataSet : [dataSet]).forEach((data, i) => iterate(data, i+1))
  iterate(dataSet);

  const dataSetLength = (Array.isArray(dataSet) ? dataSet.length : 1);
  cleanDataStructure(dataStructure, '', dataSetLength);

  return finalDataStructure;
}

const getDataType = (data) => {
  return typeof data;
};

const setElementProperties = (path, value, iteration) => {
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

const iterate = (obj, cursor = '', iteration = 0) => {
  const isArray = Array.isArray(obj);
  iteration = isArray ? 0 : iteration;
  Object.keys(obj).forEach(key => {
    iteration += isArray ? 1 : 0;
    const realKey = isArray ? 0 : key;
    const path = cursor ? `${cursor}.${realKey}` : realKey;

    if (typeof obj[key] === 'object') {
      iterate(obj[key], path, iteration);
    }
    else {
      console.log(`path: ${path}, key: ${key}, value: ${obj[key]}, iteration: ${iteration}`);
      setElementProperties(path, obj[key], iteration);
    }
  });
};

const cleanDataStructure = (obj, cursor = '', dataSetLength) => {
  const isArray = Array.isArray(obj);
  Object.keys(obj).forEach(key => {
    const realKey = isArray ? 0 : key;
    const path = cursor ? `${cursor}.${realKey}` : realKey;

    if (typeof obj[key] === 'object' && typeof obj[key].type === 'undefined') {
      cleanDataStructure(obj[key], path, dataSetLength);
    }
    else {
      const currentProperties = _.get(dataStructure, path);
      const newProperties = {
        ...currentProperties,
        required: currentProperties.count === dataSetLength
      };
      delete newProperties.count;
      _.set(finalDataStructure, path, newProperties);
    }
  });
};