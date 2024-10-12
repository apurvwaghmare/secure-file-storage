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
        document.getElementById('login-form').reset();
        window.location.href = 'upload.html';
    } else {
        alert(message.message);
    }
});

document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = document.getElementById('upload-form');
    const formData = new FormData(form);
    
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const message = await response.json();

    if (response.ok) {
        alert(message.message);
        setTimeout(() => {
            window.location.href = 'decrypt.html';
        }, 2000);
    } else {
        alert(message.message);
    }
});

document.getElementById('decrypt-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const encryptionKey = document.getElementById('encryptionKey').value;
    const s3FileKey = document.getElementById('s3FileKey').value;

    try {
        const response = await fetch('/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encryptionKey, s3FileKey }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'decrypted_file.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('File decrypted and downloaded successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Error decrypting the file: ' + error.message);
    }
});
