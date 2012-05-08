#! /bin/sh

java -jar ../compiler-latest/compiler.jar \
    --js=flow-main.js   \
    --js=flow-node.js   \
    --js=flow-ui.js     \
    --js=flow-widget.js \
    --js=flow-types.js  \
    --js=flow-wire.js   \
    --js_output_file=flow-min.js \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --summary_detail_level 3
