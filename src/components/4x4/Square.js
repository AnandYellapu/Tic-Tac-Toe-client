// components/Square.js
import React from 'react';

const Square = ({ value, onClick, isWinningSquare }) => (
  <button
    className={`square ${isWinningSquare ? 'winning' : ''}`}
    onClick={onClick}
  >
    {value}
  </button>
);

export default Square;