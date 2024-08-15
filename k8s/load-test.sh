#!/bin/bash

# URL of your Node.js service
URL="http://localhost:3000/"

# Number of requests to send
REQUESTS=100

# Interval between requests (in seconds)
INTERVAL=0.5

echo "Sending $REQUESTS requests to $URL..."

for ((i=1;i<=REQUESTS;i++)); do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)
    echo "Request $i: HTTP Status $RESPONSE"
    sleep $INTERVAL
done

echo "Done!"
