document.getElementById('play_guest').addEventListener('click', function(){
    play_as_guest();
})

document.getElementById('show_password_check').addEventListener('click', function(){
    if (document.getElementById('show_password_check').checked) {
        document.getElementById("password").type="text";
        document.getElementById("password2").type="text";
    } else {
        document.getElementById("password").type="password";
        document.getElementById("password2").type="password";
    }
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
        } else {
            console.log("nuh uh", jsonResponse);
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