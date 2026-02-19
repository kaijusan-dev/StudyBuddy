import { useState } from 'react'
import api from './api/api'
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    api.get('/').then( (res) => {
      console.log(res.data);
      console.log(res);
      console.log(JSON.stringify(res).data);
      //alert(JSON.stringify(res.data));
    })}, []);

  return (
    <h1>По базе минимально</h1>
  )
};

export default App;
