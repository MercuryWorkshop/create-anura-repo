#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

let directory = process.cwd()
let manifest;
if (!fs.existsSync(path.join(directory, 'manifest.json'))) {
  manifest = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter repository name:'
    },
    {
      type: 'input',
      name: 'maintainer.name',
      message: 'Enter maintainer name:'
    },
    {
      type: 'input',
      name: 'maintainer.email',
      message: 'Enter maintainer email:'
    },
    {
      type: 'input',
      name: 'maintainer.website',
      message: 'Enter maintainer website:'
    },
  ]);
} else {
  const manifestPath = path.join(directory, 'manifest.json');
  let json = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest = json;
  if (manifest.version == "2.0.0") {
    repoName = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter repository name:'
      }
    ]);
    repoName.name = manifest.name;
  }
}

const version = "2.0.1";
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
  name: manifest.name,
  maintainer: {
    name: manifest.maintainer.name,
    email: manifest.maintainer.email,
    website: manifest.maintainer.website
  },
  version
}, null, 2);
fs.writeFileSync(path.join(directory, 'manifest.json'), manifestJSON);

console.log('Anura repo successfully created!');
