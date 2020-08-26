# C64 BASIC parser


Objective: Make it possible to code C64 BASIC in a text editor, using labels instead of line numbers, and proper variable names instead of two-character long names. Convert the master file to a pure basic .txt file and optionally a .prg file.

Created in nodejs.


## Currently implemented features

- Ignores lines that are blank or only contain whitespace
- Adds line numbers to lines


The following command:
```
$ node z.basic.js code.txt
```

..will read this file (code.txt):
```
print chr$(147)

a$ = "world"
print "hello " a$
```

..and output this
```
10 print chr$(147)
15 a$ = "world"
20 print "hello " a$
```


## Work in progress

```
$ z.basic.js [-w|-watch] [-h|-help] <filename>
```

optional argument -w (or -watch) to continue watching for changes after the
initial build.

-h (or -help) to display useful things about the converter and the code structure

Try to make it with pure nodejs, not being dependent on gulp etc.

No, there will be no validation of the actual BASIC code!

## wanted features / todos

- [x] convert: remove empty lines
- [x] convert: add line numbers
- [ ] add task with command line params
- [ ] option to watch for changes to master file, trigger build
- [ ] option to display help
- [ ] instructions on how to install as a global script
- [ ] master file can have indentation
- [ ] labels + code can be on the same line
- [ ] configurable steps between line numbers (1, 5, 10, ..)
- [ ] convert: remove comments
- [ ] support /* comments */ and // comments
- [ ] convert: save to file
- [ ] auto-prefix or postfix output file (code.txt -> code.c64basic.txt)
- [ ] config (optional) on top of master file
- [ ] option to compile to prg (or do it every time?)
- [ ] option to autostart x64 after build
- [ ] option to start x64 in warp mode
- [ ] detect labels for GOSUB/GOTO
- [ ] labels (goto/gosub) translated to line numbers
- [ ] detect VARIABLES
- [ ] variables translated to AA AB AC AD
- [ ] add verbose help option


## planned code structure

The master file might look like this

```
{CONF some kind of config options}

/*
    multiline
    comment
*/

// clear screen
print chr$(147)

{VAR name} = "world"

{LABEL foobar}
    print "hello " {VAR name} " ";
    goto {LABEL foobar}

```

it is converted to this
```
10 print chr$(147)
20 aa$ = "world"
30 print "hello " aa$ " ";
40 goto 30
```

(I don't know what to do with the config yet.)


## misc notes

convert code.txt to .prg
```
$ petcat -w2 -o out.prg code.txt
```

start vice with prg file loaded
```
$ x64 out.prg
```

start vice with warp mode enabled
```
$ x64 -warp out.prg
```

