import routes from "./questions/routes.js";
import "./database.js";
import express from "express";
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const port = 3001;
const validPositions = [];
const size = 7;
const server = http.createServer(app);

// Configurar CORS para Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",  // El origen permitido
        methods: ["GET", "POST"]  // Los métodos HTTP permitidos
    }
});

for (let i = 0; i < size; i++) {
    validPositions.push(i); // Primera fila
    validPositions.push(i + size * (size - 1)); // Última fila
}
for (let i = 1; i < size - 1; i++) {
    validPositions.push(i * size); // Primera columna (sin las esquinas que ya se añadieron)
    validPositions.push(i * size + (size - 1)); // Última columna (sin las esquinas que ya se añadieron)
}

app.use(cors()); // Habilitar CORS para Express
app.use("/Questions", routes);

let players = [];
let gameStarted = false;
let currentTurn = null;

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('login', (playerName) => {
        players.push({ id: socket.id, name: playerName, points: 0, ready: false, position: 0 });
        io.emit('updatePlayers', players);
    });

    socket.on('playerReady', () => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.ready = true;
            io.emit('updatePlayers', players);

            if (players.length >= 2 && players.every(p => p.ready) && !gameStarted) {
                gameStarted = true;
                currentTurn = players[0].id; 
                io.emit('gameStarted', { currentTurn, players });
                console.log("Game started");
            }
        }
    });

    socket.on('startGame', () => {
        if (!gameStarted) {
            gameStarted = true;
            currentTurn = players[0].id; 
            io.emit('gameStarted', { currentTurn, players });
        }
    });

    socket.on('rollDice', () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        io.emit('diceResult', { roll });
        const currentPlayer = players.find(player => player.id === socket.id);

        if (!currentPlayer) return;

        // Emitir el valor del dado a todos los jugadores

        // Calcular la nueva posición del jugador
        const currentPosition = validPositions.indexOf(currentPlayer.position);
        const newPosition = validPositions[(currentPosition + roll) % validPositions.length];

        currentPlayer.position = newPosition;

        // Verificar si el jugador ha pasado la casilla inicial
        if (newPosition === 0 || newPosition < currentPlayer.position) {
            io.emit('gameOver', { winner: currentPlayer.name });
        } else {
            // Actualizar a todos los jugadores sobre la nueva posición
            io.emit('updatePlayers', players);

            // Pasar el turno al siguiente jugador
            const nextPlayerIndex = (players.findIndex(player => player.id === socket.id) + 1) % players.length;
            io.emit('nextTurn', { currentTurn: players[nextPlayerIndex].id });
        }
    });

    socket.on('movePiece', ({ playerId, newPosition }) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
            player.position = newPosition;
            io.emit('updatePlayers', players);
        }
    });
    
    socket.on('endGame', ({ winner }) => {
        io.emit('endGame', { winner });
    });

    socket.on('disconnect', () => {
        const playerIndex = players.findIndex(player => player.id === socket.id);
        if (currentTurn === socket.id && players.length > 1) {
            const nextIndex = (playerIndex + 1) % players.length;
            currentTurn = players[nextIndex].id;
            io.emit('nextTurn', { currentTurn });
        }
        players = players.filter(player => player.id !== socket.id);
        io.emit('updatePlayers', players);
        console.log(`Player with socket ID ${socket.id} disconnected`);
    });
});


server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
