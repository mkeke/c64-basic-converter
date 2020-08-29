# C64 BASIC converter

```
$ node z.basic.js [-w|-watch] [-h|-help] <code.txt>
```

Converts a formatted text file to C64 BASIC.

## Installation

nodejs must be installed. https://nodejs.org/en/

## Command line options

Option `-w` (or `-watch`) watches for changes to the input file, and triggers conversion.

Option `-h` (or `-help`) displays help about the converter.


## Code formatting possibilities

### Automatic line numbers

No need to write line numbers. It is done automatically.

Source code:
```
poke 53280,0
print "hello"
```

Converted code:
```
10 poke 53280,0
15 print "hello"
```

### Line feed and indentation

The code can be structured nicely with linefeed and indentation. This will be ignored by the converter.

Source code:
```
poke 53280,0
poke 53281,0

for a=0 to 4
   print "hello ";
next a
```

Converted code:
```
10 poke 53280,0
15 poke 53281,0
20 for a=0 to 4
25 print "hello ";
30 next a
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

### Labels

It is possible to define labels in the code, and reference these in `GOTO` and `GOSUB` commands. No need to keep track of line numbers. A label is declared by `@foobar` on a line of its own. To `GOTO` or `GOSUB` a label, just write `goto @foobar`.

Source code:
```
for i=0 to 3
    gosub @hello
    gosub @number
next i
end

@hello
    print "hello ";
    return

@number
    print i
    return
```

Converted code:
```
10 for i=0 to 3
15 gosub 35
20 gosub 45
25 next i
30 end
35 print "hello ";
40 return
45 print i
50 return
```

If a label is defined more than once, the converter displays an error.

## Planned features / TODOs / DONEs

- [x] convert: remove empty lines
- [x] convert: add line numbers
- [x] accept command line params
- [x] option to watch for changes to master file, trigger build
- [x] option to display help
- [x] master file can have indentation
- [x] convert: remove comments
- [x] support /* comments */ and // comments
- [x] detect labels for GOSUB/GOTO
- [x] labels (goto/gosub) translated to line numbers
- [ ] detect VARIABLES
- [ ] variables translated to AA AB AC AD
- [ ] output to file
- [ ] auto-prefix or postfix output file (code.txt -> code.c64basic.txt)
- [ ] option to create .prg file
- [ ] optional config block on top of master file
- [ ] set preferred steps between line numbers (1, 5, 10, ..)
- [ ] option to autostart emulator after build
- [ ] option to start emulator in warp mode
- [ ] instructions on how to install as a global shellscript
- [ ] add verbose help option

No, there will be no validation of the actual BASIC code!


## Thoughts about variables

Variables could be defined like this:
```
let {VAR name} = "world"
print "hello " {VAR name};
```

And be converted to this:
```
10 let AA = "world"
15 print "hello " AA;
```

Maybe it's a bit annoying to write all the `{VAR ..}` statements every time. Perhaps a simpler prefix/wrapper is better.

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

