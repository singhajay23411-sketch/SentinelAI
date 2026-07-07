#!/bin/bash
# SentinelAI Nginx Reverse Proxy Setup Script
# Run this on the Oracle VM: bash nginx_setup.sh

set -e

echo "=== SentinelAI Nginx Setup ==="

# 1. Install Nginx
echo "[1/5] Installing Nginx..."
sudo apt-get update -y
sudo apt-get install -y nginx

# 2. Create Nginx site config
echo "[2/5] Writing Nginx config..."
sudo tee /etc/nginx/sites-available/sentinelai > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;          # Matches any hostname (use your domain if you have one)

    # --- CORS headers for the API ---
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;

    # Handle preflight OPTIONS requests
    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Proxy all requests to FastAPI on port 8080
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for long-running AI analysis (up to 5 min)
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# 3. Enable site and disable default
echo "[3/5] Enabling site config..."
sudo ln -sf /etc/nginx/sites-available/sentinelai /etc/nginx/sites-enabled/sentinelai
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Test and reload Nginx
echo "[4/5] Testing Nginx config..."
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 5. Allow port 80 in firewall (iptables)
echo "[5/5] Allowing port 80 through iptables..."
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
# Persist iptables rules
sudo netfilter-persistent save 2>/dev/null || true

echo ""
echo "=== Done! ==="
echo "Nginx is now running. The API is accessible at:"
echo "  http://161.118.177.73/       (via Nginx on port 80)"
echo "  http://161.118.177.73:8000/  (direct Uvicorn, still open)"
echo ""
echo "Test health endpoint: curl http://161.118.177.73/health"
