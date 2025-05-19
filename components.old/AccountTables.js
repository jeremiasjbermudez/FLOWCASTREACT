import React from "react";
import "../styles/App.css";

function filterAccounts(accounts, search) {
  if (!search) return accounts;
  return accounts.filter(acc =>
    acc.name.toLowerCase().includes(search.toLowerCase())
  );
}

function AccountTables({ accounts, search }) {
  const filtered = filterAccounts(accounts, search);

  // Example: Split into three categories
  const spending = filtered.filter(acc => acc.type === "spending");
  const reserve = filtered.filter(acc => acc.type === "reserve");
  const growth = filtered.filter(acc => acc.type === "growth");

  return (
    <div className="tables-container">
      <div className="table-wrapper">
        <h3>Spending</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {spending.map(acc => (
              <tr key={acc.id}><td>{acc.name}</td><td>{acc.balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-wrapper">
        <h3>Reserve</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {reserve.map(acc => (
              <tr key={acc.id}><td>{acc.name}</td><td>{acc.balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-wrapper">
        <h3>Growth</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {growth.map(acc => (
              <tr key={acc.id}><td>{acc.name}</td><td>{acc.balance}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountTables;