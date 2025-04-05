import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import Home from './pages/Home';
import IDE from './pages/IDE';


function App() {
  return (
    <Routes>
      <Route Component={Home} path='/'></Route>
      <Route path='/editor' Component={IDE}></Route>
    </Routes>
  );
}

export default App;
