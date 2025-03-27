// A função é chamada quando a janela está totalmente carregada
window.onload = function() {
    // Obtém o canvas e o contexto
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    // Tempo e quadros por segundo
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    var initialized = false;
    
    // Imagens
    var images = [];
    var tileimage;
    
    // Variáveis globais para carregamento de imagens
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
    
    // Carregar imagens
    function loadImages(imagefiles) {
        // Inicializa variáveis
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        
        // Carrega as imagens
        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
            // Cria o objeto de imagem
            var image = new Image();
            
            // Adiciona o manipulador de evento onload
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    // Carregamento concluído
                    preloaded = true;
                }
            };
            
            // Define a URL da fonte da imagem
            image.src = imagefiles[i];
            
            // Salva no array de imagens
            loadedimages[i] = image;
        }
        
        // Retorna um array de imagens
        return loadedimages;
    }
    
    // Propriedades do nível
    var Level = function (columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        
        // Inicializa o array de tiles
        this.tiles = [];
        for (var i=0; i<this.columns; i++) {
            this.tiles[i] = [];
            for (var j=0; j<this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };
    
    // Gera um nível padrão com paredes
    Level.prototype.generate = function() {
        for (var i=0; i<this.columns; i++) {
            for (var j=0; j<this.rows; j++) {
                if (i == 0 || i == this.columns-1 ||
                    j == 0 || j == this.rows-1) {
                    // Adiciona paredes nas bordas do nível
                    this.tiles[i][j] = 1;
                } else {
                    // Adiciona espaço vazio
                    this.tiles[i][j] = 0;
                }
            }
        }
    };
    
    // Cobra
    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    }
    
    // Tabela de direções: Cima, Direita, Baixo, Esquerda
    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    // Inicializa a cobra em uma localização
    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction; // Cima, Direita, Baixo, Esquerda
        this.speed = speed;         // Velocidade de movimento em blocos por segundo
        this.movedelay = 0;
        
        // Redefine os segmentos e adiciona novos
        this.segments = [];
        this.growsegments = 0;
        for (var i=0; i<numsegments; i++) {
            this.segments.push({x:this.x - i*this.directions[direction][0],
                                y:this.y - i*this.directions[direction][1]});
        }
    }
    
    // Aumenta a contagem de segmentos
    Snake.prototype.grow = function() {
        this.growsegments++;
    };
    
    // Verifica se podemos mover
    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        if (this.movedelay > maxmovedelay) {
            return true;
        }
        return false;
    };
    
    // Obtém a posição do próximo movimento
    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return {x:nextx, y:nexty};
    }
    
    // Move a cobra na direção
    Snake.prototype.move = function() {
        // Obtém o próximo movimento e modifica a posição
        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;
    
        // Obtém a posição do último segmento
        var lastseg = this.segments[this.segments.length-1];
        var growx = lastseg.x;
        var growy = lastseg.y;
    
        // Move os segmentos para a posição do segmento anterior
        for (var i=this.segments.length-1; i>=1; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        
        // Cresce um segmento se necessário
        if (this.growsegments > 0) {
            this.segments.push({x:growx, y:growy});
            this.growsegments--;
        }
        
        // Move o primeiro segmento
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        // Redefine movedelay
        this.movedelay = 0;
    }

    // Cria objetos
    var snake = new Snake();
    var level = new Level(20, 15, 32, 32);
    
    // Variáveis
    var score = 0;              // Pontuação
    var gameover = true;        // O jogo acabou
    var gameovertime = 1;       // Quanto tempo estamos em game over
    var gameoverdelay = 0.5;    // Tempo de espera após game over
    
    // Inicializa o jogo
    function init() {
        // Carrega imagens
        images = loadImages(["snake-graphics.png"]);
        tileimage = images[0];
    
        // Adiciona eventos de mouse
        canvas.addEventListener("mousedown", onMouseDown);
        
        // Adiciona eventos de teclado
        document.addEventListener("keydown", onKeyDown);
        
        // Novo jogo
        newGame();
        gameover = true;
    
        // Entra no loop principal
        main(0);
    }
    
    // Verifica se podemos iniciar um novo jogo
    function tryNewGame() {
        if (gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
    }
    
    function newGame() {
        // Inicializa a cobra
        snake.init(10, 10, 1, 10, 4);
        
        // Gera o nível padrão
        level.generate();
        
        // Adiciona uma maçã
        addApple();
        
        // Inicializa a pontuação
        score = 0;
        
        // Inicializa variáveis
        gameover = false;
    }
    
    // Adiciona uma maçã ao nível em uma posição vazia
    function addApple() {
        // Loop até termos uma maçã válida
        var valid = false;
        while (!valid) {
            // Obtém uma posição aleatória
            var ax = randRange(0, level.columns-1);
            var ay = randRange(0, level.rows-1);
            
            // Certifica-se de que a cobra não sobreponha a nova maçã
            var overlap = false;
            for (var i=0; i<snake.segments.length; i++) {
                // Obtém a posição do segmento atual da cobra
                var sx = snake.segments[i].x;
                var sy = snake.segments[i].y;
                
                // Verifica sobreposição
                if (ax == sx && ay == sy) {
                    overlap = true;
                    break;
                }
            }
            
            // O tile deve estar vazio
            if (!overlap && level.tiles[ax][ay] == 0) {
                // Adiciona uma maçã na posição do tile
                level.tiles[ax][ay] = 2;
                valid = true;
            }
        }
    }
    
    // Loop principal
    function main(tframe) {
        // Solicita quadros de animação
        window.requestAnimationFrame(main);
        
        if (!initialized) {
            // Pré-carregador
            
            // Limpa o canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenha uma barra de progresso
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
            // Desenha o texto de progresso
            var loadtext = "Carregado " + loadcount + "/" + loadtotal + " imagens";
            context.fillStyle = "#000000";
            context.font = "16px Verdana";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                initialized = true;
            }
        } else {
            // Atualiza e renderiza o jogo
            update(tframe);
            render();
        }
    }
    
    // Atualiza o estado do jogo
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // Atualiza o contador de fps
        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }
    
    function updateGame(dt) {
        // Move a cobra
        if (snake.tryMove(dt)) {
            // Verifica colisões da cobra
            
            // Obtém as coordenadas do próximo movimento
            var nextmove = snake.nextMove();
            var nx = nextmove.x;
            var ny = nextmove.y;
            
            if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
                if (level.tiles[nx][ny] == 1) {
                    // Colisão com uma parede
                    gameover = true;
                }
                
                // Colisões com a própria cobra
                for (var i=0; i<snake.segments.length; i++) {
                    var sx = snake.segments[i].x;
                    var sy = snake.segments[i].y;
                    
                    if (nx == sx && ny == sy) {
                        // Encontrou uma parte da cobra
                        gameover = true;
                        break;
                    }
                }
                
                if (!gameover) {
                    // A cobra pode se mover

                    // Move a cobra
                    snake.move();
                    
                    // Verifica colisão com uma maçã
                    if (level.tiles[nx][ny] == 2) {
                        // Remove a maçã
                        level.tiles[nx][ny] = 0;
                        
                        // Adiciona uma nova maçã
                        addApple();
                        
                        // Faz a cobra crescer
                        snake.grow();
                        
                        // Adiciona um ponto à pontuação
                        score++;
                    }
                }
            } else {
                // Fora dos limites
                gameover = true;
            }
            
            if (gameover) {
                gameovertime = 0;
            }
        }
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calcula fps
            fps = Math.round(framecount / fpstime);
            
            // Redefine o tempo e o contador de quadros
            fpstime = 0;
            framecount = 0;
        }
        
        // Aumenta o tempo e o contador de quadros
        fpstime += dt;
        framecount++;
    }
    
    // Renderiza o jogo
    function render() {
        // Desenha o fundo
        context.fillStyle = "#577ddb";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawLevel();
        drawSnake();
            
        // Game over
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Pressione qualquer tecla para começar!", 0, canvas.height/2, canvas.width);
        }
    }
    
    // Desenha os tiles do nível
    function drawLevel() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Obtém o tile atual e a localização
                var tile = level.tiles[i][j];
                var tilex = i*level.tilewidth;
                var tiley = j*level.tileheight;
                
                // Desenha os tiles com base em seu tipo
                if (tile == 0) {
                    // Espaço vazio
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 1) {
                    // Parede
                    context.fillStyle = "#bcae76";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 2) {
                    // Maçã
                    
                    // Desenha o fundo da maçã
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                    
                    // Desenha a imagem da maçã
                    var tx = 0;
                    var ty = 3;
                    var tilew = 64;
                    var tileh = 64;
                    context.drawImage(tileimage, tx*tilew, ty*tileh, tilew, tileh, tilex, tiley, level.tilewidth, level.tileheight);
                }
            }
        }
    }
    
    // Desenha a cobra
    function drawSnake() {
        // Loop sobre cada segmento da cobra
        for (var i=0; i<snake.segments.length; i++) {
            var segment = snake.segments[i];
            var segx = segment.x;
            var segy = segment.y;
            var tilex = segx*level.tilewidth;
            var tiley = segy*level.tileheight;
            
            // Coluna e linha do sprite que são calculadas
            var tx = 0;
            var ty = 0;
            
            if (i == 0) {
                // Cabeça; Determina a imagem correta
                var nseg = snake.segments[i+1]; // Próximo segmento
                if (segy < nseg.y) {
                    // Cima
                    tx = 3; ty = 0;
                } else if (segx > nseg.x) {
                    // Direita
                    tx = 4; ty = 0;
                } else if (segy > nseg.y) {
                    // Baixo
                    tx = 4; ty = 1;
                } else if (segx < nseg.x) {
                    // Esquerda
                    tx = 3; ty = 1;
                }
            } else if (i == snake.segments.length-1) {
                // Cauda; Determina a imagem correta
                var pseg = snake.segments[i-1]; // Segmento anterior
                if (pseg.y < segy) {
                    // Cima
                    tx = 3; ty = 2;
                } else if (pseg.x > segx) {
                    // Direita
                    tx = 4; ty = 2;
                } else if (pseg.y > segy) {
                    // Baixo
                    tx = 4; ty = 3;
                } else if (pseg.x < segx) {
                    // Esquerda
                    tx = 3; ty = 3;
                }
            } else {
                // Corpo; Determina a imagem correta
                var pseg = snake.segments[i-1]; // Segmento anterior
                var nseg = snake.segments[i+1]; // Próximo segmento
                if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                    // Horizontal Esquerda-Direita
                    tx = 1; ty = 0;
                } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                    // Ângulo Esquerda-Baixo
                    tx = 2; ty = 0;
                } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                    // Vertical Cima-Baixo
                    tx = 2; ty = 1;
                } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                    // Ângulo Cima-Esquerda
                    tx = 2; ty = 2;
                } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                    // Ângulo Direita-Cima
                    tx = 0; ty = 1;
                } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                    // Ângulo Baixo-Direita
                    tx = 0; ty = 0;
                }
            }
            
            // Desenha a imagem da parte da cobra
            context.drawImage(tileimage, tx*64, ty*64, 64, 64, tilex, tiley,
                              level.tilewidth, level.tileheight);
        }
    }
    
    // Desenha texto que está centralizado
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    // Obtém um inteiro aleatório entre low e high, inclusivo
    function randRange(low, high) {
        return Math.floor(low + Math.random()*(high-low+1));
    }
    
    // Manipuladores de eventos do mouse
    function onMouseDown(e) {
        // Obtém a posição do mouse
        var pos = getMousePos(canvas, e);
        
        if (gameover) {
            // Inicia um novo jogo
            tryNewGame();
        } else {
            // Altera a direção da cobra
            snake.direction = (snake.direction + 1) % snake.directions.length;
        }
    }
    
    // Manipulador de eventos de teclado
    function onKeyDown(e) {
        if (gameover) {
            tryNewGame();
        } else {
            if (e.keyCode == 37 || e.keyCode == 65) {
                // Esquerda ou A
                if (snake.direction != 1)  {
                    snake.direction = 3;
                }
            } else if (e.keyCode == 38 || e.keyCode == 87) {
                // Cima ou W
                if (snake.direction != 2)  {
                    snake.direction = 0;
                }
            } else if (e.keyCode == 39 || e.keyCode == 68) {
                // Direita ou D
                if (snake.direction != 3)  {
                    snake.direction = 1;
                }
            } else if (e.keyCode == 40 || e.keyCode == 83) {
                // Baixo ou S
                if (snake.direction != 0)  {
                    snake.direction = 2;
                }
            }
            
            // Cresce para fins de demonstração
            if (e.keyCode == 32) {
                snake.grow();
            }
        }
    }
    
    // Obtém a posição do mouse
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Chama init para iniciar o jogo
    init();
};
