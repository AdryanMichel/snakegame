window.onload = function() {
    // Obtém o canvas e o contexto
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Definindo variáveis globais
    var normalSnakeImage;
    var fastSnakeImage;
    var snakeImage;

    var score = 0;
    var speedMultiplier = 1; // Multiplicador de velocidade da cobra
    var level = new Level(20, 15, 40, 40); // Exemplo de um nível com 20x15 tiles
    var snake = new Snake();

    // Carregar imagens
    function loadImages(imagefiles) {
        var loadedimages = [];
        for (var i = 0; i < imagefiles.length; i++) {
            var image = new Image();
            image.src = imagefiles[i];
            loadedimages[i] = image;
        }
        return loadedimages;
    }

    // Carregar as imagens da cobra
    function loadSnakeImages() {
        normalSnakeImage = new Image();
        normalSnakeImage.src = "snake-graphics.png"; // Imagem da cobra normal

        fastSnakeImage = new Image();
        fastSnakeImage.src = "maçadourada.png"; // Imagem da cobra rápida
    }

    // Inicializa o jogo
    function init() {
        loadSnakeImages(); // Carrega as imagens da cobra
        canvas.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        newGame();
        main();
    }

    // Inicializa o jogo
    function newGame() {
        snake.init(10, 10, 1, 10, 4);
        level.generate();
        score = 0;
        speedMultiplier = 1; // Reseta a velocidade
        snakeImage = normalSnakeImage; // Define a imagem inicial da cobra
    }

    // Atualiza a velocidade da cobra a cada 10 pontos
    function updateSpeed() {
        if (score >= 10) {
            speedMultiplier = 1.5; // Aumenta a velocidade da cobra
            snakeImage = fastSnakeImage; // Altera a imagem da cobra para a rápida
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

        // Atualiza a velocidade da cobra a cada 10 pontos
        updateSpeed();

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

    // Desenha a cobra (agora com a imagem alterada)
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

            // Usa a imagem apropriada para a cobra
            context.drawImage(snakeImage, tx * 16, ty * 16, 16, 16, tilex, tiley, level.tilewidth, level.tileheight);
        }
    }

    // Aumenta a pontuação e verifica se a cobra deve ficar mais rápida
    function increaseScore() {
        score++;
        if (score % 10 === 0) {
            updateSpeed(); // Verifica se a velocidade da cobra precisa ser aumentada
        }
    }

    // Chama a função para iniciar o jogo
    init();
};
