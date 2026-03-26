const axios = require('axios');

const testApiLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email: 'praneeta.cs3@gmail.com',
            password: 'student123'
        });
        console.log('API Response:', response.status, response.data);
    } catch (error) {
        console.error('API Error:', error.response ? error.response.status : error.message,
            error.response ? error.response.data : '');
    }
};

testApiLogin();
