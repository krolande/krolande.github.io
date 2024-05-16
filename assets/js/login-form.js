const form = document.querySelector('#login-form');
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const authentification = document.querySelector('#authentification').value;
    const password = document.querySelector('#password').value;

    const request = {
        authentification: authentification,
        password: password
    };

    fetch('https://academy.digifemmes.com/api/auth/signin', {
        method: 'POST',

        // Définir les en-têtes d’authentification de base avec encodage base64
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${authentification}:${password}`)}`
        },
        body: JSON.stringify(request),
    }).then((reponse) => {
        if (reponse.ok) {
            return reponse.json();
        } else {
            throw new Error('Invalid credentials');
        }

    }).then((data) => {
        const jwt = data;
        localStorage.setItem('jwt', jwt);
        console.log(jwt);
        window.location.href = "dashboard-profil.html";
    }).catch((error) => {
        console.error('Login failes:', error);
        const errorElement = document.querySelector('#login-error');
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }
            , 5000);
    });
    const jwt = localStorage.getItem('jwt');
});
