export const fetchData = async () => {
    try {
        const response = await fetch('https://api.example.com/accounts'); // Replace with your API endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};