# ── Stage 1: build the Angular app ──────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: serve with nginx ────────────────────────────────────────────────
#FROM nginx:1.27-alpine
#
#
## Remove the default config and drop in ours
#RUN rm /etc/nginx/conf.d/default.conf
#COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf
#
## Copy SSL cert and key
#RUN mkdir -p /etc/nginx/certs
#COPY nginx/192.168.4.44.pem /etc/nginx/certs/192.168.4.44.pem
#COPY nginx/192.168.4.44-key.pem /etc/nginx/certs/192.168.4.44-key.pem
#
#
## Copy the compiled Angular files
#COPY --from=builder /app/dist/filet-crochet-grid/browser /usr/share/nginx/html
#
## Make the public certificate available for download
#RUN mkdir -p /usr/share/nginx/html/certs
#COPY nginx/192.168.4.44.pem /usr/share/nginx/html/certs/192.168.4.44.pem
#
#EXPOSE 80
#EXPOSE 443
#CMD ["nginx", "-g", "daemon off;"]

