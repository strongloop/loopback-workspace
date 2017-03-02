FROM ibmcom/ibmnode

  RUN mkdir -p /usr/src/app
  WORKDIR /usr/src/app
  ENV NODE_ENV bluemix
  COPY package.json /usr/src/app/
  RUN npm install
  COPY . /usr/src/app
  EXPOSE 3000
  CMD ["npm", "start"]
