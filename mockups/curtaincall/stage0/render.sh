#!/bin/sh
# Render mockups to PNG with headless Chrome. Run from repo root.
D=mockups/curtaincall/stage0; O=shots/curtaincall/stage0; mkdir -p $O
for f in $D/*.html; do n=$(basename $f .html); case $n in phone*) s=390,844;; *) s=1440,900;; esac
google-chrome --headless=new --no-sandbox --hide-scrollbars --disable-gpu --force-device-scale-factor=1 --window-size=$s --screenshot=$O/$n.png "file://$PWD/$f" 2>/dev/null; done
