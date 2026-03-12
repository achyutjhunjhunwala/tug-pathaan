#!/bin/bash

echo "Starting demo spec..."
node pathaan.js demo.spec.md

echo "Waiting 5 minutes..."
sleep 60

echo "Starting stock analysis spec..."
node pathaan.js stock-analysis.spec.md

echo "Waiting 5 minutes..."
sleep 60

echo "Starting AI news spec..."
node pathaan.js ai-news.spec.md

echo "All specs completed."
