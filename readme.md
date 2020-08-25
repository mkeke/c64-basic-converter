# TODO make a C64 BASIC parser with node/gulp

- auto line numbers
- labels (goto/gosub) translated to line numbers
- variables translated to AA AB AC AD
- support /* comments */ and // comments
- compile to prg
- toggle warp mode


convert code.txt to .prg
$ petcat -w2 -o out.prg code.txt

start vice with prg file loaded
$ x64 out.prg

start vice with warp mode enabled
$ x64 -warp out.prg
