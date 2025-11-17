#!/usr/bin/env node

/**
 * Script to add dark mode classes to components
 * Usage: node scripts/add-dark-mode.js
 */

const fs = require('fs');
const path = require('path');

// Mapping of light mode classes to dark mode classes
const darkModeMap = {
  'bg-white': 'dark:bg-gray-800',
  'bg-gray-50': 'dark:bg-gray-900',
  'bg-gray-100': 'dark:bg-gray-800',
  'bg-gray-200': 'dark:bg-gray-700',
  'bg-indigo-50': 'dark:bg-indigo-900/20',
  'bg-green-50': 'dark:bg-green-900/20',
  'bg-red-50': 'dark:bg-red-900/20',
  'bg-blue-50': 'dark:bg-blue-900/20',
  'bg-yellow-50': 'dark:bg-yellow-900/20',
  'text-gray-900': 'dark:text-gray-100',
  'text-gray-800': 'dark:text-gray-200',
  'text-gray-700': 'dark:text-gray-300',
  'text-gray-600': 'dark:text-gray-300',
  'text-gray-500': 'dark:text-gray-400',
  'text-gray-400': 'dark:text-gray-500',
  'text-green-600': 'dark:text-green-400',
  'text-green-700': 'dark:text-green-300',
  'text-red-600': 'dark:text-red-400',
  'text-red-500': 'dark:text-red-400',
  'text-red-700': 'dark:text-red-300',
  'text-indigo-600': 'dark:text-indigo-400',
  'text-indigo-800': 'dark:text-indigo-300',
  'border-gray-200': 'dark:border-gray-700',
  'border-gray-300': 'dark:border-gray-600',
  'hover:bg-gray-50': 'dark:hover:bg-gray-700',
  'hover:bg-gray-100': 'dark:hover:bg-gray-700',
  'hover:bg-gray-200': 'dark:hover:bg-gray-600',
  'hover:text-gray-900': 'dark:hover:text-gray-100',
  'hover:text-indigo-800': 'dark:hover:text-indigo-300',
};

function addDarkModeClasses(content) {
  let modified = content;
  let changesMade = false;

  // Match className attributes (both string literals and template literals)
  const classNameRegex = /className=["'`]([^"'`]+)["'`]/g;

  modified = modified.replace(classNameRegex, (match, classes) => {
    let newClasses = classes;
    let classChanged = false;

    // Check each light mode class and add dark mode equivalent if not already present
    Object.entries(darkModeMap).forEach(([lightClass, darkClass]) => {
      // Check if light class exists and dark version doesn't
      const lightRegex = new RegExp(`\\b${lightClass}\\b`);
      const darkRegex = new RegExp(`\\b${darkClass.replace(':', '\\:')}\\b`);

      if (lightRegex.test(newClasses) && !darkRegex.test(newClasses)) {
        // Add dark mode class after the light mode class
        newClasses = newClasses.replace(
          new RegExp(`\\b${lightClass}\\b`),
          `${lightClass} ${darkClass}`
        );
        classChanged = true;
        changesMade = true;
      }
    });

    return classChanged ? `className="${newClasses}"` : match;
  });

  return { content: modified, changed: changesMade };
}

function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, scripts
      if (!['node_modules', '.next', 'scripts', '.git'].includes(file)) {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function processFiles() {
  try {
    const files = getAllTsxFiles(process.cwd());

    console.log(`Found ${files.length} TSX files to process\n`);

    let totalFilesChanged = 0;
    const changedFiles = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: newContent, changed } = addDarkModeClasses(content);

      if (changed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        totalFilesChanged++;
        const relativePath = path.relative(process.cwd(), filePath);
        changedFiles.push(relativePath);
        console.log(`✓ Updated: ${relativePath}`);
      }
    }

    console.log(`\n✨ Complete! Updated ${totalFilesChanged} files.\n`);

    if (changedFiles.length > 0) {
      console.log('Changed files:');
      changedFiles.forEach(f => console.log(`  - ${f}`));
    }
  } catch (error) {
    console.error('Error processing files:', error);
    process.exit(1);
  }
}

// Run the script
processFiles();
