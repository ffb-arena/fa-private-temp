# Florr-Arena

How to use  
Make sure you have Node.js, npm installed  
Run node index  
Go to localhost:9700  

## Files and folders

### [index.js](/index.js)

* Main server file
* Handles rooms, connections, minifying, and the main server loop

### [to-do.txt](/to-do.txt)

* To do list
* Includes bugs and mechanics to fix

### [lib](/lib)

* The meat of the server logic

#### [lib/consts.js](/lib/consts.js)

* All game constants, used in other files

#### [lib/files.js](/lib/files.js)

* List of public JavaScript files that need to be combined

#### [lib/functions.js](/lib/functions.js)

* All game functions, used in other files

#### [lib/packet-handler.js](/lib/packet-handler.js)

* The server WebSocket packet handler (recieving messages from client)

#### [lib/room.js](/lib/room.js)

* The server Room class
* Contains player spawning
* Contains the room update function
* Contains collision detection
* Contains sending data of viewable players to players

#### [lib/player](/lib/player)

* All server files associated with the player

##### [lib/player/flower.js](/lib/player/flower.js)

* The server Player class
* Handles movement, petal rotation, and petal lag

##### [lib/player/petal.js](/lib/player/petal.js)

* The server Petal class
* Handles updating petals

##### [lib/player/petal-stats.js](/lib/player/petal-stats.js)

* All petal statistics

##### [lib/player/collisions.js](/lib/player/collisions.js)

* Player-player collision handling

##### [lib/player/acc-offset.js](/lib/player/acc-offset.js)

* The server AccOffset class
* Applies acceleration offsets to players
* Ex. knockback
