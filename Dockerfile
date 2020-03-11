FROM node:lts-buster
RUN apt-get update \
    && apt-get upgrade \
    && apt-get install -y pdftk yarnpkg
ADD . /work
WORKDIR /work
RUN yarn \
    && yarn build
ENTRYPOINT yarn start
