#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

(async () => {
  const manifestData = await inquirer.prompt([
    {
      type: 'input',
      name: 'maintainerName',
      message: 'Enter maintainer name:'
    },
    {
      type: 'input',
      name: 'maintainerEmail',
      message: 'Enter maintainer email:'
    },
    {
      type: 'input',
      name: 'maintainerWebsite',
      message: 'Enter maintainer website:'
    }
  ]);

  const version = "2.0.0";
  const result = { apps: [], libs: [] };

  const readManifest = (directory) => {
    const manifestPath = path.join(directory, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } else {
      return null;
    }
  };

  const readDirectories = (dirPath, result) => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const manifest = readManifest(filePath);
        if (manifest) {
          result.push(manifest);
        } else {
          readDirectories(filePath, result);
        }
      }
    });
  };
  let directory = process.cwd()
  readDirectories(directory + '/apps', result.apps);
  readDirectories(directory + '/libs', result.libs);

  const listJSON = JSON.stringify(result, null, 2);
  fs.writeFileSync('list.json', listJSON);

  const manifestJSON = JSON.stringify({
    maintainer: {
      name: manifestData.maintainerName,
      email: manifestData.maintainerEmail,
      website: manifestData.maintainerWebsite
    },
    version
  }, null, 2);
  fs.writeFileSync('manifest.json', manifestJSON);

  console.log('Anura repo successfully created!');
})();
