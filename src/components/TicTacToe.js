//components/TicTacToe.js
import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineHistory, AiOutlineClockCircle, AiOutlineTrophy, AiOutlineReload, AiOutlineFire } from 'react-icons/ai';
import { BsCircle } from 'react-icons/bs';
import { AiFillCrown } from 'react-icons/ai';
import Square from './Square';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Multiplayer from './Multiplayer';

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
  const [gameMode, setGameMode] = useState('ai');

  useEffect(() => {
    fetchNewGame();
  }, []);      // eslint-disable-line

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
      const response = await fetch(`http://localhost:1100/api/game/${gameId}/move`, {
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

 
  const makeAiMove = () => {
    const emptySquares = [];
    gameData.history[gameData.stepNumber].board.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === '') {
          emptySquares.push({ row: rowIndex, col: colIndex });
        }
      });
    });
  
    if (emptySquares.length > 0) {
      const isRandomMove = Math.random() < 0.2; // Adjust the probability as needed
      const bestMove = isRandomMove ? getRandomMove(emptySquares) : getBestMove(gameData.history[gameData.stepNumber].board, 'O');
      makeMove(bestMove.row, bestMove.col, 'O');
    }
  };
  
  const getRandomMove = (emptySquares) => {
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
  };
  
  
  const getBestMove = (board, player) => {
    let bestMove = null;
    let bestScore = player === 'O' ? -Infinity : Infinity;
  
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          board[i][j] = player;
          const score = minimax(board, 0, false);
          board[i][j] = '';
  
          if ((player === 'O' && score > bestScore) || (player === 'X' && score < bestScore)) {
            bestScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }
  
    return bestMove;
  };
  
  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);
  
    if (result !== null) {
      return result === 'O' ? 1 : -1;
    }
  
    if (isDraw(board)) {
      return 0;
    }
  
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'O';
            const score = minimax(board, depth + 1, false);
            board[i][j] = '';
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            board[i][j] = 'X';
            const score = minimax(board, depth + 1, true);
            board[i][j] = '';
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  };
  

  // Function to check for a winner
const checkWinner = (board) => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
      return board[i][0];
    }
  }

  // Check columns
  for (let j = 0; j < 3; j++) {
    if (board[0][j] === board[1][j] && board[1][j] === board[2][j] && board[0][j] !== '') {
      return board[0][j];
    }
  }

  // Check diagonals
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') {
    return board[0][0];
  }

  if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '') {
    return board[0][2];
  }

  // No winner
  return null;
};

// Function to check for a draw
const isDraw = (board) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
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
      const delay = aiDifficulty === 'easy' ? 500 : 1000; // Adjust delay based on difficulty
      const aiMoveTimeout = setTimeout(() => {
        makeAiMove();
        setIsAiTurn(false);
      }, delay);

      return () => clearTimeout(aiMoveTimeout); // Cleanup on component unmount or re-render
    }
  }, [isAiTurn, gameData.winner, gameData.isDraw, aiDifficulty]);    //eslint-disable-line

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

  const renderDifficultySelect = () => (         //eslint-disable-line
    <div className="difficulty-select">
      <label>
        AI Difficulty:
        <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="hard">Hard</option>
        </select>
      </label>
    </div>
  );

    const getBestPlayer = () => {
    return gameStatistics.playerXWins > gameStatistics.playerOWins ? getPlayerName('X') : getPlayerName('O');
  };

  const getHotStreakPlayer = () => {
    return gameStatistics.playerXWins > gameStatistics.playerOWins ? getPlayerName('X') : getPlayerName('O');
  };

 
  const handleGameModeChange = (selectedMode) => {
    setGameMode(selectedMode);
  
    // Additional logic based on the selected game mode
    if (selectedMode === 'ai') {
      // Perform actions specific to the AI game mode
      console.log('Switched to AI game mode');
      setAiDifficulty('easy'); // Reset AI difficulty when switching to AI mode
    } else if (selectedMode === 'multiplayer') {
      // Perform actions specific to the multiplayer game mode
      console.log('Switched to Multiplayer mode');
    }
  };
  

  const renderGameComponent = () => {         // eslint-disable-line
    if (gameMode === 'ai') {
      return <TicTacToe />;
    } else if (gameMode === 'multiplayer') {
      return <Multiplayer />;
    }

  };


// const renderPlayerNames = () => {            // eslint-disable-line
//   if (gameMode === 'ai opponent') {
//     return (
//       <div className="player-names">
//         <label>
//           Player X Name:
//           <input type="text" value={playerNames.playerX} onChange={(e) => handleNameChange('playerX', e)} disabled/>
//         </label>
//         <label>
//           Player O Name:
//           <input type="text" value={playerNames.playerO} onChange={(e) => handleNameChange('playerO', e)} />
//         </label>
//       </div>
//     );
//   } else if (gameMode === 'multiplayer') {
//     return (
//       <div className="player-names multiplayer-disabled">
//         <label>
//           Player X Name:
//           <input type="text" value={playerNames.playerX} onChange={(e) => handleNameChange('playerX', e)} disabled />
//         </label>
//         <label>
//           Player O Name:
//           <input type="text" value={playerNames.playerO} onChange={(e) => handleNameChange('playerO', e)} />
//         </label>
//       </div>
//     );
//   }
// };

const renderPlayerNames = () => {       //eslint-disable-line
  if (gameMode === 'ai opponent') {
    return (
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
    );
  } else if (gameMode === 'multiplayer') {
    return (
      <div className="player-names multiplayer-disabled">
        {/* Player X Name input disabled for multiplayer mode */}
        <label>
          Player X Name:
          <input type="text" value={playerNames.playerX} onChange={(e) => handleNameChange('playerX', e)} disabled />
        </label>
        {/* Player O Name input */}
        <label>
          Player O Name:
          <input type="text" value={playerNames.playerO} onChange={(e) => handleNameChange('playerO', e)} disabled />
        </label>
      </div>
    );
  }
};


// return (
//   <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
//     <CssBaseline />
//     <div className="game-mode-select">
//       <label className="select-label">
//         Game Mode:
//         <select className="select-dropdown" value={gameMode} onChange={(e) => handleGameModeChange(e.target.value)}>
//           <option value="ai">AI Opponent</option>
//           <option value="multiplayer">Multiplayer</option>
//         </select>
//       </label>
//     </div>

//     <div className="tic-tac-toe">
//     <label className='player-names'>
//       Player X Name:
//       <input
//         type="text"
//         value={playerNames.playerX}
//         onChange={(e) => handleNameChange('playerX', e)}
//         disabled={gameMode === 'multiplayer'} // Disable based on game mode
//       />
//     </label>

//       {gameMode === 'ai' && (
//         <>
//           <div className="difficulty-select">
//             <label className="select-label">
//               AI Difficulty:
//               <select className="select-dropdown" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
//                 <option value="easy">Easy</option>
//                 <option value="hard">Hard</option>
//               </select>
//             </label>
//           </div>
//           {status()}
//           {renderBoard()}
//           <button className="new-game-btn" onClick={fetchNewGame}>
//             Start a New Game <AiOutlineReload className="react-icon reload" />
//           </button>
//           <div className="color-mode-toggle">
//             <IconButton onClick={() => setIsDarkMode((prevMode) => !prevMode)} color="inherit">
//               {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
//             </IconButton>
//           </div>
//           <div className="game-info">
//             <p>Moves:</p>
//             <ol className="move-list">{moves}</ol>
//           </div>
//           <div className="game-statistics">
//             <p>Game Statistics:</p>
//             <ul>
//               <li>
//                 Total Games: {gameStatistics.totalGames} <AiOutlineHistory className="react-icon history" />
//               </li>
//               <li>
//                 {getPlayerName('X')} Your Wins: {gameStatistics.playerXWins} <AiFillCrown className="react-icon crown" />
//               </li>
//               <li>
//                 {getPlayerName('O')} Wins: {gameStatistics.playerOWins} <AiFillCrown className="react-icon crown" />
//               </li>
//               <li>
//                 Ties: {tieCount} <AiOutlineHistory className="react-icon history" />
//               </li>
//               <li>
//                 Average Game Duration: {gameStatistics.averageDuration.toFixed(2)} milliseconds{' '}
//                 <AiOutlineClockCircle className="react-icon clock" />
//               </li>
//               <li>
//                 Best Player: {getBestPlayer()} <AiOutlineTrophy className="react-icon trophy" />
//               </li>
//               <li>
//                 Hot Streak: {getHotStreakPlayer()} <AiOutlineFire className="react-icon fire" />
//               </li>
//             </ul>
//           </div>
//         </>
//       )}
//         {gameMode === 'multiplayer' && <Multiplayer />}
//     </div>
//   </ThemeProvider>
//  );


return (
  <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
    <CssBaseline />
    <div className="game-mode-select">
      <label className="select-label">
        Game Mode:
        <select className="select-dropdown" value={gameMode} onChange={(e) => handleGameModeChange(e.target.value)}>
          <option value="ai">AI Opponent</option>
          <option value="multiplayer">Multiplayer</option>
        </select>
      </label>
    </div>

    <div className="tic-tac-toe">
      
    {gameMode === 'ai' && (
      <label className='player-namesX'>
        Player X Name:
        <input
          type="text"
          value={playerNames.playerX}
          onChange={(e) => handleNameChange('playerX', e)}
          className="player-input"
        />
      </label>
    )}
    

      {gameMode === 'ai' && (
        <>
          <div className="difficulty-select">
            <label className="select-label">
              AI Difficulty:
              <select className="select-dropdown" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="hard">Hard</option>
              </select>
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
              <li>Total Games: {gameStatistics.totalGames} <AiOutlineHistory className="react-icon history" /></li>
              <li>{getPlayerName('X')} Your Wins: {gameStatistics.playerXWins} <AiFillCrown className="react-icon crown" /></li>
              <li>{getPlayerName('O')} Wins: {gameStatistics.playerOWins} <AiFillCrown className="react-icon crown" /></li>
              <li>Ties: {tieCount} <AiOutlineHistory className="react-icon history" /></li>
              <li>Average Game Duration: {gameStatistics.averageDuration.toFixed(2)} milliseconds <AiOutlineClockCircle className="react-icon clock" /></li>
              <li>Best Player: {getBestPlayer()} <AiOutlineTrophy className="react-icon trophy" /></li>
              <li>Hot Streak: {getHotStreakPlayer()} <AiOutlineFire className="react-icon fire" /></li>
            </ul>
          </div>
        </>
      )}
      {gameMode === 'multiplayer' && <Multiplayer />}
    </div>
  </ThemeProvider>
  );
}

export default TicTacToe;






