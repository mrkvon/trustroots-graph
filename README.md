#Trustroots graph

This script finds users of [trustroots.org](https://www.trustroots.org) and their connection to other users.

It crawls through the trustroots network searching users and their connections.
Users without connection to the main network will not be found.

##Prerequisities

Node.js supporting ES2016 installed

Node Package Manager (npm) installed

##Installation

1. clone this repository
2. run the following commands in terminal in the folder of the repository

		npm install
                npm run prepare

##Usage

- run `npm start`
- provide your login data
- provide a username where the scraper should start (defaults to your username)
- watch the data scraper work. When it finishes, you'll find list of connected users in `output/users.txt` and a graph in `.gdf` format in `output/graph.gdf`
- play with the data (i.e. with [gephi](https://gephi.org/))

##To do

- time development of the network
- shortest path between users

##License
MIT
