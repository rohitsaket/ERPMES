async function simulateLogin() {
  const url = 'http://localhost:3001/api/auth/callback/credentials';
  const body = new URLSearchParams({
    email: 'admin@diamondflow.com',
    password: 'password123',
    redirect: 'false',
    csrfToken: 'dummy' // CSRF might be required, but let's try
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('RESPONSE:', text);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

simulateLogin();
