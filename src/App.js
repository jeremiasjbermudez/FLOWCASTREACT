import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Bills from "./components/Bills";
import Expenses from "./components/Expenses";
import Deposits from "./components/Deposits";
import Goals from "./components/Goals";
import Forecast from "./components/Forecast";
import BillsPaid from "./components/BillsPaid";
import Calendar from "./components/Calendar";
import Todo from "./components/Todo";
import Habits from "./components/Habits";
import UpdateTables from "./components/UpdateTables";
import Reports from "./components/Reports";
import Calculator from "./components/Calculator";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/bills-paid" element={<BillsPaid />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/update-tables" element={<UpdateTables />} />
          <Route path="/reports" element={<div style={{ width: '100%' }}><Reports /></div>} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;