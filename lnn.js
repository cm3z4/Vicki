// LNN (Linux Node Nav).

// Import the configuration file.
const config = require('./config.js');
var clear = require('clear');

var colors = require('colors');

const fs = require('fs');
const readline = require('readline');
var rimraf = require("rimraf");

const nav = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let startPath = "/home/cm3z4"
var itemsArr = [];
let currentPath = "";
let space = spaceFunc => { console.log("") };

function buildTree(sp) {
    config.showHistory === true ? null : clear();
    space();
    console.log(colors.bold.yellow("Current: ") + sp);
    itemsArr = [];
    currentPath = currentPath + sp;

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
            main();
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
            main();
        });
    };

    function main() {
        space();
        nav.question('Enter a number: ', (answer) => {

            currentPath = currentPath + "/" + itemsArr[answer];

            if (answer === "exit") { // Exit the program.
                space()
                console.log(colors.green("Later!"));
                space();
                process.exit();
            } else if (answer === "h") { // Navigate to starting path (startPath).
                buildTree(startPath);
            } else if (answer === "rm") {
                space();
                nav.question('Enter a number (file/directory to delete): ', (file) => {
                    space();
                    if (fs.lstatSync(sp + "/" + itemsArr[file]).isDirectory()) {
                        rimraf(sp + "/" + itemsArr[file], (err) => {
                            if (err) throw err;
                        });
                        console.log(colors.bold.yellow(itemsArr[file] + ' was deleted'));
                        space();
                        nav.question('Press enter to continue: ', (enter) => {
                            buildTree(sp);
                        });
                    } else {
                        fs.unlink(sp + "/" + itemsArr[file], (err) => {
                            if (err) throw err;
                            console.log(colors.bold.yellow(itemsArr[file] + ' was deleted'));
                            space();
                            nav.question('Press enter to continue: ', (enter) => {
                                buildTree(sp);
                            });
                        });
                    };
                });

            } else if (answer === "w") {
                space();
                nav.question('File name: ', (name) => {
                    space();
                    nav.question('Content: ', (content) => {
                        fs.writeFile(sp + "/" + name, content, 'utf8', cb => {
                            space();
                            console.log(colors.bold.yellow(name + " was create."));
                            space();
                            nav.question('Press enter to continue: ', (key) => {
                                buildTree(sp);
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
                buildTree(backPath.join(""));
            } else {

                if (fs.lstatSync(sp + "/" + itemsArr[answer]).isDirectory() || fs.lstatSync(sp + "/" + itemsArr[answer]).isSymbolicLink()) {
                    buildTree(sp + "/" + itemsArr[answer]);
                } else {
                    const text = fs.readFileSync(sp + "/" + itemsArr[answer], 'utf8').trim();
                    console.log("")
                    console.log(colors.bold.yellow("Reading file: " + itemsArr[answer]));
                    console.log("")
                    console.log(colors.green(text));
                    console.log("")
                    nav.question('Press enter to continue: ', (key) => {
                        buildTree(sp);
                    });

                };

            };

        });
    };

};

buildTree(startPath);
