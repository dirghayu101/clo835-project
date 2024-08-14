# Use the official Nginx image as a base
FROM nginx:latest

# Copy static files to the Nginx html directory
COPY static /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
