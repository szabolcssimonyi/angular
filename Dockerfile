FROM node:11.3 as build-stage


# Puppeteer dependencies, from: https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

WORKDIR /app
RUN ls
COPY /testClient/package*.json /app/

RUN npm install

COPY testClient/ /app/

# RUN npm run test -- --browsers ChromeHeadlessNoSandbox --watch=false

RUN npm run build-prod --output-path=./dist

WORKDIR /app/dist

FROM nginx:1.11

COPY --from=build-stage /app/dist/ /sites/test
COPY --from=build-stage /app/src/assets/ /sites/test/assets
COPY --from=build-stage /app/nginx.conf /etc/nginx/nginx.conf
