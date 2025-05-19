import React, { useEffect, useState } from 'react';
import fetchData from '../utils/fetchData';

const AccountTables = () => {
    const [accountData, setAccountData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchData();
                setAccountData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="tables-container">
            {accountData.map((account, index) => (
                <div key={index} className="table-wrapper">
                    <h3>{account.title}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {account.transactions.map((transaction, idx) => (
                                <tr key={idx}>
                                    <td>{transaction.date}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default AccountTables;