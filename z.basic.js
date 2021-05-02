#!/usr/bin/env node
// convert from txt to basic
const fs = require("fs");
const exec = require("child_process").exec;

// define default params
const params = {
    watch: false,
    output: false,
    clear: false,
    help: false,
    filename: false,
    outfile: '',
    prgfile: '',
    createPRG: false,
    startEmulator: false,
    warpMode: false,
}

// define reusable help string
const help =
    "usage:\n  node z.basic.js [-w] [-o] [-c] [-p [-e|-ew]] [-h|--help] <filename>\n";

if (!verifyParams()) {
    return;
}

// define output filename code.txt -> code.txt.bas
params.outfile = params.filename + ".bas";
params.prgfile = params.filename + ".prg";

convert();

if (params.watch) {
    watchFile();
}



function convert() {
    let code = [];
    let lineNumber = 10;
    let isCommentBlock = false;
    let labels = {};
    let availableVars = generateAvailableVarNames();
    let vars = {};
    let consts = {};

    if (params.clear) {
        console.clear();
    }

    log(`reading '${params.filename}'`, true);

    // read source file into array
    let sourceFile = fs.readFileSync(params.filename, "utf8").split("\n");

    /*
        look for @include statements
        replace the @include statements with the contents of the file
    */
    for (let i = 0; i < sourceFile.length; i++) {
        let line = sourceFile[i];

        let matches = /^\@include (.+)$/.exec(line);
        if (matches != null && matches.length == 2) {
            let includeFilename = matches[1];

            if (!fs.existsSync(includeFilename)) {
                log(`ERROR: include file '${includeFilename}' not found`);
                return;
            }

            log("including file: " + includeFilename, true);
            let includeFile = fs.readFileSync(includeFilename, "utf8").split("\n");

            // remove current include statement and add to sourcefile
            sourceFile[i] = "";
            sourceFile.splice(i + 1, 0, ...includeFile);
        }
    }

    /*
        look for constants on a line of its own
        <pokeBlack> = 0
        <foobar> = hello there
    */
    for (let i = 0; i < sourceFile.length; i++) {
        let line = sourceFile[i];
        let matches = /^<([a-zA-Z0-9]+)> *= *(.+)$/.exec(line);
        if (matches != null && matches.length == 3) {
            consts[matches[1]] = matches[2];
            sourceFile[i] = "";
        }
    }

    /*
        examine each line of the complete code
    */
    for (let i = 0; i < sourceFile.length; i++) {
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

        if (isCommentBlock) {
            // skip to next line
            continue;
        }

        /*
            look for label definitions
        */
        let matches = /^\@(.+)$/.exec(line);
        if (matches != null && matches.length == 2) {
            let label = matches[1];

            // if label is already defined, display error
            if (labels[label]) {
                log(`ERROR: label '${label}' is defined more than once`);
                return;
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
            The variable name cannot start with a number
            The |$ is needed to detect variables at the end of a line
        */
        let varExp = /\>([a-zA-Z][a-zA-Z0-9]+)([^a-zA-Z0-9]|$)/g;
        let varMatches;
        do {
            varMatches = varExp.exec(line);
            if (varMatches) {
                let varName = varMatches[1];
                // if var is not present in vars{}
                // then pop the next available name from availableVars
                if (vars[varName] === undefined) {
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

    // replace all constant references with values
    for (let i in code) {
        for (let x in consts) {
            let constExp = new RegExp('\<' + x + '\>', 'g');
            code[i] = code[i].replace(constExp, consts[x]);
        }
    }

    // replace all label references with line numbers
    // sort label names by length of label name
    let sortedLabels = Object.keys(labels).sort(function (a, b) {
        return b.length - a.length
    });
    for (let i in code) {
        for (let l in sortedLabels) {
            let x = sortedLabels[l];
            code[i] = code[i].replace(`@${x}`, labels[x]);
        }
    }

    // replace all variable references with two character names
    // sort vars by length of variable name
    let sortedVars = Object.keys(vars).sort(function (a, b) {
        return b.length - a.length
    });
    for (let i in code) {
        for (let v in sortedVars) {
            let x = sortedVars[v];
            let varExp = new RegExp('\>' + x, 'g');
            code[i] = code[i].replace(varExp, vars[x]);
        }
    }


    if (params.output) {
        // output to console     
        log("");
        for (i in code) {
            log(code[i]);
        }
        log("");
    }

    log(`found ${Object.keys(labels).length} labels, ${Object.keys(vars).length} variables, ${Object.keys(consts).length} constants`, true);

    // save to file
    log(`writing '${params.outfile}'`, true);
    fs.writeFileSync(params.outfile, code.join("\n") + "\n", "utf8");

    if (params.createPRG) {

        exec(`petcat -w2 -o ${params.prgfile} ${params.outfile}`, (err, stdout, stderr) => {
            if (err || stderr) {
                log(stderr);
                return;
            } else {
                log(`writing '${params.prgfile}'`, true);

                if (params.startEmulator) {
                    startEmulator();
                }

            }
        });
    }
}

/*
    startEmulator
    launches x64 with the .prg file in either warp mode or normal mode
*/
function startEmulator() {
    log(`starting emulator`, true);

    let cmd = 'x64 ';
    cmd += params.warpMode ? '-warp ' : '+warp ';
    cmd += params.prgfile;

    exec(cmd, (err, stdout, stderr) => {
        if (err || stderr) {
            log(stderr);
            return;
        } else {
            // called when emulator has quit
        }
    });

}

/*
    watchFile
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

            log("File changed");
            convert();
        }
    });
}

/*
    verifyParams
    Verify correct params and existing file
*/
function verifyParams() {

    // the first two elements of argv is "node" and "<name of script>"
    // remove these from the argv before proceeding
    process.argv.splice(0, 2);

    if (process.argv.length == 0) {
        log("no arguments");
        log(help);
        return false;
    }

    // gather params
    for (let i = 0; i < process.argv.length; i++) {
        let param = process.argv[i];
        switch (param) {
            case "-h":
            case "-help":
            case "--help":
                params.help = true;
                break;
            case "-w":
                params.watch = true;
                break;
            case "-o":
                params.output = true;
                break;
            case "-c":
                params.clear = true;
                break;
            case "-p":
                params.createPRG = true;
                break;
            case "-e":
                params.startEmulator = true;
                break;
            case "-ew":
                params.startEmulator = true;
                params.warpMode = true;
                break;
        }
    }
    params.filename = process.argv[process.argv.length - 1];

    if (params.help) {
        log(help);
        return false;
    }

    if (!fs.existsSync(params.filename)) {
        log("file not found or not specified.")
        log(help);
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
    for (let a in chars) {
        for (let b in chars) {
            vars.push(chars[a] + chars[b]);
        }
    }
    let reserved = ['if', 'or', 'go', 'to', 'fn', 'ti', 'st'];
    for (let i in reserved) {
        let reservedIndex = vars.indexOf(reserved[i]);
        if (reservedIndex > -1) {
            vars.splice(reservedIndex, 1);
        }
    }

    return vars;
}

function log(str, showTime) {
    if (showTime === undefined) {
        showTime = false;
    }
    if (showTime) {
        let now = new Date();

        let t = now.getHours() < 10 ? '0' : '';
        t += now.getHours() + ":";
        t += now.getMinutes() < 10 ? '0' : '';
        t += now.getMinutes() + ":";
        t += now.getSeconds() < 10 ? '0' : '';
        t += now.getSeconds();

        console.log(`[${t}] ${str}`);
    } else {
        console.log(str);
    }
}
