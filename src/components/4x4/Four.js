// components/TicTacToe.js
import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineHistory, AiOutlineClockCircle, AiOutlineTrophy, AiOutlineReload, AiOutlineFire } from 'react-icons/ai';  //eslint-disable-line
import { BsCircle } from 'react-icons/bs';
import { AiFillCrown } from 'react-icons/ai';
import Square from '../../components/3x3/Square';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import axios from 'axios';


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

const Four = () => {
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState({
    history: [{ board: [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']], currentPlayer: 'X' }],
    // history: [{ board: Array.from({ length: 4 }, () => Array(4).fill('')), currentPlayer: 'X' }],
    stepNumber: 0,
    winner: null,
    isDraw: false,
  });

  const [playerNames, setPlayerNames] = useState({  
    playerX: '',
    playerO: 'AI', // Set default name for AI opponent
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
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [gameMode] = useState('ai');
 


  useEffect(() => {
    fetchNewGame();
  }, []); // eslint-disable-line


const fetchNewGame = async () => {
  try {
    setStartTime(Date.now());

    const response = await axios.post('https://tic-tac-toe-sypn.onrender.com/api/games/new-game');

    // Destructure the data from the response
    const { data } = response;

    setGameId(data._id);

    setGameData((prevData) => ({
      ...prevData,
      history: [{ board: [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']], currentPlayer: 'X' }],
      stepNumber: 0,
      winner: null,
      isDraw: false,
    }));

    setGameStatistics((prevStats) => ({
      ...prevStats,
      totalGames: prevStats.totalGames + 1,
    }));

    // Check if the game starts with AI turn
    if (playerNames.playerO === 'AI' && data.startingPlayer === 'O') {
      setIsAiTurn(true);
      makeAiMove();
    }
  } catch (error) {
    console.error('Error creating a new game:', error);
  }
};

  

  const makeMove = async (row, col, player) => {
    try {
   
  
      const response = await fetch(`https://tic-tac-toe-sypn.onrender.com/api/games/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col, player }),
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
  
      // Check if it's the AI's turn after a player move
      if (player === 'X' && !newData.winner && !newData.isDraw) {
        setIsAiTurn(true);
      }
    } catch (error) {
      console.error('Error making a move:', error);
    }
  };
  

  const getEmptySquares = (board) => {
    const emptySquares = [];
    board.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === '') {
          emptySquares.push({ row: rowIndex, col: colIndex });
        }
      });
    });
    return emptySquares;
  };
  

  const makeAiMove = async () => {

    const emptySquares = getEmptySquares(gameData.history[gameData.stepNumber].board);

    if (emptySquares.length > 0) {
      const bestMove = enhancedMinimax(gameData.history[gameData.stepNumber].board, 3); // Adjust maxDepth as needed
      makeMove(bestMove.row, bestMove.col, 'O');
    }
  };
  
  
  const getRandomMove = (emptySquares) => {              //eslint-disable-line  
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
  };




  const getBestMove = (board, player) => {     //eslint-disable-line
    let bestMove = null;
    let bestScore = player === 'O' ? -Infinity : Infinity;
  
    // Iterate through all available moves
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === '') {
          // Make a move
          board[i][j] = player;
  
          // Log the current state for debugging
          console.log(`Evaluating move (${i}, ${j}) for player ${player}:`);
          console.log(board.map(row => row.join(' ')));
  
          // Evaluate the move using the enhanced minimax algorithm with alpha-beta pruning
          const score = enhancedMinimax(board, 0, -Infinity, Infinity, false);
  
          // Undo the move
          board[i][j] = '';
  
          // Update the best move if needed
          if ((player === 'O' && score > bestScore) || (player === 'X' && score < bestScore)) {
            bestScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }
  
    console.log('Best move found:', bestMove);
  
    return bestMove;
  };
  
  
  const enhancedMinimax = (board, maxDepth) => {
    const result = checkWinner(board);
  
    if (result !== null) {
      return result === 'O' ? 1 : -1;
    }
  
    if (isDraw(board)) {
      return 0;
    }
  
    let bestScore = -Infinity;
    let bestMove = null;
  
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === '') {
          board[i][j] = 'O';
          const score = minimax(board, 0, false, -Infinity, Infinity, maxDepth);
          board[i][j] = '';
  
          if (score > bestScore) {
            bestScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }
  
    return bestMove;
  };

  
  const minimax = (board, depth, isMaximizing, alpha, beta, maxDepth) => {
    const result = checkWinner(board);
  
    if (result !== null) {
      return result === 'O' ? 1 : -1;
    }
  
    if (isDraw(board) || depth === maxDepth) {
      return 0;
    }
  
    if (isMaximizing) {
      let bestScore = -Infinity;
  
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'O';
            const score = minimax(board, depth + 1, false, alpha, beta, maxDepth);
            board[i][j] = '';
  
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, score);
  
            if (beta <= alpha) {
              break; // Beta cutoff (pruning)
            }
          }
        }
      }
  
      return bestScore;
    } else {
      let bestScore = Infinity;
  
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'X';
            const score = minimax(board, depth + 1, true, alpha, beta, maxDepth);
            board[i][j] = '';
  
            bestScore = Math.min(score, bestScore);
            beta = Math.min(beta, score);
  
            if (beta <= alpha) {
              break; // Alpha cutoff (pruning)
            }
          }
        }
      }
  
      return bestScore;
    }
  };
  
  
  // Function to check for a winner
const checkWinner = (board) => {
  // Check rows and columns
  for (let i = 0; i < 4; i++) {
    if (
      (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][2] === board[i][3] && board[i][0] !== '') ||
      (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[2][i] === board[3][i] && board[0][i] !== '')
    ) {
      return board[i][0];
    }
  }

  // Check diagonals
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[2][2] === board[3][3] && board[0][0] !== '') {
    return board[0][0];
  }

  if (board[0][3] === board[1][2] && board[1][2] === board[2][1] && board[2][1] === board[3][0] && board[0][3] !== '') {
    return board[0][3];
  }

  // No winner
  return null;
};



  // Function to check for a draw
  const isDraw = (board) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === '') {
          // If any square is empty, the game is not a draw
          return false;
        }
      }
    }
    // All squares are filled, and no winner, so it's a draw
    return true;
  };



  useEffect(() => {
    if (isAiTurn && !gameData.winner && !gameData.isDraw) {
      makeAiMove();
      setIsAiTurn(false);
    }
  }, [isAiTurn, gameData.winner, gameData.isDraw]);   //eslint-disable-line



  const handlePlayerXNameChange = (e) => {
    const newName = e.target.value;
  
    setPlayerNames((prevNames) => ({
      ...prevNames,
      playerX: newName,
    }));
  };




  const renderSquare = (row, col) => (
    <Square
      key={row * 4 + col}  // Adjust the key calculation for a 4x4 board
      value={gameData.history[gameData.stepNumber].board[row][col]}
      onClick={() => {
        if (
          !gameData.winner &&
          !gameData.isDraw &&
          gameData.history[gameData.stepNumber].board[row][col] === ''
        ) {
          makeMove(row, col, 'X');
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
      <button className="move-button" onClick={() => jumpTo(move)}>
        {desc}
      </button>
    </li>
  );
});

// const renderDifficultySelect = () => (
//   <div className="difficulty-select">
//     <label className="select-label">AI Difficulty:</label>
//     <select
//       className="difficulty-dropdown"
//       value={aiDifficulty}
//       onChange={(e) => setAiDifficulty(e.target.value)}
//       disabled={gameMode !== 'ai'}
//     >
//       <option value="easy">Easy</option>
//       <option value="hard">Hard</option>
//     </select>
//   </div>
// );


return (
  <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
    <CssBaseline />
    <div className="tic-tac-toe">
      <div className="player-names">
        <label>
          Player X:
          <input
            className="player-input"
            type="text"
            value={playerNames.playerX}
            onChange={handlePlayerXNameChange}
          />
        </label>
        <label>
          <p className="player-info">Player O: {playerNames.playerO}</p>
        </label>
      </div>

      <div className="difficulty-select">
    <label className="select-label">AI Difficulty:</label>
    <select
      className="difficulty-dropdown"
      value={aiDifficulty}
      onChange={(e) => setAiDifficulty(e.target.value)}
      disabled={gameMode !== 'ai'}
    >
      <option value="easy">Easy</option>
      <option value="hard">Hard</option>
    </select>
  </div>

      <p className="status-text">
        Next player: {getPlayerName(gameData.history[gameData.stepNumber].currentPlayer)}{' '}
        {gameData.history[gameData.stepNumber].currentPlayer === 'X' ? <AiOutlineClose /> : <BsCircle />}
      </p>

      {renderBoard()}
      
        <button
          className="new-game-btn"
          onClick={() => fetchNewGame()}
          disabled={isAiTurn}
        >
          Start a New Game <AiOutlineReload />
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
        <div className="status">
          {status()}
          <div className="game-statistics">
          <p>Game Statistics:</p>
          <ul>
          <li>Total Games: {gameStatistics.totalGames}</li>
          <li>Player X Wins: {gameStatistics.playerXWins}</li>
          <li>Player O Wins: {gameStatistics.playerOWins}</li>
          <li>Tie Count: {tieCount}</li>
          <li>Average Duration: {gameStatistics.averageDuration}</li>
          </ul>
          </div>
        </div>
      </div>
    
  </ThemeProvider>
);
}

export default Four;
