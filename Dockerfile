FROM mhart/alpine-node:12

# Create app directory
WORKDIR /usr/src/app/

# Copy all files into image
COPY . ./

# install packages
RUN npm install

# create react build
RUN npm run build

# tell node is docker
ENV IS_DOCKER_CONTAINER yes

# timezone
ENV TZ=America/New_York
RUN apk --update add \
		tzdata \
	&& cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apk del tzdata


EXPOSE 8080
CMD [ "npm", "start" ]