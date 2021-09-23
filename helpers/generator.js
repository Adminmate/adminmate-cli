import fs from 'fs';
import mkdirp from 'mkdirp';

import handlebars from './handlebars.js';

export async function createAdminTemplate(projectName, database) {
  await createTemplateStructure(projectName);

  console.log('ok!!!!!!!!!!!!');
};

const createTemplateStructure = (projectName) => {
  return new Promise(async (resolve, reject) => {
    const cwd = process.cwd();
    const projectPath = `${cwd}/${projectName}`;

    await mkdirp(`${projectPath}/server`);
    await mkdirp(`${projectPath}/server/config`);
    await mkdirp(`${projectPath}/server/controllers`);
    await mkdirp(`${projectPath}/server/middlewares`);
    await mkdirp(`${projectPath}/server/models`);

    createFile(`${projectPath}/package.json`, 'test');

    createServerJsFile();

    resolve();
  });
};

const createServerJsFile = () => {
  const cwd = process.cwd();

  const serverJsContent = fs.readFileSync(`${cwd}/app-template/server.js`, 'utf8');
  const serverJsTemplate = handlebars.compile(serverJsContent);
  const result = serverJsTemplate({ database: 'mongodb' });

  console.log('===result', result);
};

const createFile = (filePath, content) => {
  // const fileName = `${absoluteProjectPath}/${relativeFilePath}`;

  if (fs.existsSync(filePath)) {
    console.log('This file already exist.')
    return;
  }

  fs.writeFileSync(filePath, content);
};