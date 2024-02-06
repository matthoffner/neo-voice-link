#!/bin/sh

# Start the Node.js application with PM2
cd /app
pm2 start server.js

# Keep the container running and start Nginx in the foreground
nginx -g 'daemon off;'
