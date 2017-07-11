FROM node:6-slim

MAINTAINER MEAN.JS

# 80 = HTTP, 443 = HTTPS, 3000 = MEAN.JS server, 35729 = livereload, 8080 = node-inspector
EXPOSE 80 443

# Set development environment as default
ENV NODE_ENV production
RUN mkdir -p /opt/mean.js/public/lib
WORKDIR /opt/mean.js

# Install Utilities
RUN apt-get update -q  \
 && apt-get install -yqq \
     git \
     gcc \
     make \
     build-essential \
     libkrb5-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY . /opt/mean.js

# Install MEAN.JS Prerequisites
RUN npm install --quiet -g grunt grunt-cli eslint bower
  && npm install --quiet --production
  && npm cache clean
  && bower install --quiet --allow-root --config.interactive=false
  && grunt build

CMD ["node server.js"]
