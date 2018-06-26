#!/bin/bash

for file in $(git diff --cached --name-only | grep -E '\.(js|jsx)$')
do
    echo "eslint: $file"
    git show ":$file" | eslint --stdin --stdin-filename "$file"
    if [ $? -ne 0 ];then
        echo "ESLint failed on file: $file"
        exit 1
    fi
done