import React from "react";
import SearchBar from "./SearchBar";
import "../styles/App.css";

function Header({ search, setSearch }) {
  return (
    <div className="header d-flex flex-wrap justify-content-between align-items-center">
      <h4>🧮Finance Dashboard</h4>
      <div className="d-flex align-items-center gap-2 nav-buttons">
        <a href="/calendar" className="btn btn-outline-info btn-sm">📅 Calendar</a>
        <a href="/update_tables" className="btn btn-outline-info btn-sm">🔮 Update Accounts</a>
        <a href="/bills" className="btn btn-outline-info btn-sm">💸 Bills</a>
        <a href="/expenses" className="btn btn-outline-info btn-sm">💸 Expenses</a>
        <a href="/deposits" className="btn btn-outline-info btn-sm">💰 Deposits</a>
        <a href="/bills_paid" className="btn btn-outline-info btn-sm">📄 Bills Paid</a>
        <a href="/forecast" className="btn btn-outline-info btn-sm">🔮 Forecast</a>
        <a href="/goals" className="btn btn-outline-info btn-sm">⚽ Goals</a>
        <a href="/todo" className="btn btn-outline-info btn-sm">📝 To Do</a>
        <a href="/habits" className="btn btn-sm btn-outline-light border border-info">🧲 Habits</a>
        <a href="/" className="btn btn-outline-info btn-sm">🏠 Back to Dashboard</a>
        <SearchBar search={search} setSearch={setSearch} />
      </div>
    </div>
  );
}

export default Header;