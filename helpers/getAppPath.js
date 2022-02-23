const reqlib = require("app-root-path").require;
const globalPath = require("global-modules-path");

export default (file) => {
  return reqlib(file) || globalPath.getPath(file);
};
