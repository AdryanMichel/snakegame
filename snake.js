window.onload = function() {
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    var initialized = false;
    
    var images = [];
    var tileimage;
    
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
    
    // Função para gerar número aleatório entre min e max
    function randRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function loadImages(imagefiles) {
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        
        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
            var image = new Image();
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    preloaded = true;
                }
            };
            image.src = imagefiles[i];
            loadedimages[i] = image;
        }
        return loadedimages;
    }

    var Level = function (columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        this.tiles = [];
        for (var i=0; i<this.columns; i++) {
            this.tiles[i] = [];
            for (var j=0; j<this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };

    Level.prototype.generate = function() {
        for (var i=0; i<this.columns; i++) {
            for (var j=0; j<this.rows; j++) {
                if (i == 0 || i == this.columns-1 ||
                    j == 0 || j == this.rows-1) {
                    this.tiles[i][j] = 1;
                } else {
                    this.tiles[i][j] = 0;
                }
            }
        }
    };

    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    }

    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.movedelay = 0;
        this.segments = [];
        this.growsegments = 0;
        for (var i=0; i<numsegments; i++) {
            this.segments.push({x:this.x - i*this.directions[direction][0],
                                y:this.y - i*this.directions[direction][1]});
        }
    }

    Snake.prototype.grow = function() {
        this.growsegments++;
    };

    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        if (this.movedelay > maxmovedelay) {
            return true;
        }
        return false;
    };

    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return {x:nextx, y:nexty};
    }

    Snake.prototype.move = function() {
        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;
    
        var lastseg = this.segments[this.segments.length-1];
        var growx = lastseg.x;
        var growy = lastseg.y;
    
        for (var i=this.segments.length-1; i>=1; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        
        if (this.growsegments > 0) {
            this.segments.push({x:growx, y:growy});
            this.growsegments--;
        }
        
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        this.movedelay = 0;
    }

    var snake = new Snake();
    var level = new Level(20, 15, 32, 32);
    
    var score = 0;              
    var gameover = true;        
    var gameovertime = 1;       
    var gameoverdelay = 0.5;    

    function init() {
        images = loadImages(["snake-graphics.png"]);
        tileimage = images[0];
    
        canvas.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        
        newGame();
        gameover = true;
    
        main(0);
    }

    function tryNewGame() {
        if (gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
    }

    function newGame() {
        snake.init(10, 10, 1, 10, 4);
        level.generate();
        addApple();
        score = 0;
        gameover = false;
    }

    function addApple() {
        var valid = false;
        while (!valid) {
            var ax = randRange(0, level.columns-1);
            var ay = randRange(0, level.rows-1);
            
            var overlap = false;
            for (var i=0; i<snake.segments.length; i++) {
                var sx = snake.segments[i].x;
                var sy = snake.segments[i].y;
                if (ax == sx && ay == sy) {
                    overlap = true;
                    break;
                }
            }
            
            if (!overlap && level.tiles[ax][ay] == 0) {
                level.tiles[ax][ay] = 2;
                valid = true;
            }
        }
    }

    function main(tframe) {
        window.requestAnimationFrame(main);
        
        if (!initialized) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
            var loadtext = "Carregado " + loadcount + "/" + loadtotal + " imagens";
            context.fillStyle = "#000000";
            context.font = "16px Verdana";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                initialized = true;
            }
        } else {
            update(tframe);
            render();
        }
    }

    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }

    function updateGame(dt) {
        if (snake.tryMove(dt)) {
            var nextmove = snake.nextMove();
            var nx = nextmove.x;
            var ny = nextmove.y;
            
            if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
                if (level.tiles[nx][ny] == 1) {
                    gameover = true;
                }
                
                for (var i=0; i<snake.segments.length; i++) {
                    var sx = snake.segments[i].x;
                    var sy = snake.segments[i].y;
                    if (nx == sx && ny == sy) {
                        gameover = true;
                        break;
                    }
                }
                
                if (!gameover) {
                    snake.move();
                    
                    if (level.tiles[nx][ny] == 2) {
                        level.tiles[nx][ny] = 0;
                        addApple();
                        snake.grow();
                        score++;
                    }
                }
            } else {
                gameover = true;
            }
        } else {
            gameover = true;
        }
    }

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawLevel();
        drawSnake();
        drawScore();
    }

    function drawLevel() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                var tile = level.tiles[i][j];
                var tilex = i * level.tilewidth;
                var tiley = j * level.tileheight;
                if (tile == 0) {
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 1) {
                    context.fillStyle = "#bcae76";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 2) {
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                    
                    var tx = 0;
                    var ty = 3;
                    var tilew = 64;
                    var tileh = 64;
                    context.drawImage(tileimage, tx * tilew, ty * tileh, tilew, tileh, tilex, tiley, level.tilewidth, level.tileheight);
                }
            }
        }
    }

    function drawSnake() {
        for (var i = 0; i < snake.segments.length; i++) {
            var sx = snake.segments[i].x;
            var sy = snake.segments[i].y;
            var segmentX = sx * level.tilewidth;
            var segmentY = sy * level.tileheight;
            
            context.fillStyle = "#00ff00";  // Cor da cobra
            context.fillRect(segmentX, segmentY, level.tilewidth, level.tileheight);
        }
    }

    function drawScore() {
        document.getElementById("score").textContent = "Pontuação: " + score;
    }

    function onKeyDown(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (snake.direction !== 2) snake.direction = 0;
                break;
            case 'ArrowRight':
                if (snake.direction !== 3) snake.direction = 1;
                break;
            case 'ArrowDown':
                if (snake.direction !== 0) snake.direction = 2;
                break;
            case 'ArrowLeft':
                if (snake.direction !== 1) snake.direction = 3;
                break;
        }
    }

    function onMouseDown(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Detecta cliques nas setas de controle
        if (x >= 240 && x <= 280 && y >= 400 && y <= 440) {
            if (snake.direction !== 2) snake.direction = 0;
        }
        if (x >= 200 && x <= 240 && y >= 440 && y <= 480) {
            if (snake.direction !== 1) snake.direction = 1;
        }
        if (x >= 240 && x <= 280 && y >= 440 && y <= 480) {
            if (snake.direction !== 0) snake.direction = 2;
        }
        if (x >= 280 && x <= 320 && y >= 440 && y <= 480) {
            if (snake.direction !== 3) snake.direction = 3;
        }
    }
    
    init();
}
