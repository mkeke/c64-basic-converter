# C64 BASIC converter

Converts a file with "enhanced" C64 BASIC code into C64 BASIC. Further converts the basic code into a handy PRG file, and optionally launches it in VICE - the Versatile Commodore Emulator.

See "Code formatting possibilities".

Synopsis:
```
$ c64bc [options] <code.txt>
```

Options:
- `<code.txt>` **required** a text file with the nicely formatted master code (see possibilities below)
- `-w` watches for changes to the file, and triggers conversion
- `-o` outputs the converted code to the terminal
- `-c` clears the terminal before outputting. This is useful in combination with the watch option
- `-p` creates `code.txt.prg` using `petcat` from the converted code
- `-e` launches emulator (x64) when prg file is created
- `-ew` launches emulator (x64) in warp mode when prg file is created
- `-h` or `--help` displays help about the converter


## Installation (Ubuntu)

The following installation instructions are Ubuntu specific. The converter should however work on other operating systems with some minor modifications.

The following dependencies must be installed

### Node.js (required)

Please consult https://nodejs.org/en/

To install on your preferred Linux distro, please consult https://github.com/nodesource/distributions/blob/master/README.md

Installing Node.js v14.x on Ubuntu
```
$ curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

### VICE (petcat + x64) (optional but recommended)

The converter has the option to build prg files and open them with the Vice C64 emulator.
This must be installed and configured.

Installing Vice
```
$ sudo apt-get install vice
```

See https://vice-emu.sourceforge.io/ for info on copying ROMs etc.


### Add as global command (optional but recommended)

Run:

```
npm install -g https://github.com/mhvelplund/c64-basic-converter.git
```

## Code formatting possibilities

- Automatic line numbers
- Line feed and indentation
- Comments
- Labels
- Variables
- Working with multiple files
- Constants / Macros

### Automatic line numbers

No need to write line numbers in the master file. They're added automatically by the converter.

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

The code can be structured nicely with linefeed and indentation. This will be removed by the converter.

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

The master code can have single-line and multi-line comments. These will be removed by the converter. However, `REM` statements will end up in the final code.

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

Labels and variables inside comments will be ignored.


### Labels

It is possible to define labels in the code, and reference these in `GOTO` and `GOSUB` commands. No need to keep track of line numbers. A label is declared by `@foobar` on a line of its own. To `GOTO` or `GOSUB` a label, just write `goto @foobar`.

Source code:
```
for i=0 to 3
    gosub @printHello
    gosub @printNumber
next i
end

@printHello
    print "hello ";
    return

@printNumber
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

If a label is defined more than once, the converter displays an error:
```
ERROR: label 'printHello' is defined more than once
```


### Variables

It is possible to use custom, descriptive variable names in the master code. A custom variable must start with a `>` and can be in the range `a-zA-Z0-9`. Variable names cannot start with a number. These variables will be translated to `zz`, `zy`, `zx` and so on by the converter. Certain reserved words are of course not used as variable names.

Source code:
```
>borderAdr = 53280
>colorRed = 2
>charMem = 1024
>colorMem = 55296

poke >borderAdr,>colorRed
poke >charMem,19
poke >colorMem,1
```

Converted code:
```
10 zz = 53280
15 zy = 2
20 zx = 1024
25 zw = 55296
30 poke zz,zy
35 poke zx,19
40 poke zw,1
```

It's worth noting that the converter will not discover problems related to the combination of custom variables and BASIC variables.

Consider the following code:
```
>borderAdr = 53280
zz = 53281

poke >borderAdr,2
```

This will be converted to the following:
```
10 zz = 53280
15 zz = 53281
20 poke zz,2
```

We see that the custom variable `>borderAdr` is converted to `zz`, but that is also the name of a BASIC variable, making the initial value overwritten.

### Working with multiple files

Your project can consist of multiple files. The master file can include files wherever needed by use of the `@include <filename>` function.

Source code:
```
@include _clearscreen.txt

print "hello"
```

Separate file `_clearscreen.txt`:
```
/*
    black screen, white text, cursor on top
*/

poke53280,0
poke53281,0
print chr$(5) chr$(147);
```

Converted code:
```
10 poke53280,0
15 poke53281,0
20 print chr$(5) chr$(147);
25 print "hello"
```

The included files can have include statements (if you insist).

If a filename is not found, an error is displayed:
```
ERROR: include file '_clearscreen.txt' not found
```

The include files are currently not being watched by the `-w` option. Only changes to the master file will trigger a new conversion.

The inclusion is done before the conversion process. This way you can define variables before including a file, making a flexible template.

Source code:
```
>bgcol = 0
>txtcol = 5
@include _clearscreen.txt

print "hello"
```

Separate file `_clearscreen.txt`:
```
/*
    clear screen template

    assumes the following variables are defined:
    bgcol: the background color code
    txtcol: the petscii text color code
*/

poke53280,>bgcol
poke53281,>bgcol
print chr$(>txtcol) chr$(147);
```

Converted code:
```
10 zz = 0
15 zy = 5
20 poke53280,zz
25 poke53281,zz
30 print chr$(zy) chr$(147);
35 print "hello"
```

Include files can be organised in a separate folder if you like:
```
@include templates/clearscreen.txt
@include templates/drawlogo.txt
```

### Constants / Macros

A constant is defined on a single line like this:
```
<pokeBlack> = 0
```

Constant names must be in the range `a-zA-Z0-9`. The value can be anything you want. The converter will replace all constants with their corresponding value.

Source code:
```
<border> = 53280
<pokeBlack> = 0
<name> = commodore 64

poke <border>,<pokeBlack>
print "hello <name>"
```

Converted code:
```
10 poke 53280,0
15 print "hello commodore 64"
```

Constants are not converted into variable names, and will not affect the size of the generated code. Therefore you can have a file with constants for memory addresses, color codes, character codes etc, and simply refer to them by the name of the constant.

Separate file `_constants.txt`:
```
<border> = 53280
<screen> = 53281
<chrClear> = 147

/* poke colors */
<pokeBlack> = 0
<pokeWhite> = 1
<pokeRed> = 2
// etc..

/* character colors */
<chrBlack> = 144
<chrWhite> = 5
<chrRed> = 28
<chrCyan> = 159
// etc..
```

Source code:
```
@include _constants.txt

poke <border>,<pokeBlack>
poke <screen>,<pokeRed>

print chr$(<chrCyan>) chr$(<chrClear>);

print "hello"
```

Converted code:
```
10 poke 53280,0
15 poke 53281,2
20 print chr$(159) chr$(147);
25 print "hello"
```

To expand on this, you can have basic code as the constant value. Even references to `>variables`. The replacement of constants is done before the conversion, so anything is possible really. This approach makes it possible to define reusable macros (placeholders for short code snippets).

Example:
```
<clrscr> = print chr$(147);

<clrscr>
print "hello"
```

Converted code:
```
10 print chr$(147);
15 print "hello"
```


## Planned features / TODOs

- [ ] custom variables: remove `>` prefix. Instead, declare variables using `@var foobar` or `@var foobar = 123` on a single line.
- [ ] remove .txt extension before writing .bas and .prg
- [ ] improve command line params. Creating .bas and .prg should be default
- [ ] program flow
    - [ ] detect and report gosub/goto to undefined labels
    - [ ] detect and report undefined constants
    - [ ] detect and report generated lines longer than 80 chars.
    - [ ] add included files to watch list
- [ ] optional config block on top of master file
    - [ ] config: set preferred steps between line numbers (1, 5, 10, ..)
    - [ ] config: toggle autostart emulator
    - [ ] config: toggle warp mode

No, there will be no validation of the actual BASIC code! :-D


## Bugs and issues

I'll try to keep this section fairly empty.


## Thoughts about a config block

It would be nice to have a config block at the top of the master file, to be able to tweak how the converter behaves. For instance toggling a launchEmulator option.

Something like this, that can be easily converted to JSON:
```
{CONF
    lineNumberStep: 5,
    createPRG: false,
    launchEmulator: false,
    warpMode: true,
}
```


## C64 references

Commodore 64 PETSCII codes
https://sta.c64.org/cbm64pet.html

Commodore 64 ASCII poke codes
https://sta.c64.org/cbm64scr.html

C64 BASIC command reference
https://www.c64-wiki.com/wiki/BASIC

