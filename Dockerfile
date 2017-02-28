FROM nginx
COPY lib /usr/share/nginx/html/lib
COPY images /usr/share/nginx/html/images
COPY src /usr/share/nginx/html/src
COPY stylesheets /usr/share/nginx/html/stylesheets
COPY index.html /usr/share/nginx/html
COPY app.css /usr/share/nginx/html
COPY app.js /usr/share/nginx/html
