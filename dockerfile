## NODE SERVICE
FROM node:18.12.1
WORKDIR /app
COPY . .
RUN yarn

## EXPOSE
EXPOSE 8080
CMD ["yarn", "vite"]