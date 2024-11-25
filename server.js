const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 服务静态文件
app.use(express.static(__dirname));

// 存储所有玩家信息
const players = new Map();
// 存储游戏状态
let gameState = {
    foods: [
        { x: 15, y: 15 },
        { x: 5, y: 5 }
    ],
    obstacles: [],
    players: new Map()
};

// 初始化障碍物
function initObstacles() {
    const obstacleCount = 8;
    const gridSize = 20;
    const tileCount = 20; // 400/20 = 20

    gameState.obstacles = [];
    for (let i = 0; i < obstacleCount; i++) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (
            gameState.obstacles.some(obs => 
                obs.x === position.x && obs.y === position.y
            )
        );
        gameState.obstacles.push(position);
    }
}

// 生成随机食物位置
function randomizeFoodPosition(foodIndex) {
    const tileCount = 20;
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        gameState.obstacles.some(obs => 
            obs.x === position.x && obs.y === position.y
        ) ||
        gameState.foods.some((food, index) => 
            index !== foodIndex && food.x === position.x && food.y === position.y
        )
    );
    gameState.foods[foodIndex] = position;
}

// 初始化游戏状态
initObstacles();
gameState.foods.forEach((_, index) => randomizeFoodPosition(index));

// 广播游戏状态给所有玩家
function broadcastGameState() {
    const gameStateJSON = JSON.stringify({
        type: 'gameState',
        state: {
            foods: gameState.foods,
            obstacles: gameState.obstacles,
            players: Array.from(gameState.players.entries()).map(([id, player]) => ({
                id,
                username: player.username,
                snake: player.snake,
                score: player.score
            }))
        }
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gameStateJSON);
        }
    });
}

wss.on('connection', (ws) => {
    let playerId = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'login':
                // 生成唯一的玩家ID
                playerId = data.username + '_' + Math.random().toString(36).substr(2, 9);
                
                // 检查用户名是否已存在
                const isUsernameTaken = Array.from(players.values()).some(
                    player => player.username === data.username
                );
                
                if (isUsernameTaken) {
                    ws.send(JSON.stringify({
                        type: 'loginError',
                        message: '该用户名已被使用'
                    }));
                    return;
                }

                // 存储玩家信息
                players.set(playerId, {
                    ws,
                    username: data.username
                });
                
                // 为新玩家随机生成初始位置
                const tileCount = 20;
                const randomX = Math.floor(Math.random() * (tileCount - 5)) + 2;
                const randomY = Math.floor(Math.random() * (tileCount - 5)) + 2;
                
                // 初始化玩家的蛇
                gameState.players.set(playerId, {
                    username: data.username,
                    snake: {
                        x: randomX,
                        y: randomY,
                        dx: 1,
                        dy: 0,
                        cells: [
                            {x: randomX, y: randomY},
                            {x: randomX-1, y: randomY},
                            {x: randomX-2, y: randomY},
                            {x: randomX-3, y: randomY}
                        ],
                        maxCells: 4
                    },
                    score: 0
                });

                // 发送登录成功消息
                ws.send(JSON.stringify({
                    type: 'loginSuccess',
                    playerId: playerId,
                    gameState: gameState
                }));

                // 广播游戏状态给所有玩家
                broadcastGameState();
                break;

            case 'update':
                if (playerId && gameState.players.has(playerId)) {
                    const player = gameState.players.get(playerId);
                    player.snake = data.snake;
                    player.score = data.score;
                    gameState.players.set(playerId, player);
                    broadcastGameState();
                }
                break;

            case 'direction':
                if (playerId && gameState.players.has(playerId)) {
                    const player = gameState.players.get(playerId);
                    player.snake.dx = data.dx;
                    player.snake.dy = data.dy;
                    gameState.players.set(playerId, player);
                    broadcastGameState();
                }
                break;
        }
    });

    ws.on('close', () => {
        if (playerId) {
            players.delete(playerId);
            gameState.players.delete(playerId);
            broadcastGameState();
        }
    });
});

// 设置端口并启动服务器
const port = process.env.PORT || 3000;

// 错误处理
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`WebSocket server is initialized`);
    console.log(`You can access the game at: http://localhost:${port}`);
});
