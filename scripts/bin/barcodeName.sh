#!/bin/bash


cd "$1"
bCode=$(basename $PWD | sed 's/LTFS[0-9]_//')

if [ $? = 0 ]; then
    echo -n "$bCode"
    exit
else
    exit 1
fi
