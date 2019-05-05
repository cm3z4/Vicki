//
// ██╗   ██╗██╗ ██████╗██╗  ██╗██╗        ██╗   ██╗   ██╗
// ██║   ██║██║██╔════╝██║ ██╔╝██║       ███║  ███║  ███║
// ██║   ██║██║██║     █████╔╝ ██║       ╚██║  ╚██║  ╚██║
// ╚██╗ ██╔╝██║██║     ██╔═██╗ ██║        ██║   ██║   ██║
//  ╚████╔╝ ██║╚██████╗██║  ██╗██║███████╗██║██╗██║██╗██║
//   ╚═══╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝╚═╝╚═╝╚═╝╚═╝
//
// Author: Christopher Meza (cm3z4).
// Version: 1.1.1
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
const terminalImage = require('terminal-image');

// Creates a console prompt for user interaction.
const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Staring path. Set this path in the config.js file.
let startPath = config.startingPath;
// Holds the current path's directory items.
let itemsArr = [];
// No explaination neccassary...
let space = spaceFunc => { console.log("") };

function main(sp) {

    config.showHistory === true ? null : clear();

    // Clear itemsArr on restarting the main function.
    itemsArr = [];
    space();
    if (sp === "/") {
        console.log(colors.bold.inverse("Current: " + sp));
    } else {
        console.log(colors.bold.inverse("Current: " + sp + "/"));
    };

    // Print to the screen all the items in the current directory.
    function listItems() {
        space();
        if (itemsArr.length === 0) {
            console.log(colors.bold.inverse("This directory is empty!"));
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
                if (!/^\..*/.test(e)) {
                    itemsArr.push(e);
                };
            });
            listItems();
            navigation();
        });
    };

    function navigation() {
        space();
        prompt.question('Enter a number or command: ', (answer) => {

            // No entry response.
            if (answer === "") {
                space();
                console.log(colors.bold.inverse("Nothing was entered! Try again."));
                space();
                setTimeout(function () {
                    main(sp);
                }, 1500);
                return;
            };

            if (answer.trim() === "help") {
                const help = fs.readFileSync(__dirname + '/help.txt', 'utf8');
                clear();
                console.log(colors.blue(help));
                prompt.question('Press enter to continue: ', (key) => {
                    main(sp);
                });

            } else if (answer.trim() === "exit") { // Exit the program.
                space()
                console.log(colors.bold.inverse("Goodbye!"));
                space();
                process.exit();
            } else if (answer.trim() === "home") { // Navigate to starting path (startPath).
                main(startPath);
            } else if (answer.trim() === "remove" || answer.trim() === "delete") {
                space();
                prompt.question('Enter the directory/file number to delete: ', (file) => {
                    space();
                    // Confirmation prompt to delete a directory/file.
                    prompt.question(colors.bold.inverse(`Are you sure you want to delete ${itemsArr[file]}? y/n:`) + " ", (confirm) => {
                        if (confirm.trim() === "y" || confirm.trim() === "Y" || confirm.trim() === "yes" || confirm.trim() === "Yes") {
                            if (fs.lstatSync(sp + "/" + itemsArr[file.trim()]).isDirectory()) {
                                rimraf(sp + "/" + itemsArr[file.trim()], (err) => {
                                    if (err) throw err;
                                });
                                space();
                                console.log(colors.bold.inverse(`${itemsArr[file.trim()]} was deleted!`));
                                space();
                                prompt.question('Press enter to continue: ', (enter) => {
                                    main(sp);
                                });
                            } else {
                                fs.unlink(sp + "/" + itemsArr[file.trim()], (err) => {
                                    if (err) throw err;
                                    space();
                                    console.log(colors.bold.inverse(`${itemsArr[file.trim()]} was deleted!`));
                                    space();
                                    prompt.question('Press enter to continue: ', (enter) => {
                                        main(sp);
                                    });
                                });
                            };
                        } else if (confirm.trim() === "n" || confirm.trim() === "N" || confirm.trim() === "no" || confirm.trim() === "No") {
                            space();
                            console.log(colors.bold.inverse("Deletion aborted!"));
                            space();
                            prompt.question('Press enter to continue: ', (enter) => {
                                main(sp);
                            });
                        } else {
                            space();
                            console.log(colors.bold.inverse("Not a valid option!"));
                            space();
                            setTimeout(function () {
                                main(sp);
                            }, 1500);
                        };
                    });
                });
                // Create a new directory.
            } else if (answer.trim() === "new dir") {
                space();
                prompt.question('Directory name: ', (dirName) => {
                    const directoryName = sp + "/" + dirName.trim();
                    try {
                        if (!fs.existsSync(directoryName)) {
                            fs.mkdirSync(directoryName);
                            space();
                            console.log(colors.bold.inverse(dirName.trim() + " was created!"));
                            space();
                            prompt.question('Press enter to continue: ', (key) => {
                                main(sp);
                            });
                        } else {
                            space();
                            console.log(colors.bold.inverse("The " + dirName.trim() + " directory already exists!"));
                            space();
                            prompt.question('Press enter to continue: ', (key) => {
                                main(sp);
                            });
                        };
                    } catch (err) {
                        console.error(err)
                    };
                });
                // Create a new file.
            } else if (answer.trim() === "new file") {
                space();
                prompt.question('File name: ', (fileName) => {
                    const newFileName = sp + "/" + fileName.trim();
                    try {
                        if (!fs.existsSync(newFileName)) {
                            space();
                            prompt.question('Content: ', (fileContent) => {
                                fs.writeFile(sp + "/" + fileName.trim(), fileContent.trim(), 'utf8', cb => {
                                    space();
                                    console.log(colors.bold.inverse(fileName.trim() + " was created!"));
                                    space();
                                    prompt.question('Press enter to continue: ', (key) => {
                                        main(sp);
                                    });
                                });
                            });
                        } else {
                            space();
                            console.log(colors.bold.inverse("The " + fileName.trim() + " file already exists!"));
                            space();
                            prompt.question('Press enter to continue: ', (key) => {
                                main(sp);
                            });
                        };
                    } catch (err) {
                        console.error(err)
                    };
                });

            } else if (answer.trim() === "copy file") {
                space();
                prompt.question('Choose a file to copy: ', (fileToCopy) => {

                    const parseFileToCopy = parseInt(fileToCopy, 10);

                    if (parseFileToCopy < 0 || parseFileToCopy >= itemsArr.length || isNaN(fileToCopy) || fileToCopy === "") {
                        space();
                        console.log(colors.bold.inverse("Not a valid number! Try again."));
                        setTimeout(function () {
                            main(sp);
                        }, 1500);
                    } else {

                        const existingFile = sp + "/" + itemsArr[fileToCopy.trim()];

                        if (!fs.lstatSync(existingFile).isDirectory() || fs.lstatSync(existingFile).isSymbolicLink()) {
                            space();
                            prompt.question('New copy name: ', (newCopyName) => {
                                const newCopy = sp + "/" + newCopyName.trim();
                                fs.copyFile(existingFile, newCopy, (err) => {
                                    if (err) throw err;
                                    space();
                                    console.log(colors.bold.inverse(newCopyName + " was created!"));
                                    space();
                                    prompt.question('Press enter to continue: ', (key) => {
                                        main(sp);
                                    });
                                });
                            });
                        };
                    };
                });

            } else if (answer.trim() === "back" || answer.trim() === "..") {
                let backPath = [];
                let stageBackPath = sp.split("/");

                for (let i = 0; i < stageBackPath.length - 1; i++) {
                    if (stageBackPath[i] !== "") {
                        backPath.push("/" + stageBackPath[i]);
                    };
                };

                if (stageBackPath.length === 2) {
                    main("/");
                } else {
                    main(backPath.join(""));
                };

            } else if (answer.trim() < itemsArr.length) {

                if (fs.lstatSync(sp + "/" + itemsArr[answer.trim()]).isDirectory() || fs.lstatSync(sp + "/" + itemsArr[answer]).isSymbolicLink()) {
                    if (sp === "/") {
                        main(sp + itemsArr[answer.trim()]);
                    } else {
                        main(sp + "/" + itemsArr[answer.trim()]);
                    };

                } else if (itemsArr[answer.trim()].match(/png|jpg|jpeg/i)) {

                    (async () => {
                        console.log(await terminalImage.file(sp + "/" + itemsArr[answer.trim()]));
                    })();
                    space();

                    setTimeout(function () {
                        prompt.question('Press enter to continue: ', (key) => {
                            main(sp);
                        });
                    }, 3000);

                } else {
                    const text = fs.readFileSync(sp + "/" + itemsArr[answer.trim()], 'utf8').trim();
                    space();
                    console.log(colors.bold.inverse("Reading file: " + itemsArr[answer.trim()]));
                    space();
                    console.log(colors.inverse(text));
                    space();
                    prompt.question('Press enter to continue: ', (key) => {
                        main(sp);
                    });
                };

            } else {
                space();
                console.log(colors.bold.inverse("Not a valid number or command! Try again."));
                space();
                setTimeout(function () {
                    main(sp);
                }, 1500);
            };
        });
    };
};

main(startPath);
