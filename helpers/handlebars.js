import handlebars from 'handlebars';

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// See https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
handlebars.registerHelper('json', function(context) {
  let jsonString = JSON.stringify(context, null, 2).replace(/"([^"]+)":/g, '$1:');
  jsonString = jsonString.replace(new RegExp('type: "objectid"', 'g'), 'type: mongoose.Schema.Types.ObjectId');
  jsonString = jsonString.replace(new RegExp('type: "string"', 'g'), 'type: String');
  jsonString = jsonString.replace(new RegExp('type: "boolean"', 'g'), 'type: Boolean');
  jsonString = jsonString.replace(new RegExp('type: "date"', 'g'), 'type: Date');
  jsonString = jsonString.replace(new RegExp('type: "number"', 'g'), 'type: Number');
  jsonString = jsonString.replace(/"/g, "'");

  // Formatting enhancements
  const newJsonString = jsonString.split('\n').map((string, i) => {
    return i > 0 ? `  ${string}` : string;
  });
  const finalJson = newJsonString.join('\n');

  return finalJson;
});

export default handlebars;