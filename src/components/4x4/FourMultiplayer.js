import React, { useState, useEffect } from 'react';
import { AiOutlineHistory, AiOutlineClockCircle, AiOutlineTrophy, AiOutlineReload, AiOutlineFire, AiOutlineCrown } from 'react-icons/ai';
import Board from './Board';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';



// Define light and dark themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const FourMultiplayer = () => {
  const [playerX, setPlayerX] = useState('Player X');
  const [playerO, setPlayerO] = useState('Player O');
  const [isDarkMode, setIsDarkMode] = useState(false);


  const [game, setGame] = useState({
    board: [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
    currentPlayer: 'X',
    winner: null,
    isDraw: false,
    gameId: null,
    moveHistory: [],
    stepNumber: 0,
    playerXWins: 0,
    playerOWins: 0,
    ties: 0,
    totalGames: 0,
    averageGameDuration: 0,
  });
  

  useEffect(() => {
    createNewGame();
  }, []);

  const createNewGame = async () => {
    try {
      const response = await fetch('https://tic-tac-toe-sypn.onrender.com/api/gamess/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const newGame = await response.json();
        setGame((prevGame) => ({
          ...prevGame,
          ...newGame,
          gameId: newGame._id,
          moveHistory: [],
          stepNumber: 0,
          totalGames: prevGame.totalGames + 1,
        }));
      } else {
        console.error('Failed to create a new game');
      }
    } catch (error) {
      console.error('Error creating a new game:', error);
    }
  };

  const makeMove = async (row, col) => {
    try {
      if (!game.gameId) {
        console.error('Invalid request: gameId is missing');
        console.log('Current game state:', game);
        return;
      }

      const response = await fetch('https://tic-tac-toe-sypn.onrender.com/api/gamess/make-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: game.gameId,
          row,
          col,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to make a move. Status: ${response.status}`);
      }

      const updatedGame = await response.json();
      setGame((prevGame) => ({
        ...prevGame,
        ...updatedGame,
        moveHistory: [...prevGame.moveHistory, { player: prevGame.currentPlayer, row, col }],
        stepNumber: prevGame.moveHistory.length,
      }));

      if (updatedGame.winner || updatedGame.isDraw) {
        endGame(updatedGame.winner);
        calculateAverageGameDuration();
      }
    } catch (error) {
      console.error('Error making a move:', error.message);
    }
  };

  const endGame = (winner) => {
    setGame((prevGame) => {
      const updatedGame = {
        ...prevGame,
        playerXWins: winner === 'X' ? prevGame.playerXWins + 1 : prevGame.playerXWins,
        playerOWins: winner === 'O' ? prevGame.playerOWins + 1 : prevGame.playerOWins,
        ties: winner === null ? prevGame.ties + 1 : prevGame.ties,
      };
  
      return updatedGame;
    });
  };
  


  const calculateAverageGameDuration = () => {
    const startTime = game.startTime;
    const endTime = new Date();
    const durationInSeconds = (endTime - startTime) / 1000;

    setGame((prevGame) => ({
      ...prevGame,
      averageGameDuration:
        (prevGame.averageGameDuration * (prevGame.totalGames - 1) + durationInSeconds) / prevGame.totalGames,
    }));
  };


  const handleSquareClick = (row, col) => {
    if (!game.winner && !game.isDraw && game.board[row][col] === '') {
      makeMove(row, col);
    }
  };

  const handlePlayerNameChange = (player, newName) => {
    if (player === 'X') {
      setPlayerX(newName);
    } else if (player === 'O') {
      setPlayerO(newName);
    }
  };

  const jumpTo = (step) => {
    setGame((prevGame) => ({
      ...prevGame,
      stepNumber: step,
      winner: null,
      isDraw: false,
    }));
  };

  const moves = game.moveHistory.map((step, move) => {
    const desc = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });


  const getBestPlayer = () => {
    return game.playerXWins > game.playerOWins ? playerX : playerO;
  };

  const getHotStreakPlayer = () => {
    return game.playerXWins > game.playerOWins ? playerX : playerO;
  };
  

return (
  <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
    <CssBaseline />
  <div className="tic-tac-toe">
    <div className="player-names">
      <label>
        Player X:
        <input
          type="text"
          value={playerX}
          onChange={(e) => handlePlayerNameChange('X', e.target.value)}
        />
      </label>
      <label>
        Player O:
        <input
          type="text"
          value={playerO}
          onChange={(e) => handlePlayerNameChange('O', e.target.value)}
        />
      </label>
    </div>
    <div className="status">
      {game.winner && <p>Winner: {game.winner === 'X' ? playerX : playerO}</p>}
      {!game.winner && game.isDraw && <p>It's a draw!</p>}
      {!game.winner && !game.isDraw && (
        <p>Current Player: {game.currentPlayer === 'X' ? playerX : playerO}</p>
      )}
    </div>
    <Board squares={game.board} onClick={handleSquareClick} winningLine={game.winningLine} />
    
    <button onClick={createNewGame} className="new-game-btn">
    Start a New Game <AiOutlineReload className="react-icon reload" />
  </button>
  <div className="color-mode-toggle">
            <IconButton onClick={() => setIsDarkMode((prevMode) => !prevMode)} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </div>
    <div className="game-info">
      <p>Moves:</p>
      <ol className="move-list">{moves}</ol>
    </div>
    <div className="game-statistics">
      <p>Game Statistics:</p>
      <ul>
        <li>Total Games Played: {game.totalGames} <AiOutlineHistory className="react-icon history" /></li>
        <li>{playerX}'s Wins: {game.playerXWins} <AiOutlineCrown className="react-icon crown" /></li>
        <li>{playerO}'s Wins: {game.playerOWins} <AiOutlineCrown className="react-icon crown" /></li>
        <li>Ties: {game.ties} <AiOutlineHistory className="react-icon history" /></li>
        <li>Average Game Duration: {game.averageGameDuration.toFixed(2)} seconds <AiOutlineClockCircle className="react-icon clock" /></li>
        <li>Best Player: {getBestPlayer()} <AiOutlineTrophy className="react-icon trophy" /></li>
        <li>Hot Streak Player: {getHotStreakPlayer() || 'No hot streak'} <AiOutlineFire className="react-icon fire" /></li>
      </ul>
    </div>
  </div>
  </ThemeProvider>
);
};

export default FourMultiplayer;