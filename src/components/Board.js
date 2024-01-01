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
