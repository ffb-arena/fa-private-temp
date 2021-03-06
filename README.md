# Florr-Arena

## How to use  
Make sure you have [Node.js](https://nodejs.org/en/download/) installed  
cd to the root where you cloned this/downloaded the files  
Run `npm i` followed by `node index`  
Go to localhost:9700  

## Files and folders

### [index.js](/index.js)

* Main server file
* Handles rooms, connections, minifying, and the main server loop

### [macros.js](/macros.js)

* The "macros" that preprocess the client code
* Should be read before reading any client code

### [to-do.txt](/to-do.txt)

* To do list
* Includes bugs and mechanics to fix

### [server](/server)

* The meat of the server logic

#### [server/consts.js](/server/consts.js)

* All game constants, used in other files

#### [server/enums.js](/server/enums.js)

* Some enums for the other files

#### [server/files.js](/server/files.js)

* List of public JavaScript files that need to be combined

#### [server/functions.js](/server/functions.js)

* General game functions, used in other files

#### [server/packet-handler.js](/server/packet-handler.js)

* The server WebSocket packet handler (recieving messages from client)

#### [server/room.js](/server/room.js)

* The server Room class
* Contains player spawning
* Contains the room update function
* Contains collision detection
* Contains sending data of viewable players to players

#### [server/player](/server/player)

* All server files associated with the player

##### [server/player/flower.js](/server/player/flower.js)

* The server Player class
* Handles movement, petal rotation, and petal lag

##### [server/player/petal.js](/server/player/petal.js)

* The server Petal class
* Handles updating petals

##### [server/player/petal-stats.js](/server/player/petal-stats.js)

* All petal statistics

##### [server/player/debuff.js](/server/player/debuff.js)

* The class for debuffs
* Currently contains poison, would also contain honey debuff, dandelion debuff etc.

##### [server/player/collisions.js](/server/player/collisions.js)

* Player-player collision handling

##### [server/player/acc-offset.js](/server/player/acc-offset.js)

* The server AccOffset class
* Applies acceleration offsets to players
* Ex. knockback

### [public](/public)

* All public files

### [public/index.html](/public/index.html)

* The main game client HTML file

### [public/styles.css](/public/styles.css)

* The CSS file for the HTML files

### [public/credits.html](/public/credits.html)

* The client credit HTML file

### [public/changelog.html](/public/changelog.html)

* The client changelog HTML file

### [public/index.js](/public/index.js)

* The main client JavaScript file
* Sets all input event listeners
* Has the main loop

### [public/src](/public/src)

* The other client files
* All combined on the server

#### [public/src/menu.js](/public/src/menu.js)

* Event listeners and logic for the main menu

#### [public/src/petal-background.js](/public/src/petal-background.js)

* Code for the floating background on the main menu

#### [public/src/ws.js](/public/src/ws.js)

* Initializes client WebSocket and handles messages
* Controls a loading screen until the WebSocket opens

#### [public/src/florr-text.js](/public/src/florr-text.js)

* Contains a function to draw text
* Is pretty bad

#### [public/src/game](/public/src/game)

* Folder for everything to do with the client game itself

##### [public/src/game/rendering.js](/public/src/game/rendering.js)

* All actual rendering functions called in the main loop

##### [public/src/game/player.js](/public/src/game/player.js)

* Client Player class
* Also instructions for drawing player

##### [public/src/game/petals.js](/public/src/game/petals.js)

* Const object with functions to render each petal
* Keeps track of petal rarities
* Petal rarity colours
* Petal names

##### [public/src/game/dead-petal.js](/public/src/game/dead-petal.js)

* The DeadPetal class
* Makes the little "popping" petal animations when they die

##### [public/src/game/inventory.js](/public/src/game/inventory.js)

* Client inventory rendering

If you've read down here and like this, you may also be interested in [viter](https://github.com/FeeshDev/viter)
