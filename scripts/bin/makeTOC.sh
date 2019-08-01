#!/bin/bash

cd "$1"

find . -type f | sed 's/^\.\///' | tee "$2"/"${3}.txt"

if [ $? = 0 ]; then
    exit
else
    exit 1
fi

