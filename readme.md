# C64 BASIC parser

```
$ node z.basic.js [-w|-watch] [-h|-help] <code.txt>
```

Converts a formatted text file to C64 BASIC.
Created in nodejs.


## Command line options

Option `-w` (or `-watch`) watches for changes to the input file, and triggers conversion.

Option `-h` (or `-help`) displays help about the converter.


## Code formatting possibilities

### Automatic line numbers

No need to write line numbers. It is done automatically. Source code:
```
poke 53280,0
print "hello"
```

Converted code:
```
10 poke 53280,0
15 print "hello"
```

### Linefeed and indentation

The code can be structured nicely with linefeed and indentation. This will be ignored by the converter.
Source code:
```
poke 53280,0
poke 53281,0

   print "hello"
```

Converted code:
```
10 poke 53280,0
15 poke 53281,0
20 print "hello"
```

### Comments

The master code can have single-line and multi-line comments. These will be removed by the converter. However, `REM` statements will be kept as part of the final code.

Source code:
```
// clear screen
print chr$(147)

/*
    set screen colors
    53280 is the border
    53281 is the screen
*/
poke 53280,0
poke 53281,0

/* display the message */
a$ = "world"
rem printing the variable
print "hello " a$

```

Converted code:
```
10 print chr$(147)
15 poke 53280,0
20 poke 53281,0
25 a$ = "world"
30 rem printing the variable
35 print "hello " a$
```


## Planned features / todos

- [x] convert: remove empty lines
- [x] convert: add line numbers
- [x] accept command line params
- [x] option to watch for changes to master file, trigger build
- [x] option to display help
- [x] master file can have indentation
- [x] convert: remove comments
- [x] support /* comments */ and // comments
- [ ] instructions on how to install as a global script
- [ ] labels + code can be on the same line
- [ ] configurable steps between line numbers (1, 5, 10, ..)
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

No, there will be no validation of the actual BASIC code!


## Thoughts about labels/variables

Labels and variables could be defined like this:
```
{LABEL foobar}
let {VAR name} = "world"
print "hello " {VAR name};
goto {LABEL foobar}
```

And be converted to this:
```
10 let AA = "world"
15 print "hello " AA;
20 goto 10
```

Maybe it's a bit annoying to write all the `{VAR ..}` statements every time.

## Thoughts about a config block

The master file might have a config block at the top, in which it's possible to set different things.

Something like this, that can be easily converted to JSON:
```
{CONF
    lineNumberStep: 5,
    createPRG: false,
    launchEmulator: false,
    warpMode: true,
}
```


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

