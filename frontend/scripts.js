document.getElementById('registration-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const message = await response.json();

    if (response.ok) {
        alert(message.message);
        document.getElementById('registration-form').reset();
        window.location.href = 'upload.html';
    } else {
        alert(message.message);
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const message = await response.json();

    if (response.ok) {
        alert(message.message);
        window.location.href = 'upload.html';
    } else {
        alert(message.message);
    }
});

document.getElementById('upload-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file');
    const emailInput = document.getElementById('email');

    if (!fileInput.files.length || !emailInput.value) {
        alert('Please upload a file and enter your email.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('email', emailInput.value);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
    });

    const message = await response.json();

    if (response.ok) {
        alert(message.message);
        fileInput.value = ''; // Clear the file input
        emailInput.value = ''; // Clear the email input
    } else {
        alert(message.message);
    }
});
