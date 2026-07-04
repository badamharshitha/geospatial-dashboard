FROM nginx:1.27-alpine
RUN apk add --no-cache curl
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
