#!/bin/bash

URL="http://localhost:3000/"

REQUESTS=100

INTERVAL=0.5

echo "Sending $REQUESTS requests to $URL..."

for ((i=1;i<=REQUESTS;i++)); do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)
    echo "Request $i: HTTP Status $RESPONSE"
    sleep $INTERVAL
done

echo "Done!"
