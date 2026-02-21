import { useState } from 'react'
import api from './api/api'
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    api.get('/').then( (res) => {
      console.log(res.data.message);
    })}, []);

  return (
    <div>
      <h1>По базе минимально</h1>
    </div>
    
  )
};

export default App;