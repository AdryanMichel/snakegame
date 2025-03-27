window.onload = function() {
    // Obtém o canvas e o contexto
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Definindo variáveis globais
    var snakeImage;
    var goldenAppleImage;
    var score = 0;
    var speedMultiplier = 1; // Multiplicador de velocidade da cobra
    var goldenApple = null; // Inicialmente, sem maçã dourada
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

    // Carregar as imagens da cobra e da maçã dourada
    function loadGameImages() {
        snakeImage = new Image();
        snakeImage.src = "snake-graphics.png"; // Imagem da cobra normal

        goldenAppleImage = new Image();
        goldenAppleImage.src = "maçadourada.png"; // Imagem da maçã dourada
    }

    // Inicializa o jogo
    function init() {
        loadGameImages(); // Carrega as imagens da cobra e da maçã dourada
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
        goldenApple = generateGoldenApple(); // Gera a primeira maçã dourada
    }

    // Gera a maçã dourada em uma posição aleatória
    function generateGoldenApple() {
        var x = Math.floor(Math.random() * level.width);
        var y = Math.floor(Math.random() * level.height);
        return { x: x, y: y };
    }

    // Atualiza a velocidade da cobra
    function updateSpeed() {
        if (score >= 10) {
            speedMultiplier = 1.5; // Aumenta a velocidade da cobra
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
        drawGoldenApple();

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

            // Desenha a cobra (mesmo comportamento anterior)
            context.drawImage(snakeImage, tx * 16, ty * 16, 16, 16, tilex, tiley, level.tilewidth, level.tileheight);
        }
    }

    // Desenha a maçã dourada
    function drawGoldenApple() {
        var tilex = goldenApple.x * level.tilewidth;
        var tiley = goldenApple.y * level.tileheight;

        context.drawImage(goldenAppleImage, tilex, tiley, level.tilewidth, level.tileheight);
    }

    // Aumenta a pontuação e verifica se a cobra deve ficar mais rápida
    function increaseScore() {
        score++;
        if (score % 10 === 0) {
            updateSpeed(); // Verifica se a velocidade da cobra precisa ser aumentada
        }
    }

    // Verifica se a cobra comeu a maçã dourada
    function checkForGoldenAppleCollision() {
        if (snake.head.x === goldenApple.x && snake.head.y === goldenApple.y) {
            increaseScore();
            goldenApple = generateGoldenApple(); // Gera uma nova maçã dourada
            speedMultiplier = 1.5; // Aumenta a velocidade da cobra
        }
    }

    // Chama a função para iniciar o jogo
    init();
};
