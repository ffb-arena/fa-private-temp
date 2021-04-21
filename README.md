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

### [public](/public)

* All public files

### [public/stuff.html](/public/stuff.html)

* The main game client HTML file

### [public/styles.css](/public/styles.css)

* The CSS file for the above HTML file

### [public/credits.html](/public/credits.html)

* The client credit HTML file

### [public/changelog.html](/public/changelog.html)

* The client changelog HTML file

### [public/index.js](/public/index.js)

* The main client JavaScript file
* Sets all input event listeners
* Has the main loop

### [public/lib](/public/lib)

* The other client files
* All combined on the server

#### [public/lib/menu.js](/public/lib/menu.js)

* Event listeners and logic for the main menu

#### [public/lib/petal-background.js](/public/lib/petal-background.js)

* Code for the floating background on the main menu

#### [public/lib/ws.js](/public/lib/ws.js)

* Initializes client WebSocket and handles messages
* Controls a loading screen until the WebSocket opens

#### [public/lib/game](/public/lib/game)

* Folder for everything to do with the client game itself

##### [public/lib/game/rendering.js](/public/lib/game/rendering.js)

* All actual rendering functions called in the main loop

##### [public/lib/game/player.js](/public/lib/game/player.js)

* Client Player class
* Also instructions for drawing player

##### [public/lib/game/petals.js](/public/lib/game/petals.js)

* Const object with functions to render each petal
