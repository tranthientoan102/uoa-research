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

#echo $NPM_RUN_ARG; docker build -t test:1111 --build-arg BUILD_ARG=$NPM_RUN_ARG .;docker run --network host test:1111 npm run buildStart2
#asia.gcr.io/cobalt-entropy-272613/labellingwebapp:707bd36
ARG BUILD_ARG
ENV buildArg=$BUILD_ARG
RUN echo $buildArg

#RUN echo $NPM_RUN_ARG

# start app
#RUN npm run build
EXPOSE 3000

#CMD npm run $buildArg