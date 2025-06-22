FROM node:18.19.0

# Copy over the package.json file
COPY package.json .

# Install the packages
RUN npm install
RUN npm install -g serve

# Copy over the rest of the files
COPY . .

# Build the app
RUN npm run build

EXPOSE 2003

CMD ["npm", "run", "serve"]