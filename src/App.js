import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TicTacToe from "./components/3x3/TicTacToe";



function App() {
  return (
    <BrowserRouter>
       <Routes>
       <Route path="/" element={<TicTacToe />} />
       </Routes>
    </BrowserRouter>
   
  );
}

export default App;