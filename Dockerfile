FROM node:19 AS builder

ARG VITE_AUTH_URL=https://auth.aptible.com
ARG VITE_BILLING_URL=https://goldenboy.aptible.com
ARG VITE_API_URL=https://api.aptible.com
ARG NODE_ENV=production

RUN corepack enable
RUN corepack prepare yarn@stable --activate

ADD package.json /app/
ADD yarn.lock /app/
WORKDIR /app

RUN yarn install --immutable
ADD . /app

RUN env | grep VITE

RUN yarn build

FROM nginx:1.13.11 as nginx

ENV BUILD=/app
ENV PORT=80

COPY --from=builder /app/dist "$BUILD"

RUN apt-get update && apt-get install -y curl
WORKDIR /app
ADD ./nginx.conf /etc/nginx/nginx.conf
EXPOSE $PORT
