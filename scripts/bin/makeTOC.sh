#!/bin/bash

cd "$1"

find . -type f | sed 's/^\.\///' | sort | tee "$2"/"${3}.txt"

if [ $? = 0 ]; then
    cd $HOME
    fileCount=$(wc -l < "$2"/"${3}.txt" | xargs)
    echo -e "count: $fileCount"
    exit 
else
    cd $HOME
    exit 1
fi
