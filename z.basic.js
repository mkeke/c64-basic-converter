// convert from txt to basic
const fs = require("fs");
const log = (str) => { console.log(str); }

// define default params
const params = {
    help: false,
    watch: false,
    filename: false,
}

if (!verifyParams()) {
    return;
}

convert();

if(params.watch) {
    log("watching file");
    watchFile();
}



function convert() {
    log("Converting " + params.filename);

    // read source file into array
    let sourceFile = fs.readFileSync(params.filename, "utf8").split("\n");

    let code = [];
    let lineNumber = 10;
    let isCommentBlock = false;
    let labels = {};
    let availableVars = generateAvailableVarNames();
    let vars = {};

    for(let i=0; i<sourceFile.length; i++) {
        let line = sourceFile[i];

        // remove whitespace on both sides of line
        line = line.replace(/^\s+|\s+$/g, "");

        // remove single-line comments
        line = line.replace(/^\/\/.*$/, "");

        // remove multi-line comments on a single line
        line = line.replace(/^\/\*.*\*\/$/, "");

        // start of multi-line comment
        if (/^\/\*/.test(line)) {
            isCommentBlock = true;
        }
        // end of multi-line comment
        if (/^\*\//.test(line)) {
            isCommentBlock = false;
            line = "";
        }

        /*
            look for label definitions
        */
        let matches = /^\@(.+)$/.exec(line);
        if (matches != null && matches.length == 2) {
            let label = matches[1];

            // if label is already defined, display error
            if(labels[label]) {
                log(`ERROR: label ${label} is already defined]`);
            }

            // assign label to the next line number
            labels[label] = lineNumber;
            line = "";
        }


        /*
            Look for variables.
            There can be multiple variables on a single line
            A variable reference starts with a '>'
            and can be any characters in the range a-zA-Z0-9
            The |$ is needed to detect variables at the end of a line
        */
        let varExp = /\>([a-zA-Z0-9]+)([^a-zA-Z0-9]|$)/g;
        let varMatches;
        do{
            varMatches = varExp.exec(line);
            if(varMatches) {
                let varName = varMatches[1];
                // if var is not present in vars{}
                // then pop the next available name from availableVars
                if(vars[varName] === undefined) {
                    vars[varName] = availableVars.pop();
                }
            }
        } while (varMatches);

        // create line numbers
        if (!isCommentBlock && line != "") {
            code.push(lineNumber + " " + line);
            lineNumber += 5;
        }
    }

    // replace all label references with line numbers
    for(let i in code) {
        for(let x in labels) {
            code[i] = code[i].replace(`@${x}`, labels[x]);
        }
    }

    // replace all variable references with two character names
    for(let i in code) {
        for(let x in vars) {
            let varExp = new RegExp('\>'+x+'([^a-zA-Z0-9]|$)', 'g');
            code[i] = code[i].replace(varExp, vars[x] + "$1");
        }
    }

    // output
    for (i in code) {
        log(code[i]);
    }
}

/*
    watchWile
    Watch file for changes, and trigger convert()
*/
function watchFile() {
    let fsWait = false;
    fs.watch(params.filename, (event, filename) => {
        if (filename) {
            if (fsWait) {
                return;
            }
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);

            log("File changed\n");
            convert();
        }
    });
}

/*
    verifyParams
    Verify correct params and existing file
*/
function verifyParams() {
    // gather params
    for(let i=0; i<process.argv.length; i++) {
        let param = process.argv[i];
        switch(param) {
            case "-h":
            case "-help":
                params.help = true;
                break;
            case "-w":
            case "-watch":
                params.watch = true;
                break;
        }
    }
    params.filename = process.argv[process.argv.length-1];

    if (params.help) {
        log("usage:\n  node z.basic.js [-w|-watch] [-h|-help] <filename>");
        return false;
    }

    if (!fs.existsSync(params.filename)) {
        log("file not found or not specified.")
        return false;
    }

    return true;
}

/*
    generate a stack of variable names with 2 characters,
    excluding reserved words if, or, go, to, fn, ti, st
*/
function generateAvailableVarNames() {
    let vars = [];

    let chars = "abcdefghijklmnopqrstuvwxyz".split("");
    for(let a in chars) {
        for(let b in chars) {
            vars.push(chars[a] + chars[b]);
        }
    }
    let reserved = ['if', 'or', 'go', 'to', 'fn', 'ti', 'st'];
    for(let i in reserved) {
        let reservedIndex = vars.indexOf(reserved[i]);
        if (reservedIndex > -1) {
            vars.splice(reservedIndex, 1);
        }
    }

    return vars;
}
