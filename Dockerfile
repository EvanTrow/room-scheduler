# Pull base image.
FROM node:18-alpine

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY index.ts index.ts
COPY dist dist

# install deps
RUN npm install

# Expose ports
EXPOSE 8080

CMD [ "npm", "start" ]

VOLUME '/app'