#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const CONFIG_FILE = path.join(__dirname, 'folders.json');

function loadFolders() {
  if (!fs.existsSync(CONFIG_FILE)) return [];
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function saveFolders(folders) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(folders, null, 2));
}

function addFolder(folderPath) {
  const absPath = path.resolve(folderPath);
  if (!fs.existsSync(absPath)) {
    console.log(`Error: Folder does not exist: ${absPath}`);
    return false;
  }
  if (!fs.statSync(absPath).isDirectory()) {
    console.log(`Error: Not a directory: ${absPath}`);
    return false;
  }
  const folders = loadFolders();
  if (folders.includes(absPath)) {
    console.log(`Folder already in lineup: ${absPath}`);
    return false;
  }
  folders.push(absPath);
  saveFolders(folders);
  console.log(`Added: ${absPath}`);
  return true;
}

function removeFolder(index) {
  const folders = loadFolders();
  if (index < 1 || index > folders.length) {
    console.log(`Invalid index. Choose 1-${folders.length}`);
    return false;
  }
  const removed = folders.splice(index - 1, 1)[0];
  saveFolders(folders);
  console.log(`Removed: ${removed}`);
  return true;
}

function listFolders() {
  const folders = loadFolders();
  if (folders.length === 0) {
    console.log('No folders in lineup. Use "add <path>" to add folders.');
    return;
  }
  console.log('\nFolder Lineup:');
  folders.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log('');
}

function openInOpencode(folderPath) {
  exec(`start opencode "${folderPath}"`);
}

async function browse() {
  const folders = loadFolders();
  if (folders.length === 0) {
    console.log('No folders in lineup. Use "add <path>" to add folders.');
    return;
  }

  let index = 0;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function displayStatus() {
    process.stdout.write('\x1b[2J\x1b[H');
    console.log('\n  Use UP/DOWN arrows to navigate, ENTER to open, ESC to exit\n');
    
    for (let i = 0; i < folders.length; i++) {
      if (i === index) {
        console.log('\x1b[7m  ' + path.basename(folders[i]) + '\x1b[0m');
        console.log('\x1b[7m  ' + folders[i] + '\x1b[0m');
      } else {
        console.log('    ' + path.basename(folders[i]));
        console.log('    ' + folders[i]);
      }
      if (i < folders.length - 1) console.log('');
    }
  }

  displayStatus();

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const handler = (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.stdin.removeListener('keypress', handler);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        resolve();
        return;
      }

      if (key.name === 'escape') {
        process.stdin.removeListener('keypress', handler);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        resolve();
        return;
      }

      if (key.name === 'up') {
        index = (index - 1 + folders.length) % folders.length;
        displayStatus();
      } else if (key.name === 'down') {
        index = (index + 1) % folders.length;
        displayStatus();
      } else if (key.name === 'return') {
        process.stdin.removeListener('keypress', handler);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        openInOpencode(folders[index]);
        resolve();
      }
    };

    process.stdin.on('keypress', handler);
  });
}

const command = process.argv[2] || 'lfg';
const arg = process.argv[3];

switch (command) {
  case 'add':
    addFolder(arg || process.cwd());
    break;
  case 'remove':
    removeFolder(parseInt(arg));
    break;
  case 'list':
    listFolders();
    break;
  case 'lfg':
  case 'browse':
    browse();
    break;
  default:
    console.log(`
ProjectPicker - CLI Folder Navigation Tool

Usage:
  lfg                      Launch the folder picker
  projectpicker add [path]  Add folder to lineup (default: current dir)
  projectpicker remove <n>  Remove folder #n from lineup
  projectpicker list        Show all folders in lineup

Examples:
  lfg
  projectpicker add C:\\Projects\\MyApp
  projectpicker list
`);
}
