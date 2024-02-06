# Use an official Node runtime as a parent image
FROM node:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Install PM2 globally
RUN npm install pm2 -g

# Stage 2: Setup Nginx
FROM nginx:alpine

# Install Node.js
RUN apk add --update nodejs npm

# Install PM2 globally in the Nginx image
RUN npm install pm2 -g

# Copy the Node.js application from the previous stage
COPY --from=builder /app /app

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy a new configuration file from your project
COPY nginx.conf /etc/nginx/conf.d

# Copy the startup script into the container
COPY start.sh /start.sh

# Make the startup script executable
RUN chmod +x /start.sh

# Expose port 80 to the Docker host, so we can access it from the outside
EXPOSE 80

# Run the startup script which starts both pm2 and Nginx
CMD ["/start.sh"]
