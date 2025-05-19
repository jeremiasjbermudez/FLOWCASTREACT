import React from "react";

function SearchBar({ search, setSearch }) {
  return (
    <div className="search-bar ms-2">
      <input
        type="text"
        className="form-control"
        placeholder="Search Accounts."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;