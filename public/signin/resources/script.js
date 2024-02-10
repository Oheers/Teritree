// Adjust the video container size on window resize
window.addEventListener('resize', adjustVideoContainerSize);

function adjustVideoContainerSize() {
    const video = document.getElementById('video-background');

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const videoWidth = video.videoWidth || 1920; // Use a default width if videoWidth is not available
    const videoHeight = video.videoHeight || 1080; // Use a default height if videoHeight is not available

    const containerRatio = containerWidth / containerHeight;
    const videoRatio = videoWidth / videoHeight;

    if (containerRatio > videoRatio) {
        video.style.width = '110%';
        video.style.height = 'auto';
    } else {
        video.style.width = 'auto';
        video.style.height = '110%';
    }
}

function startLogin() {
    document.getElementById("log-in").style.display = "none";
    document.getElementById("sign-up").style.display = "none";
    document.getElementById("experian").style.display = "none";
    document.getElementById("sign-in-form").style.display = "block";
    document.getElementById("sign-in-complete").style.display = "table-cell";
    document.getElementById("sign-in-google-auth").style.display = "table-cell";
    document.getElementById("sign-in-microsoft-auth").style.display = "table-cell";
}

function startSignup() {
    document.getElementById("log-in").style.display = "none";
    document.getElementById("sign-up").style.display = "none";
    document.getElementById("experian").style.display = "none";
    document.getElementById("sign-in-form").style.display = "block";
    document.getElementById("username-warning").style.display = "block";
    document.getElementById("sign-up-complete").style.display = "table-cell";
    document.getElementById("sign-up-google-auth").style.display = "table-cell";
    document.getElementById("sign-up-microsoft-auth").style.display = "table-cell";
    document.getElementById("text-signin-header").innerHTML = "Sign Up to Teritree"
}

function validationChecks() {
    if (!validate_usernameCharacters()) return false;
    if (!validate_passwordLength()) return false;
    return true;
}

async function signin() {
    if (!validationChecks()) return;
    await postUsernameAndPassword("login");
}

async function signup() {
    if (!validationChecks()) return;
    if (!validate_usernameLength()) return;
    await postUsernameAndPassword("signup");
}

async function experian() {
    window.location.href = `/play?id=${"experian-auth"}`
}

async function postUsernameAndPassword(type) {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("stringing:", JSON.stringify({
        username: username,
        password: password}))
    const response = await fetch(`/${type}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            username: username,
            password: password
        }) // body data type must match "Content-Type" header
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        if (type === "login") {
            if (!jsonResponse.auth) {
                displayInputError("username", "Incorrect username or password.", "#ff2222")
            } else {
                console.log("logging in request received")
                window.location.href = `/play?id=${jsonResponse.token}`
                setCookie("authToken", jsonResponse.token, 90);
            }
        } else {
            if (!jsonResponse.auth) {
                displayInputError("username", "This username already exists.", "#ff2222")
            } else {
                window.location.href = `/play?id=${jsonResponse.token}`
                setCookie("authToken", jsonResponse.token, 90);
            }
        }
    })
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function validate_usernameLength() {
    const username = document.getElementById("username").value;
    if (username.length > 16 || username.length < 3) {
        displayInputError("username", "Username must be between 3-16 characters.", "#ff2222");
        document.getElementById("password").style.marginTop = "3.6%";
        return false;
    }
    return true;
}

function validate_usernameCharacters() {
    const username = document.getElementById("username").value;
    if (/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        return true;
    }
    displayInputError("username", "Username must be alphanumeric.", "#ff2222");
    return false;
}

function validate_passwordLength() {
    const password = document.getElementById("password").value;
    if (password.length === 0) {
        displayInputError("password", "You must provide a password.", "#ff2222");
        return false;
    }
    return true;
}

function displayInputError(input, message, colour) {
    const warningHandler = document.getElementById(`${input}-warning`);
    warningHandler.innerHTML = message;
    warningHandler.style.display = "block";
    warningHandler.style.color = colour;
}

function clearWarnings() {
    document.getElementById("username-warning").style.display = "none";
    document.getElementById("password-warning").style.display = "none";
}

// Initial adjustment on page load
window.addEventListener('load', adjustVideoContainerSize);