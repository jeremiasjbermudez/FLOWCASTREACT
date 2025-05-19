import React from 'react';
import Header from './components/Header';
import AccountTables from './components/AccountTables';
import SearchBar from './components/SearchBar';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <SearchBar />
      <AccountTables />
    </div>
  );
}

export default App;