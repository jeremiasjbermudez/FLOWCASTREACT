import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
        onSearch(event.target.value);
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Search Accounts."
            />
        </div>
    );
};

export default SearchBar;