//components/Multiplayer.js
import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { BsCircle } from 'react-icons/bs';
import { AiFillCrown, AiOutlineHistory, AiOutlineClockCircle, AiOutlineTrophy, AiOutlineReload, AiOutlineFire } from 'react-icons/ai';
import Square from './Square';
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

const TicTacToe = () => {
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState({
    history: [{ board: [['', '', ''], ['', '', ''], ['', '', '']], currentPlayer: 'X' }],
    stepNumber: 0,
    winner: null,
    isDraw: false,
  });

  const [playerNames, setPlayerNames] = useState({
    playerX: '',
    playerO: '',
  });

  const [gameStatistics, setGameStatistics] = useState({
    totalGames: 0,
    playerXWins: 0,
    playerOWins: 0,
    averageDuration: 0,
  });

  const [tieCount, setTieCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchNewGame();
  }, []);

  const fetchNewGame = async () => {
    try {
      setStartTime(Date.now());
      const response = await fetch('http://localhost:1100/api/game/new-game', { method: 'POST' });
      const data = await response.json();
      setGameId(data._id);
      setGameData({
        history: [{ board: [['', '', ''], ['', '', ''], ['', '', '']], currentPlayer: 'X' }],
        stepNumber: 0,
        winner: null,
        isDraw: false,
      });

      setGameStatistics((prevStats) => ({
        ...prevStats,
        totalGames: prevStats.totalGames + 1,
      }));
    } catch (error) {
      console.error('Error creating a new game:', error);
    }
  };

 
  const makeMove = async (row, col) => {
    try {
      const response = await fetch(`http://localhost:1100/api/game/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col, player: gameData.history[gameData.stepNumber].currentPlayer }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newData = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      setGameStatistics((prevStats) => ({
        ...prevStats,
        playerXWins: prevStats.playerXWins + (newData.winner === 'X' ? 1 : 0),
        playerOWins: prevStats.playerOWins + (newData.winner === 'O' ? 1 : 0),
        averageDuration:
          prevStats.totalGames === 0
            ? duration
            : (prevStats.averageDuration * prevStats.totalGames + duration) / (prevStats.totalGames + 1),
      }));

      setGameData((prevData) => ({
        ...prevData,
        history: [...prevData.history, newData],
        stepNumber: prevData.history.length,
        winner: newData.winner,
        isDraw: newData.isDraw,
      }));

      setStartTime(Date.now());

      if (newData.isDraw) {
        setTieCount((prevTieCount) => prevTieCount + 1);
      }
    } catch (error) {
      console.error('Error making a move:', error);
    }
  };

  const handleNameChange = (player, e) => {
    const value = e.target.value;
    setPlayerNames((prevNames) => ({
      ...prevNames,
      [player]: value,
    }));
  };

  const renderSquare = (row, col) => (
    <Square
      key={row * 3 + col}
      value={gameData.history[gameData.stepNumber].board[row][col]}
      onClick={() => {
        if (
          !gameData.winner &&
          !gameData.isDraw &&
          gameData.history[gameData.stepNumber].board[row][col] === ''
        ) {
          makeMove(row, col);
        }
      }}
    >
      {gameData.history[gameData.stepNumber].board[row][col] === 'X' && <AiOutlineClose />}
      {gameData.history[gameData.stepNumber].board[row][col] === 'O' && <BsCircle />}
    </Square>
  );

  const renderBoard = () => (
    <div className="board">
      {gameData.history[gameData.stepNumber].board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
        </div>
      ))}
    </div>
  );

  const status = () => {
    if (gameData.winner) {
      return (
        <p className="status-text">
          Winner: {getPlayerName(gameData.winner)} <AiFillCrown />
        </p>
      );
    } else if (gameData.isDraw) {
      return (
        <p className="status-text">
          It's a Draw! <AiOutlineHistory />
        </p>
      );
    } else {
      return (
        <p className="status-text">
          Next player: {getPlayerName(gameData.history[gameData.stepNumber].currentPlayer)}{' '}
          {gameData.history[gameData.stepNumber].currentPlayer === 'X' ? <AiOutlineClose /> : <BsCircle />}
        </p>
      );
    }
  };

  const getPlayerName = (player) => {
    return player === 'X' ? playerNames.playerX : playerNames.playerO;
  };

  const jumpTo = (step) => {
    setGameData((prevData) => ({
      ...prevData,
      stepNumber: step,
      winner: null,
      isDraw: false,
    }));
  };

  const moves = gameData.history.map((step, move) => {
    const desc = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  const getBestPlayer = () => {
    return gameStatistics.playerXWins > gameStatistics.playerOWins ? getPlayerName('X') : getPlayerName('O');
  };

  const getHotStreakPlayer = () => {
    return gameStatistics.playerXWins > gameStatistics.playerOWins ? getPlayerName('X') : getPlayerName('O');
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="tic-tac-toe">
        <div className="player-names">
          <label>
            Player X Name:
            <input type="text" value={playerNames.playerX} onChange={(e) => handleNameChange('playerX', e)} />
          </label>
          <label>
            Player O Name:
            <input type="text" value={playerNames.playerO} onChange={(e) => handleNameChange('playerO', e)} />
          </label>
        </div>
        {status()}
        {renderBoard()}
        <button className="new-game-btn" onClick={fetchNewGame}>
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
            <li>
              Total Games: {gameStatistics.totalGames} <AiOutlineHistory className="react-icon history" />
            </li>
            <li>
              {getPlayerName('X')} Wins: {gameStatistics.playerXWins} <AiFillCrown className="react-icon crown" />
            </li>
            <li>
              {getPlayerName('O')} Wins: {gameStatistics.playerOWins} <AiFillCrown className="react-icon crown" />
            </li>
            <li>
              Ties: {tieCount} <AiOutlineHistory className="react-icon history" />
            </li>
            <li>
              Average Game Duration: {gameStatistics.averageDuration.toFixed(2)} milliseconds{' '}
              <AiOutlineClockCircle className="react-icon clock" />
            </li>
            <li>
              Best Player: {getBestPlayer()} <AiOutlineTrophy className="react-icon trophy" />
            </li>
            <li>
              Hot Streak: {getHotStreakPlayer()} <AiOutlineFire className="react-icon fire" />
            </li>
          </ul>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TicTacToe;