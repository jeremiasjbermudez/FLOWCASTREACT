// Example fetchData utility for mock data
export default async function fetchData() {
  // Replace this with a real API call if needed
  return [
    { id: 1, name: "Checking Account", balance: "$2,500", type: "spending" },
    { id: 2, name: "Savings Account", balance: "$10,000", type: "reserve" },
    { id: 3, name: "Investment Account", balance: "$15,000", type: "growth" },
    { id: 4, name: "Cash", balance: "$300", type: "spending" },
    { id: 5, name: "Emergency Fund", balance: "$5,000", type: "reserve" },
    { id: 6, name: "401k", balance: "$25,000", type: "growth" }
  ];
}