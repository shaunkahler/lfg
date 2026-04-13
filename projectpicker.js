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
  const { exec } = require('child_process');
  exec(`start cmd /c opencode "${folderPath}"`);
  exec(`start "" /D "${folderPath}" powershell`);
  console.log(`\nOpening: ${folderPath}`);
  
  // Give the OS a split second to spawn the external windows before closing LFG
  setTimeout(() => process.exit(0), 500);
}

function displayOpeningScreen(noPrompt) {
  const b = '\x1b[33m'; // Yellow
  const w = '\x1b[37m'; // White
  const r = '\x1b[0m';  // Reset

  // Bigger LFG (Green, Blue, Red)
  console.log('            \x1b[32m_      \x1b[34m______ \x1b[31m_____ \x1b[0m');
  console.log('           \x1b[32m| |    \x1b[34m|  ____\x1b[31m/ ____|\x1b[0m');
  console.log('           \x1b[32m| |    \x1b[34m| |__ \x1b[31m| |  __ \x1b[0m');
  console.log('           \x1b[32m| |    \x1b[34m|  __|\x1b[31m| | |_ |\x1b[0m');
  console.log('           \x1b[32m| |____\x1b[34m| |   \x1b[31m| |__| |\x1b[0m');
  console.log('           \x1b[32m|______\x1b[34m|_|    \x1b[31m\\_____|\x1b[0m');
  console.log('');

  const artLines = [
    "  _______ad88888888888888888888888a,",
    "  ________a88888\"8888888888888888888888,",
    "  ______,8888\"__\"P88888888888888888888b,",
    "  ______d88_________`\"\"P88888888888888888,",
    "  _____,8888b_______________\"\"88888888888888,",
    "  _____d8P'''__,aa,______________\"\"888888888b",
    "  _____888bbdd888888ba,__,I_________\"88888888,",
    "  _____8888888888888888ba8\"_________,88888888b",
    "  ____,888888888888888888b,________,8888888888",
    "  ____(88888888888888888888,______,88888888888,",
    "  ____d888888888888888888888,____,8___\"8888888b",
    "  ____88888888888888888888888__.;8'\"\"\"__(888888",
    "  ____8888888888888I\"8888888P_,8\"_,aaa,__888888",
    "  ____888888888888I:8888888\"_,8\"__`b8d'__(88888",
    "  ____(8888888888I'888888P'_,8)__________88888",
    "  _____88888888I\"__8888P'__,8\")__________88888",
    "  _____8888888I'___888\"___,8\"_(._.)_______88888",
    "  _____(8888I\"_____\"88,__,8\"_____________,8888P",
    "  ______888I'_______\"P8_,8\"_____________,88888)",
    "  _____(88I'__________\",8\"__M\"\"\"\"\"\"M___,888888'",
    "  ____,8I\"____________,8(____\"aaaa\"___,8888888",
    "  ___,8I'____________,888a___________,8888888)",
    "  __,8I'____________,888888,_______,888888888",
    "  _,8I'____________,8888888'`-===-'888888888'",
    "  ,8I'____________,8888888\"________88888888\"",
    "  8I'____________,8\"____88_________\"888888P",
    "  8I____________,8'_____88__________`P888\"",
    "  8I___________,8I______88____________\"8ba,.",
    "  (8,_________,8P'______88______________88\"\"8bma,.",
    "  _8I________,8P'_______88,______________\"8b___\"\"P8ma,",
    "  _(8,______,8d\"________`88,_______________\"8b_____`\"8a",
    "  __8I_____,8dP_________,8X8,________________\"8b.____:8b",
    "  __(8____,8dP'__,I____,8XXX8,________________`88,____8)",
    "  ___8,___8dP'__,I____,8XxxxX8,_____I,_________8X8,__,8",
    "  ___8I___8P'__,I____,8XxxxxxX8,_____I,________`8X88,I8",
    "  ___I8,__\"___,I____,8XxxxxxxxX8b,____I,________8XXX88I,",
    "  ___`8I______I'__,8XxxxxxxxxxxxXX8____I________8XXxxXX8,",
    "  ____8I_____(8__,8XxxxxxxxxxxxxxxX8___I________8XxxxxxXX8,",
    "  ___,8I_____I[_,8XxxxxxxxxxxxxxxxxX8__8________8XxxxxxxxX8,",
    "  ___d8I,____I[_8XxxxxxxxxxxxxxxxxX8b_8_______(8XxxxxxxxxX8,",
    "  ___888I____`8,8XxxxxxxxxxxxxxxxxxxX8_8,_____,8XxxxxxxxxxxX8",
    "  ___8888,____\"88XxxxxxxxxxxxxxxxxxxX8)8I____.8XxxxxxxxxxxxX8",
    "  __,8888I_____88XxxxxxxxxxxxxxxxxxxX8_`8,__,8XxxxxxxxxxxxX8\"",
    "  __d88888_____`8XXxxxxxxxxxxxxxxxxX8'__`8,,8XxxxxxxxxxxxX8\"",
    "  __888888I_____`8XXxxxxxxxxxxxxxxX8'____\"88XxxxxxxxxxxxX8\"",
    "  __88888888bbaaaa88XXxxxxxxxxxxXX8)______)8XXxxxxxxxxXX8\"",
    "  __8888888I,_``\"\"\"\"\"\"8888888888888888aaaaa8888XxxxxXX8\"",
    "  __(8888888I,______________________.__```\"\"\"\"\"88888P\""
  ];

  artLines.forEach(line => {
    let coloredLine = line
      .replace(/8/g, `${b}8${r}`)
      .replace(/X/g, `${w}X${r}`)
      .replace(/_/g, ' ');
    console.log(coloredLine);
  });
}

async function browse() {
  const folders = loadFolders();
  if (folders.length === 0) {
    console.log('No folders in lineup. Use "add <path>" to add folders.');
    return;
  }

  let index = 0;
  let currentScreen = 'main_menu'; // 'main_menu', 'about', 'help', 'browser'
  let menuIndex = 0;
  const menuOptions = ['Start', 'About', 'Help', 'Exit'];
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  function displayAbout() {
    process.stdout.write('\x1b[2J\x1b[H');
    console.log('\x1b[36m=== About LFG ===\x1b[0m\n');
    console.log('LFG was created by \x1b[33mShaun Kahler\x1b[0m and \x1b[33mKBI Data\x1b[0m.');
    console.log('It is designed to be the ultimate project navigation tool for developers');
    console.log('who want to get straight to work with style.\n');
    console.log('\x1b[90mPress any key to return to menu...\x1b[0m');
  }

  function displayHelp() {
    process.stdout.write('\x1b[2J\x1b[H');
    console.log('\x1b[36m=== Help & Usage ===\x1b[0m\n');
    console.log('  \x1b[1mLFG Commands:\x1b[0m');
    console.log('  lfg                - Open this menu');
    console.log('  lfg add [path]     - Add a folder to your lineup');
    console.log('  lfg remove [index] - Remove a folder from your lineup');
    console.log('  lfg list           - List all saved folders\n');
    console.log('  \x1b[1mNavigation:\x1b[0m');
    console.log('  Use ARROW KEYS to move and ENTER to select.');
    console.log('  Press ESC to exit.\n');
    console.log('\x1b[90mPress any key to return to menu...\x1b[0m');
  }

  function displayStatus() {
    process.stdout.write('\x1b[2J\x1b[H'); 
    console.log('\x1b[33m\n  Use UP/DOWN arrows to navigate, ENTER to open, ESC to exit\x1b[0m\n');
    
    for (let i = 0; i < folders.length; i++) {
      if (i === index) {
        process.stdout.write('\x1b[46m\x1b[30m  > ' + path.basename(folders[i]) + ' \x1b[0m\n');
        process.stdout.write('\x1b[46m\x1b[30m    ' + folders[i] + ' \x1b[0m\n');
      } else {
        process.stdout.write('\x1b[37m    ' + path.basename(folders[i]) + '\x1b[0m\n');
        process.stdout.write('\x1b[90m    ' + folders[i] + '\x1b[0m\n');
      }
      if (i < folders.length - 1) console.log('');
    }
    process.stdout.write('\x1b[J');
  }

  // Ensure the entire console is cleared on the very first load
  process.stdout.write('\x1b[2J\x1b[H');
  
  // State to track if we've already done the initial clear
  let initialized = false;

  function displayMainMenu(isUpdate = false) {
    if (!isUpdate) {
      process.stdout.write('\x1b[2J\x1b[H'); // Full clear
      // Display the header (LFG and Art)
      displayOpeningScreen(true); 
    } else {
      // Move cursor up 7 lines (3 for header newlines/text + 4 menu options) and clear below
      process.stdout.write('\x1b[7A\x1b[G\x1b[J');
    }
    
    process.stdout.write('\n\x1b[36m  --- MAIN MENU ---\x1b[0m\n\n');
    for (let i = 0; i < menuOptions.length; i++) {
      if (i === menuIndex) {
        process.stdout.write(`  \x1b[46m\x1b[30m > ${menuOptions[i]} \x1b[0m\n`);
      } else {
        process.stdout.write(`     ${menuOptions[i]}   \n`); // Added spaces to overwrite
      }
    }
  }

  // Ensure the entire console is cleared on the very first load
  displayMainMenu();

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

    const handler = (str, key) => {
      // Ignore keypresses if we don't have a valid key object (prevents double triggers in some shells)
      if (!key) return;
      if (currentScreen === 'about' || currentScreen === 'help') {
        currentScreen = 'main_menu';
        displayMainMenu();
        return;
      }

      if (key && key.ctrl && key.name === 'c') {
        process.stdin.removeListener('keypress', handler);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        rl.close();
        resolve();
        process.exit(0);
      }

      if (key && key.name === 'escape') {
        if (currentScreen === 'browser') {
            currentScreen = 'main_menu';
            displayMainMenu();
        } else {
            process.stdin.removeListener('keypress', handler);
            if (process.stdin.isTTY) process.stdin.setRawMode(false);
            rl.close();
            resolve();
            process.exit(0);
        }
        return;
      }

      if (currentScreen === 'main_menu' && key) {
        if (key.name === 'up') {
          menuIndex = (menuIndex - 1 + menuOptions.length) % menuOptions.length;
          displayMainMenu(true);
        } else if (key.name === 'down') {
          menuIndex = (menuIndex + 1) % menuOptions.length;
          displayMainMenu(true);
        } else if (key.name === 'return') {
          const selection = menuOptions[menuIndex];
          if (selection === 'Start') {
            currentScreen = 'browser';
            displayStatus();
          } else if (selection === 'About') {
            currentScreen = 'about';
            displayAbout();
          } else if (selection === 'Help') {
            currentScreen = 'help';
            displayHelp();
          } else if (selection === 'Exit') {
            process.exit(0);
          }
        }
      } else if (currentScreen === 'browser' && key) {
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
LFG - CLI Folder Navigation Tool

Usage:
  lfg                Launch the folder picker
  lfg add [path]     Add folder to lineup (default: current dir)
  lfg remove <n>     Remove folder #n from lineup
  lfg list           Show all folders in lineup

Examples:
  lfg
  lfg add C:\\Projects\\MyApp
  lfg list
`);
}
