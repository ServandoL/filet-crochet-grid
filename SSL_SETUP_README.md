# SSL Certificate Setup and Hosting with Dockerized Nginx

This guide documents the steps to enable SSL for your Angular app served by nginx in Docker, and to host the public certificate for download.

## 0. (Optional) Install Local CA with mkcert
If you are using [mkcert](https://github.com/FiloSottile/mkcert) to generate local certificates, you should install the local CA so your system and browsers trust the certificates:

```sh
mkcert -install
```

This step only needs to be done once per machine. After this, you can generate trusted local certs with mkcert:

```sh
mkcert your-domain.test
```

## 1. Prepare Certificate Files
- Place your SSL certificate (`192.168.4.44.pem`) and private key (`192.168.4.44-key.pem`) in the `nginx/` directory at the project root.

## 2. Dockerfile Changes
- Copy the certificate and key into the nginx container at `/etc/nginx/certs/`.
- Copy the public certificate into `/usr/share/nginx/html/certs/` to make it downloadable.
- Expose port 443 for HTTPS.

**Dockerfile excerpt:**
```dockerfile
# Remove the default config and drop in ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf

# Copy SSL cert and key for nginx
RUN mkdir -p /etc/nginx/certs
COPY nginx/192.168.4.44.pem /etc/nginx/certs/192.168.4.44.pem
COPY nginx/192.168.4.44-key.pem /etc/nginx/certs/192.168.4.44-key.pem

# Copy the compiled Angular files
COPY --from=builder /app/dist/filet-crochet-grid/browser /usr/share/nginx/html

# Make the public certificate available for download
RUN mkdir -p /usr/share/nginx/html/certs
COPY nginx/192.168.4.44.pem /usr/share/nginx/html/certs/192.168.4.44.pem

EXPOSE 80
EXPOSE 443
```

## 3. nginx.conf Changes
- Listen on both 80 (HTTP) and 443 (HTTPS).
- Use absolute paths for the certificate and key.
- Use a compatible regex for static asset caching.

**nginx.conf excerpt:**
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/certs/192.168.4.44.pem;
    ssl_certificate_key /etc/nginx/certs/192.168.4.44-key.pem;

    # ...existing config...

    # Cache hashed static assets aggressively
    location ~* \.[0-9a-f]+\.(js|css|woff2?|ttf|eot|svg|png|webp|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # ...existing config...
}
```

## 4. docker-compose.yml Changes
- Map both ports 80 and 443 from the host to the container.

**docker-compose.yml excerpt:**
```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "0.0.0.0:80:80"
      - "0.0.0.0:443:443"
    # ...existing config...
```

## 5. Build and Run
```sh
docker compose build frontend
docker compose up -d frontend
```

## 6. Downloading and Installing the Certificate

To trust your local HTTPS site on other devices, you need to install the public certificate:

### Download the Certificate
- Open your browser and go to:
  - `https://localhost/certs/192.168.4.44.pem`
- Or, from a terminal on the device:
  - `curl -k https://localhost/certs/192.168.4.44.pem -o 192.168.4.44.pem`
- If accessing from another device on your network, replace `localhost` with your server's IP address (e.g., `https://192.168.4.44/certs/192.168.4.44.pem`).

### Install the Certificate
- On most systems, double-clicking the `.pem` file will open the certificate manager and allow you to install it as a trusted certificate.
- For mobile devices, you may need to email the file to yourself or use AirDrop, then follow your device's instructions to install a CA certificate.
- For more help, see the [mkcert installation guide](https://github.com/FiloSottile/mkcert#installation).

## 7. Accessing the Website
- On your local server, open your browser and go to:
  - `https://localhost/`
- From another device on your network, use:
  - `https://<your-server-ip>/`
- If you see a security warning, make sure the certificate is installed and trusted on your device.

## 8. (Optional) HTTP to HTTPS Redirect
- Forcing HTTPS is recommended for production. Add a redirect in your `default.conf` if needed.

---

**Summary:**
- Certs are copied into the container for nginx and for download.
- nginx is configured for SSL and static asset caching.
- Both HTTP and HTTPS are exposed.
- The public cert is downloadable for easy installation on other devices.
- Access your site at `https://localhost/` or `https://<your-server-ip>/` after installing the certificate.
