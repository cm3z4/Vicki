// LNN (Linux Node Nav).

var colors = require('colors');

const fs = require('fs');
const readline = require('readline');

const nav = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let startPath = "/home/cm3z4"
let dirArr = [];
let currentPath = "";

function buildTree(sp) {
    console.log("");
    console.log(colors.bold.yellow("Current: ") + sp);
    dirArr = [];
    currentPath = currentPath + sp;
    fs.readdir(sp, (err, entries) => {

        console.log("");

        for (let i = 0; i < entries.length; i++) {

            dirArr.push(entries[i]);


            if (fs.lstatSync(sp + "/" + entries[i]).isDirectory()) {
                if (i < 10) {
                    console.log(" " + i + ": " + colors.bold.blue(entries[i]));
                } else {
                    console.log(i + ": " + colors.bold.blue(entries[i]));
                };
            } else if (fs.lstatSync(sp + "/" + entries[i]).isSymbolicLink()) {
                if (i < 10) {
                    console.log(" " + i + ": " + colors.grey(entries[i]));
                } else {
                    console.log(i + ": " + colors.grey(entries[i]));
                };
            } else {
                if (i < 10) {
                    console.log(" " + i + ": " + entries[i]);
                } else {
                    console.log(i + ": " + entries[i]);
                };
            };
        };

        console.log("");
        //console.log(dirArr);

        nav.question('Enter a number: ', (answer) => {

            currentPath = currentPath + "/" + dirArr[answer];

            // The "h" will always take you to the starting path (startPath);
            if (answer === "h") {
                buildTree(startPath);
            } else if (answer === "b") {
                let backPath = [];
                let stageBackPath = sp.split("/");
                for (let i = 0; i < stageBackPath.length - 1; i++) {
                    if (stageBackPath[i] !== '') {
                        backPath.push("/" + stageBackPath[i]);
                    };
                };
                buildTree(backPath.join(""));
            } else {

                if (fs.lstatSync(sp + "/" + dirArr[answer]).isDirectory() || fs.lstatSync(sp + "/" + dirArr[answer]).isSymbolicLink()) {
                    buildTree(sp + "/" + dirArr[answer]);
                } else {
                    const text = fs.readFileSync(sp + "/" + dirArr[answer], 'utf8').trim();
                    console.log("")
                    console.log(colors.bold.yellow("Reading file: " + dirArr[answer]));
                    console.log("")
                    console.log(colors.green(text));
                    console.log("")
                    nav.question('Press enter to continue: ', (key) => {
                        buildTree(sp);
                    });

                };

            };

        });

    });

};

buildTree(startPath);
