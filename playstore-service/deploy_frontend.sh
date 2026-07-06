#!/bin/bash
# Deploy SentinelAI frontend + update Nginx to serve static files + proxy API
set -e

echo "=== Step 1: Create web root ==="
sudo mkdir -p /var/www/sentinelai
sudo chown -R ubuntu:ubuntu /var/www/sentinelai

echo "=== Step 2: Write updated Nginx config ==="
sudo tee /etc/nginx/sites-available/sentinelai > /dev/null <<'NGINX_CONF'
server {
    listen 80;
    server_name _;

    root /var/www/sentinelai;
    index index.html;

    # --- Gzip compression ---
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # --- Cache static assets (JS/CSS/images) ---
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # --- Proxy API routes to FastAPI on port 8000 ---
    location ~ ^/(health|docs|openapi.json|redoc|api|scan-history|dashboard-stats|export-scans|import-scans|analyze-playstore-app|analyze-website|manual-analysis|upload-apk|scan-status|scan-results) {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;

        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Long timeouts for AI analysis (up to 5 min)
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }

    # --- Proxy /api/v1 routes ---
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }

    # --- SPA fallback: serve index.html for all React Router routes ---
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

echo "=== Step 3: Test and reload Nginx ==="
sudo nginx -t
sudo systemctl reload nginx

echo "=== Done! Frontend deployed. ==="
echo "Website: http://161.118.177.73/"
