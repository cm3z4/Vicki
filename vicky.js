//                                         
//   _____ _     _             ___     ___ 
//  |  |  |_|___| |_ _ _      |_  |   |   |
//  |  |  | |  _| '_| | |      _| |_ _| | |
//   \___/|_|___|_,_|_  |_____|_____|_|___|
//                  |___|_____|
//
// Author: Christopher Meza (cm3z4).
// Version: 1.0
// ----------------------------------------

// Import the configuration file.
const config = require('./config.js');
// Import Node.js modules.
const fs = require('fs');
const readline = require('readline');
// Import third-party modules.
const clear = require('clear');
const colors = require('colors');
const rimraf = require('rimraf');

// Creates a console prompt for user interaction.
const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Staring path. Set this path in the config.js file.
let startPath = config.startingPath;
// Keeps track of the current path.
let currentPath = "";
// Holds the current path's directory items.
let itemsArr = [];
// No explaination neccassary...
let space = spaceFunc => { console.log("") };

function main(sp) {
    config.showHistory === true ? null : clear();
    currentPath = currentPath + sp;
    itemsArr = [];
    space();
    console.log(colors.bold.yellow("Current: ") + sp);

    function listItems() {
        space();
        if (itemsArr.length === 0) {
            console.log(colors.bold.yellow("This folder is empty!"));
        } else {
            for (let i = 0; i < itemsArr.length; i++) {

                if (fs.lstatSync(sp + "/" + itemsArr[i]).isDirectory()) {
                    if (i < 10) {
                        console.log(" " + i + ": " + colors.bold.blue(itemsArr[i]));
                    } else {
                        console.log(i + ": " + colors.bold.blue(itemsArr[i]));
                    };
                } else if (fs.lstatSync(sp + "/" + itemsArr[i]).isSymbolicLink()) {
                    if (i < 10) {
                        console.log(" " + i + ": " + colors.grey(itemsArr[i]));
                    } else {
                        console.log(i + ": " + colors.grey(itemsArr[i]));
                    };
                } else {
                    if (i < 10) {
                        console.log(" " + i + ": " + itemsArr[i]);
                    } else {
                        console.log(i + ": " + itemsArr[i]);
                    };
                };
            };
        };
    };

    if (config.showHidden === true) {
        // Fill itemsArr without hidden files/directories.
        fs.readdir(sp, (err, entries) => {
            entries.forEach(function (e) {
                itemsArr.push(e);
            });
            listItems();
            navigation();
        });
    } else {
        // Fill itemsArr with all files/directories.
        fs.readdir(sp, (err, entries) => {
            entries.forEach(function (e) {
                if (! /^\..*/.test(e)) {
                    itemsArr.push(e);
                };
            });
            listItems();
            navigation();
        });
    };

    function navigation() {
        space();
        prompt.question('Enter a number: ', (answer) => {

            currentPath = currentPath + "/" + itemsArr[answer];

            if (answer === "exit") { // Exit the program.
                space()
                console.log(colors.green("Later!"));
                space();
                process.exit();
            } else if (answer === "h") { // Navigate to starting path (startPath).
                main(startPath);
            } else if (answer === "rm") {
                space();
                prompt.question('Enter a number (file/directory to delete): ', (file) => {
                    space();
                    if (fs.lstatSync(sp + "/" + itemsArr[file]).isDirectory()) {
                        rimraf(sp + "/" + itemsArr[file], (err) => {
                            if (err) throw err;
                        });
                        console.log(colors.bold.yellow(itemsArr[file] + ' was deleted'));
                        space();
                        prompt.question('Press enter to continue: ', (enter) => {
                            main(sp);
                        });
                    } else {
                        fs.unlink(sp + "/" + itemsArr[file], (err) => {
                            if (err) throw err;
                            console.log(colors.bold.yellow(itemsArr[file] + ' was deleted'));
                            space();
                            prompt.question('Press enter to continue: ', (enter) => {
                                main(sp);
                            });
                        });
                    };
                });

            } else if (answer === "w") {
                space();
                prompt.question('File name: ', (name) => {
                    space();
                    prompt.question('Content: ', (content) => {
                        fs.writeFile(sp + "/" + name, content, 'utf8', cb => {
                            space();
                            console.log(colors.bold.yellow(name + " was create."));
                            space();
                            prompt.question('Press enter to continue: ', (key) => {
                                main(sp);
                            });
                        });
                    });
                });
            } else if (answer === "..") {
                let backPath = [];
                let stageBackPath = sp.split("/");
                for (let i = 0; i < stageBackPath.length - 1; i++) {
                    if (stageBackPath[i] !== '') {
                        backPath.push("/" + stageBackPath[i]);
                    };
                };
                main(backPath.join(""));
            } else {

                if (fs.lstatSync(sp + "/" + itemsArr[answer]).isDirectory() || fs.lstatSync(sp + "/" + itemsArr[answer]).isSymbolicLink()) {
                    main(sp + "/" + itemsArr[answer]);
                } else {
                    const text = fs.readFileSync(sp + "/" + itemsArr[answer], 'utf8').trim();
                    console.log("")
                    console.log(colors.bold.yellow("Reading file: " + itemsArr[answer]));
                    console.log("")
                    console.log(colors.green(text));
                    console.log("")
                    prompt.question('Press enter to continue: ', (key) => {
                        main(sp);
                    });

                };

            };

        });
    };

};

main(startPath);
