#Trustroots graph
This script finds users of [trustroots.org](https://www.trustroots.org) and their connection to other users.
It crawls through the trustroots network searching users and their connections.
Users without connection to the main network will not be found.

##Prerequisities

nodejs installed
node package manager (npm) installed

##Installation

1. clone this repository
2. run the following commands in terminal in the folder of the repository

		npm install
		mkdir secret
		mkdir output
		touch output/users.txt
		touch output/graph.gdf

3. create a file secret/login.json with following content

		{
			"username": "[valid trustroots username]",
			"password": "[valid password]"
		}
	
##Usage

- run `npm start`
- watch the data scraper work. When it finishes, you'll find list of found users in `output/users.txt` and a graph in `.gdf` format in `output/graph.gdf`
- play with the data (i.e. with [gephi](https://gephi.org/))

##To do

- shortest path between users
- easier installation
- comments and nicer code

##License
MIT