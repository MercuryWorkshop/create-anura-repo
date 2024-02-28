#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

(async () => {
  let directory = process.cwd()
  let manifest;
  if (!fs.existsSync(path.join(directory, 'manifest.json'))) {
    manifest = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter maintainer name:'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter maintainer email:'
      },
      {
        type: 'input',
        name: 'website',
        message: 'Enter maintainer website:'
      }
    ]);
  } else {
    const manifestPath = path.join(directory, 'manifest.json');
    let json = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest = json.maintainer;
  }

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
  readDirectories(path.join(directory, 'apps'), result.apps);
  readDirectories(path.join(directory, 'libs'), result.libs);

  const listJSON = JSON.stringify(result, null, 2);
  fs.writeFileSync(path.join(directory, 'list.json'), listJSON);

  const manifestJSON = JSON.stringify({
    maintainer: {
      name: manifest.name,
      email: manifest.email,
      website: manifest.website
    },
    version
  }, null, 2);
  fs.writeFileSync(path.join(directory, 'manifest.json'), manifestJSON);

  console.log('Anura repo successfully created!');
})();
