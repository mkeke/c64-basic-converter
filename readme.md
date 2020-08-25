# TODO make a C64 BASIC parser with node/gulp

Make it possible to code C64 BASIC in a text editor, using labels instead of line numbers,
and proper variable names. Convert the master file to a pure basic txt file and optionally
a prg file.

watch task that listens to file changes and triggers the conversion

- auto line numbers
- labels (goto/gosub) translated to line numbers
- variables translated to AA AB AC AD
- support /* comments */ and // comments
- compile to prg
- toggle warp mode (config)
- toggle autostart x64 (config)


convert code.txt to .prg
$ petcat -w2 -o out.prg code.txt

start vice with prg file loaded
$ x64 out.prg

start vice with warp mode enabled
$ x64 -warp out.prg
