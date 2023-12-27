// // src/components/Board.js
// import React from 'react';

// const Board = ({ board, onMove, currentPlayer, gameState }) => {
//   const handleClick = (row, col) => {
//     if (board[row][col] === '' && !gameState.gameOver) {
//       onMove(row, col, currentPlayer);
//     }
//   };

//   const renderSquare = (row, col) => (
//     <button className="square" onClick={() => handleClick(row, col)}>
//       {board[row][col]}
//     </button>
//   );

//   const renderBoard = () => (
//     <div>
//       {board.map((row, rowIndex) => (
//         <div key={rowIndex} className="board-row">
//           {row.map((_, colIndex) => (
//             <span key={colIndex}>{renderSquare(rowIndex, colIndex)}</span>
//           ))}
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div>
//       {renderBoard()}
//     </div>
//   );
// };

// export default Board;




// components/Board.js
import React from 'react';
import Square from './Square';

const Board = ({ squares, onClick }) => {
  const renderSquare = (row, col) => {
    return <Square value={squares[row][col]} onClick={() => onClick(row, col)} />;
  };

  return (
    <div>
      {squares.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((col, colIndex) => (
            <span key={colIndex}>{renderSquare(rowIndex, colIndex)}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
