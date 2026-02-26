#!/bin/bash
set -e

echo "=== Survivor 50 Draft League - Server Setup ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2

# Verify
echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "PM2: $(pm2 -v)"

echo "=== Base packages installed ==="

# Check repo exists
if [ ! -d "/home/ubuntu/Survivor50Draft" ]; then
    echo "ERROR: Clone your repo to /home/ubuntu/Survivor50Draft first!"
    exit 1
fi

cd /home/ubuntu/Survivor50Draft

# Install and build frontend
cd frontend
npm install
npm run build
cd ..

# Install and build backend
cd backend
npm install
npm run build
cd ..

# Start with PM2
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

# Configure Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/survivor50
sudo ln -sf /etc/nginx/sites-available/survivor50 /etc/nginx/sites-enabled/survivor50
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Site is live at http://YOUR_EC2_IP"
echo ""
echo "Next steps:"
echo "  1. Point survivor.nathanblatter.com A record to this server's IP"
echo "  2. Wait for DNS propagation (check: dig survivor.nathanblatter.com)"
echo "  3. Run: sudo certbot --nginx -d survivor.nathanblatter.com"
echo ""
echo "PM2 commands:"
echo "  pm2 status          - check process"
echo "  pm2 logs survivor50 - view logs"
echo "  pm2 restart survivor50 - restart"
