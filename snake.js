window.onload = function() {
    // Obtém o canvas e o contexto
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Define o tamanho do canvas para a tela inteira
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Atualiza o nível com o novo tamanho do canvas
        level.tilewidth = Math.floor(canvas.width / 20); // Ajusta o tamanho dos tiles
        level.tileheight = Math.floor(canvas.height / 15); // Ajusta o tamanho dos tiles
    }

    // Chama a função de redimensionamento quando a janela for redimensionada
    window.addEventListener('resize', resizeCanvas);

    // Chama resizeCanvas inicialmente
    resizeCanvas();

    // Variáveis de tempo e FPS
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;

    // Imagens
    var images = [];
    var tileimage;

    // Variáveis globais para carregamento de imagens
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;

    // Carregar imagens
    function loadImages(imagefiles) {
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;

        var loadedimages = [];
        for (var i = 0; i < imagefiles.length; i++) {
            var image = new Image();
            image.onload = function() {
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

    // Propriedades do nível
    var Level = function(columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        this.tiles = [];
        for (var i = 0; i < this.columns; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };

    // Gera um nível padrão com paredes
    Level.prototype.generate = function() {
        for (var i = 0; i < this.columns; i++) {
            for (var j = 0; j < this.rows; j++) {
                if (i == 0 || i == this.columns - 1 || j == 0 || j == this.rows - 1) {
                    this.tiles[i][j] = 1; // Paredes nas bordas
                } else {
                    this.tiles[i][j] = 0; // Espaço vazio
                }
            }
        }
    };

    // Cobra
    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    };

    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.movedelay = 0;
        this.segments = [];
        this.growsegments = 0;
        for (var i = 0; i < numsegments; i++) {
            this.segments.push({
                x: this.x - i * this.directions[direction][0],
                y: this.y - i * this.directions[direction][1]
            });
        }
    };

    Snake.prototype.grow = function() {
        this.growsegments++;
    };

    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        return this.movedelay > maxmovedelay;
    };

    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return { x: nextx, y: nexty };
    };

    Snake.prototype.move = function() {
        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;

        var lastseg = this.segments[this.segments.length - 1];
        var growx = lastseg.x;
        var growy = lastseg.y;

        for (var i = this.segments.length - 1; i >= 1; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }

        if (this.growsegments > 0) {
            this.segments.push({ x: growx, y: growy });
            this.growsegments--;
        }

        this.segments[0].x = this.x;
        this.segments[0].y = this.y;

        this.movedelay = 0;
    };

    // Inicializa o jogo
    function init() {
        images = loadImages(["snake-graphics.png"]);
        tileimage = images[0];
        canvas.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        newGame();
        gameover = true;
        main(0);
    }

    function newGame() {
        snake.init(10, 10, 1, 10, 4);
        level.generate();
        addApple();
        score = 0;
        gameover = false;
    }

    // Desenha o nível
    function drawLevel() {
        for (var i = 0; i < level.columns; i++) {
            for (var j = 0; j < level.rows; j++) {
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

    // Desenha a cobra
    function drawSnake() {
        for (var i = 0; i < snake.segments.length; i++) {
            var segment = snake.segments[i];
            var segx = segment.x;
            var segy = segment.y;
            var tilex = segx * level.tilewidth;
            var tiley = segy * level.tileheight;

            var tx = 0;
            var ty = 0;

            if (i == 0) {
                var nseg = snake.segments[i + 1];
                if (segy < nseg.y) {
                    tx = 3;
                    ty = 0;
                } else if (segx > nseg.x) {
                    tx = 4;
                    ty = 0;
                } else if (segy > nseg.y) {
                    tx = 4;
                    ty = 1;
                } else if (segx < nseg.x) {
                    tx = 3;
                    ty = 1;
                }
            } else if (i == snake.segments.length - 1) {
                var pseg = snake.segments[i - 1];
                if (pseg.y < segy) {
                    tx = 3;
                    ty = 2;
                } else if (pseg.x > segx) {
                    tx = 4;
                    ty = 2;
                } else if (pseg.y > segy) {
                    tx = 4;
                    ty = 3;
                } else if (pseg.x < segx) {
                    tx = 3;
                    ty = 3;
                }
            } else {
                var pseg = snake.segments[i - 1];
                var nseg = snake.segments[i + 1];
                if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                    tx = 1;
                    ty = 0;
                } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                    tx = 2;
                    ty = 0;
                } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                    tx = 2;
                    ty = 1;
                } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                    tx = 1;
                    ty = 1;
                }
            }

            context.drawImage(tileimage, tx * 16, ty * 16, 16, 16, tilex, tiley, level.tilewidth, level.tileheight);
        }
    }

    // Função principal de atualização do jogo
    function main() {
        var now = Date.now();
        var dt = (now - lastframe) / 1000;
        lastframe = now;

        fpstime += dt;
        framecount++;
        if (fpstime >= 1) {
            fps = framecount;
            framecount = 0;
            fpstime -= 1;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawLevel();
        drawSnake();

        if (!gameover) {
            updateGame(dt);
        }

        if (gameover) {
            context.fillStyle = "black";
            context.font = "30px Arial";
            context.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
        } else {
            context.fillStyle = "black";
            context.font = "16px Arial";
            context.fillText("Score: " + score, 10, 20);
        }

        requestAnimationFrame(main);
    }

    // Inicia o jogo
    init();
};
