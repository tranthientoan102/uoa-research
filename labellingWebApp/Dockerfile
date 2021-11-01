# Dockerfile

# base image
FROM node:14-alpine

# create & set working directory
#RUN mkdir -p /usr/src
WORKDIR /app

# copy source files
COPY . .

# install dependencies
RUN npm install

# start app
#RUN npm run build
EXPOSE 3000
CMD npm run dev