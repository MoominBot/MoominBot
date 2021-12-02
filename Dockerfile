FROM node:16-bullseye-slim


# Creating workdir and copying the config and lock files for poetry
WORKDIR /code
COPY yarn.lock /code/

# Installing the js dependencieuis
RUN yarn 

# Running the bot
COPY . /code
RUN chmod +x entrypoint.sh
ENTRYPOINT [ "sh", "entrypoint.sh" ]
