#!/bin/bash

while IFS= read -r line; do
    ctrl=$( echo $line | cut -d: -f1  )
    ctrl=$(tr '[:lower:]' '[:upper:]' <<<"$ctrl")
    ctrl=${ctrl//[[:space:]]}
    text=$( echo $line | cut -d: -f2- )
    
    echo "{
            \"type\": \"command\", 
            \"text\": \"$text\", 
            \"answer\": \"$ctrl\" 
        },"
    
done < controles.raw