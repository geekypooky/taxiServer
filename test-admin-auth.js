const http = require('http');

const testAdminRegister = () => {
  const data = JSON.stringify({
    name: "Admin User",
    email: "admin@test.com",
    password: "admin123",
    phone: "1234567890"
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/admin/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== ADMIN REGISTRATION TEST ===`);
    console.log(`Status Code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', JSON.parse(body));
      
      // If registration successful, test login
      if (res.statusCode === 201) {
        setTimeout(() => testAdminLogin(JSON.parse(body).data.token), 1000);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

const testAdminLogin = (existingToken) => {
  const data = JSON.stringify({
    email: "admin@test.com",
    password: "admin123"
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== ADMIN LOGIN TEST ===`);
    console.log(`Status Code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(body);
      console.log('Response:', response);
      
      // Test getMe endpoint
      if (res.statusCode === 200) {
        setTimeout(() => testGetMe(response.data.token), 1000);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

const testGetMe = (token) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/admin/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== GET ADMIN ME TEST ===`);
    console.log(`Status Code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', JSON.parse(body));
      console.log('\n✅ All tests completed!');
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
};

// Start tests
console.log('🧪 Testing Admin Authentication Endpoints...\n');
testAdminRegister();
