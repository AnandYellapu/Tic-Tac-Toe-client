// import React from 'react';
// import Square from './Square';

// const Board = ({ squares, onClick }) => {
//   return (
//     <div className="board">
//       {squares.map((row, rowIndex) => (
//         <div key={rowIndex} className="board-row">
//           {row.map((value, colIndex) => (
//             <Square key={colIndex} value={value} onClick={() => onClick(rowIndex, colIndex)} />
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Board;




// components/Board.js
import React from 'react';
import Square from './Square';

const Board = ({ squares, onClick, winningLine }) => {
  const renderSquare = (row, col) => (
    <Square
      key={col}
      value={squares[row][col]}
      onClick={() => onClick(row, col)}
      isWinningSquare={winningLine && winningLine.includes(row * squares.length + col)}
    />
  );

  const renderRow = (row) => (
    <div key={row} className="board-row">
      {squares[row].map((_, col) => renderSquare(row, col))}
    </div>
  );

  return (
    <div className="board">
      {squares.map((_, row) => renderRow(row))}
    </div>
  );
};

export default Board;
