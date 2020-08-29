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

        // look for label definitions
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
