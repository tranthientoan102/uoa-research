# Dockerfile

# base image
FROM node:14-alpine

# create & set working directory
#RUN mkdir -p /usr/src
WORKDIR /app

# install dependencies
COPY ./package.json .
RUN npm install

# copy source files
COPY . .

#docker build -t test:1111 --build-arg BUILD_ARG=$NPM_RUN_ARG .
ARG BUILD_ARG
ENV buildArg=$BUILD_ARG
RUN echo $buildArg

#RUN echo $NPM_RUN_ARG

# start app
#RUN npm run build
EXPOSE 3000
CMD npm run $buildArg