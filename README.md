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

### [src](/src)

* The meat of the server logic

#### [src/consts.js](/src/consts.js)

* All game constants, used in other files

#### [src/files.js](/src/files.js)

* List of public JavaScript files that need to be combined

#### [src/functions.js](/src/functions.js)

* All game functions, used in other files

#### [src/packet-handler.js](/src/packet-handler.js)

* The server WebSocket packet handler (recieving messages from client)

#### [src/room.js](/src/room.js)

* The server Room class
* Contains player spawning
* Contains the room update function
* Contains collision detection
* Contains sending data of viewable players to players

#### [src/player](/src/player)

* All server files associated with the player

##### [src/player/flower.js](/src/player/flower.js)

* The server Player class
* Handles movement, petal rotation, and petal lag

##### [src/player/petal.js](/src/player/petal.js)

* The server Petal class
* Handles updating petals

##### [src/player/petal-stats.js](/src/player/petal-stats.js)

* All petal statistics

##### [src/player/collisions.js](/src/player/collisions.js)

* Player-player collision handling

##### [src/player/acc-offset.js](/src/player/acc-offset.js)

* The server AccOffset class
* Applies acceleration offsets to players
* Ex. knockback

### [public](/public)

* All public files

### [public/index.html](/public/index.html)

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

#### [public/src/game](/public/src/game)

* Folder for everything to do with the client game itself

##### [public/src/game/rendering.js](/public/src/game/rendering.js)

* All actual rendering functions called in the main loop

##### [public/src/game/player.js](/public/src/game/player.js)

* Client Player class
* Also instructions for drawing player

##### [public/src/game/petals.js](/public/src/game/petals.js)

* Const object with functions to render each petal

##### [public/src/game/dead-petal.js](/public/src/game/dead-petal.js)

* The DeadPetal class
* Makes the little "popping" petal animations when they die

##### [public/src/game/inventory.js](/public/src/game/inventory.js)

* Client inventory rendering

##### [public/src/game/florr-text.js](/public/src/game/florr-text.js)

* This file has a function which draws the text

If you've read down here and like this, you may also be interested in [viter](https://github.com/FeeshDev/viter)
