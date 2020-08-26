# make a C64 BASIC parser with node

## Current version

The following features have been implemented
- Ignores lines that are blank or only contain whitespace
- Adds line numbers to all lines


```
$ node z.basic.js code.txt
```

Will read this file (code.txt):
```
print chr$(147)

a$ = "world"
print "hello " a$
```

And create the following output:
```
10 print chr$(147)
15 a$ = "world"
20 print "hello " a$
```


## Work in progress

Make it possible to code C64 BASIC in a text editor, using labels instead of
line numbers, and proper variable names. Convert the master file to a pure
basic txt file and optionally a prg file.

watch task that listens to file changes and triggers the conversion

set up as a bash script that can be started like this:  
```
$ z.basic [-w|-watch] [-h|-help] <filename>
```
optional argument -w (or -watch) to continue watching for changes after the
initial build.
-h (or -help) to display useful things about the parser and the code structure

Try to make it with pure nodejs, not being dependent on gulp etc.

## wanted features

- auto convert to line numbers
- master file can have indentation
- labels (goto/gosub) translated to line numbers
- variables translated to AA AB AC AD
- support /* comments */ and // comments
- compile to prg
- toggle warp mode (config)
- toggle autostart x64 (config)

## code structure

the master file might look like this
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

I don't know what to do with the config yet.

## todos

- [x] setup basic node project
- [ ] add task with command line params
- [ ] option to watch for changes
- [x] convert: strip empty lines
- [ ] convert: strip comments
- [x] convert: add line numbers
- [ ] convert: save to file
- [ ] load options (if any) on top of file
- [ ] take options into account
- [ ] detect labels for GOSUB/GOTO
- [ ] detect VARIABLES
- [ ] add verbose help option

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

