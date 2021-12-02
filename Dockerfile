FROM node:16-bullseye-slim


# Creating workdir and copying the lock files 
WORKDIR /code
COPY yarn.lock /code/

# Installing the js dependencieuis
RUN yarn 

# Running the bot
COPY . /code
RUN chmod +x entrypoint.sh
ENTRYPOINT [ "sh", "entrypoint.sh" ]
