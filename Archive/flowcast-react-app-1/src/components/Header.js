import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Assuming you have a separate CSS file for header styles

const Header = () => {
    return (
        <div className="header d-flex flex-wrap justify-content-between align-items-center">
            <h4>🧮 Finance Dashboard</h4>
            <div className="d-flex align-items-center gap-2">
                <Link to="/calendar" className="btn btn-outline-info btn-sm">📅 Calendar</Link>
                <Link to="/update_tables" className="btn btn-outline-info btn-sm">🔮 Update Accounts</Link>
                <Link to="/bills" className="btn btn-outline-info btn-sm">💸 Bills</Link>
                <Link to="/expenses" className="btn btn-outline-info btn-sm">💸 Expenses</Link>
                <Link to="/deposits" className="btn btn-outline-info btn-sm">💰 Deposits</Link>
                <Link to="/bills_paid" className="btn btn-outline-info btn-sm">📄 Bills Paid</Link>
                <Link to="/forecast" className="btn btn-outline-info btn-sm">🔮 Forecast</Link>
                <Link to="/goals" className="btn btn-outline-info btn-sm">⚽ Goals</Link>
                <Link to="/todo" className="btn btn-outline-info btn-sm">📝 To Do</Link>
                <Link to="/habits" className="btn btn-sm btn-outline-light border border-info">🧲 Habits</Link>
                <Link to="/" className="btn btn-outline-info btn-sm">🏠 Back to Dashboard</Link>
                <div className="search-bar ms-2">
                    <input type="text" id="searchInput" className="form-control" placeholder="Search Accounts." />
                </div>
            </div>
        </div>
    );
};

export default Header;