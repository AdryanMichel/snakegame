// Adicionar variável para contar maçãs normais
var normalAppleCount = 0;

// Modificar a função addApple()
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

        // Se for a 10ª maçã normal, cria uma maçã dourada
        if (!overlap && level.tiles[ax][ay] == 0) {
            if (normalAppleCount >= 10) {
                // Adiciona maçã dourada (valor 3)
                level.tiles[ax][ay] = 3;
                normalAppleCount = 0;  // Reinicia a contagem
            } else {
                // Adiciona maçã normal (valor 2)
                level.tiles[ax][ay] = 2;
            }
            valid = true;
        }
    }
}

// Modificar o comportamento ao comer uma maçã
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

                // Verifica colisão com maçãs
                if (level.tiles[nx][ny] == 2) {
                    // Maçã normal
                    level.tiles[nx][ny] = 0;
                    addApple();
                    snake.grow();
                    score++;
                    normalAppleCount++;  // Incrementa o contador de maçãs normais
                } else if (level.tiles[nx][ny] == 3) {
                    // Maçã dourada
                    level.tiles[nx][ny] = 0;
                    addApple();
                    snake.grow();
                    score += 10;  // Dá 10 pontos pela maçã dourada
                    normalAppleCount = 0;  // Reseta a contagem de maçãs normais
                    snake.speed *= 2;  // Dobra a velocidade da cobra
                }
            }
        } else {
            gameover = true;
        }

        if (gameover) {
            gameovertime = 0;
        }
    }
}
