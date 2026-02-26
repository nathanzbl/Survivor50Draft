#!/bin/bash
set -e

echo "=== Redeploying Survivor 50 ==="

cd /home/ubuntu/Survivor50Draft

git pull

cd frontend && npm install && npm run build && cd ..
cd backend && npm install && npm run build && cd ..

pm2 restart survivor50

echo "=== Redeploy complete! ==="
pm2 status
