let sign_up = true;

document.getElementById('play_guest').addEventListener('click', function(){
    play_as_guest();
})

document.getElementById('submit_form').addEventListener('click', function(){
    submit_request();
})

document.getElementById('close-error').addEventListener('click', function(){
    document.getElementById('popup').hidden = true;
})

document.getElementById('welcome-toggle-button').addEventListener('click', function(){
    toggle_welcome_screen();
    clear_login_errors("username-error", "password_error");
})

/**
 * Currently being used to get access to the public account,
 */
async function play_as_guest() {
    await fetch(`/login`, {
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
            username: "guest",
            password: "guest"
        }) // body data type must match "Content-Type" header
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        if (jsonResponse.auth) {
            setCookie("authToken", jsonResponse.token, 1);
            window.location.href = `/play?id=${jsonResponse.token}`;
        }
    })
}

/**
 * Adds a cookie to the user's browser.
 *
 * @param cname The cookie name
 * @param cvalue The value to set the cookie to
 * @param exdays How many days left until the cookie expires.
 */
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Checks the sign_up variable, if it's true then this means the user has pressed to change to the login screen, if it's
 * false it means the user has pressed to change back to the welcome screen, this will change all the text in all the
 * relevant elements to display this separate screen.
 */
function toggle_welcome_screen() {
    document.getElementById("password2").hidden = sign_up;
    if (sign_up) {
        document.getElementById("auth-header").innerHTML = "Welcome back to Teritree"
        document.getElementById("auth-subtitle").innerHTML = "Sign in with username and password"
        document.getElementById("username").placeholder = "Username";
        document.getElementById("password").placeholder = "Password";
        document.getElementById("welcome-toggle-prefix").innerHTML = "New to the game?";
        document.getElementById("welcome-toggle-button").innerHTML = "Create an account";
        document.getElementById("sign-up-button-text").innerHTML = "Sign In";
    } else {
        document.getElementById("auth-header").innerHTML = "Welcome to Teritree"
        document.getElementById("auth-subtitle").innerHTML = "Create an account"
        document.getElementById("username").placeholder = "Create a Username";
        document.getElementById("password").placeholder = "Create a Password";
        document.getElementById("welcome-toggle-prefix").innerHTML = "Already have an account?";
        document.getElementById("welcome-toggle-button").innerHTML = "Sign in";
        document.getElementById("sign-up-button-text").innerHTML = "Sign Up";
    }

    sign_up = !sign_up;
}

/**
 * Checks whether the username will pass serverside validation, requiring that the username is at least 4 characters
 * long and only a-Z0-9_ characters.
 *
 * @param username The username to be queried.
 * @returns {{pass: boolean, error: string}} Whether or not the username will pass serverside verification, and an error
 * string if not.
 */
function validate_username(username) {
    if (username.length === 0) return {pass: false, error: "Username is required."};
    else if (username.length < 4) return {pass: false, error: "Username too short."};

    if (/^[a-z0-9_]*$/gi.test(username)) return {pass: true, error: undefined};
    else return {pass: false, error: "Username must be alphanumeric."}
}

/**
 * Checks if the password passes the validation requirements, in this case the only requirement is that the password is
 * more than 6 characters long.
 *
 * @param password The password input string.
 * @returns {{pass: boolean, error: string}} Whether or not the password will pass serverside verification, and an error
 * string if not.
 */
function validate_password(password) {
    if (password.length === 0) return {pass: false, error: "Password is required"};
    else if (password.length < 6) return {pass: false, error: "Password too short."};
    else return {pass: true, error: undefined};
}

/**
 * Checks if the user's password and confirm password boxes match, as a clientside validation. This will not be checked
 * serverside so is the only line of defense for the user having a chance of remembering the password.
 *
 * @param password1 The password in the first, "Create a Password" box.
 * @param password2 The password in the second, "Confirm Password" box.
 * @returns {{pass: boolean, error: string}} Whether or not the passwords match, and an error string if not.
 */
function validate_password_matching(password1, password2) {
    if (password1 !== password2) return {pass: false, error: "Passwords must match."};
    else return {pass: true, error: undefined};
}

/**
 * Sets the element set up to show the error to be visible to the client and sets a message there.
 *
 * @param error_id The id of the element in the DOM handling errors.
 * @param message The message to be shown.
 */
function display_login_error(error_id, message) {
    document.getElementById(error_id).hidden = false;
    document.getElementById(error_id).innerHTML = message;
}

/**
 * Shows a full screen error to the user, covering the screen with the error and a "close button"
 *
 * @param error The error message to be displayed.
 */
function display_full_error(error) {
    document.getElementById("error-message").innerHTML = error;
    document.getElementById("popup").hidden = false;
}

/**
 * Hides all login error elements.
 *
 * @param error_id All the element ids to be hidden.
 */
function clear_login_errors(...error_id) {
    error_id.forEach(element_id => document.getElementById(element_id).hidden = true);
}

/**
 * Carries out a check against an input with a given method to make sure it'll pass the serverside validation,
 * displaying any errors to an existing element set up to display errors.
 *
 * @param input_id The id of the element the user inputs data into.
 * @param validation_method The method taking in a string to run validation checks against.
 * @param error_id The id of the element to display the error message to.
 */
function verify_input(input_id, validation_method, error_id) {
    const input = document.getElementById(input_id).value;
    const validation_attempt = validation_method(input);
    if (!validation_attempt.pass) {
        display_login_error(error_id, validation_attempt.error);
    }
}

/**
 * This will submit the request to the server, first running clientside checks to make sure the username and password
 * are valid.
 */
function submit_request() {
    clear_login_errors("username-error", "password-error");
    verify_input("username", validate_username, "username-error");
    verify_input("password", validate_password, "password-error");
    if (sign_up) {
        const password_match_validation = validate_password_matching(document.getElementById("password").value, document.getElementById("password2").value);
        if (!password_match_validation.pass) display_login_error("password-error", password_match_validation.error);
        post_account_data(document.getElementById("username").value, document.getElementById("password").value, "signup", "Something went wrong whilst trying to create the account. Try again later.");
    }
    else post_account_data(document.getElementById("username").value, document.getElementById("password").value, "login", "Something went wrong whilst trying to login to the account. Try again later.");
}

/**
 * If the user can't authenticate for whatever reason, the server throws an error code like username_short. This will
 * decode it and format it nicely to the client by calling the display_login_error method.
 *
 * @param error_id The error id sent by the server.
 * @returns true if an error was found, false if no error could be found.
 */
function known_error_check(error_id) {
    if (error_id === "username_taken") display_login_error("username-error", "Username already taken.");
    else if (error_id === "username_short") display_login_error("username-error", "Username is too short.");
    else if (error_id === "username_long") display_login_error("username-error", "Username is too long.");
    else if (error_id === "username_weird") display_login_error("username-error", "Username must be alphanumeric.");
    else if (error_id === "password_short") display_login_error("password-error", "Password is too short.");
    else if (error_id === "password_long") display_login_error("password-error", "Password is too long.");
    else if (error_id === "password_incorrect") display_login_error("password-error", "Password incorrect.");
    else if (error_id === "account_not_found") display_login_error("username-error", "Username does not exist.");
    else return false;
    return true;
}

/**
 * Sends a POST request to the backend to /signup with the chosen usernamd and password. If successful, the server
 * returns a auth token, which is set as a cookie and will redirect the client to the main website using this auth token.
 *
 * @param username The new username
 * @param password The new password
 * @param endpoint The endpoint to send the data to, e.g. url.com/signin if endpoint is "signin"
 * @param error_message The method will handle standard errors but if an unexpected one is shown, what should be
 * displayed to the user?
 */
async function post_account_data(username, password, endpoint, error_message) {
    await fetch(`/${endpoint}`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
        if (jsonResponse.auth) {
            setCookie("authToken", jsonResponse.token, 1);
            window.location.href = `/play?id=${jsonResponse.token}`;
        } else {
            if (!known_error_check(jsonResponse.error)) display_full_error(error_message);
        }
    }).catch(error => {
        display_full_error("Authentication servers are offline or not working. Try again later.")
    })
}