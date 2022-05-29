//reseting the browser storage value
let proceedFromHomeButtonOnly = false;
sessionStorage.setItem('proceedFromHomeButtonOnly', proceedFromHomeButtonOnly);

let faceVerified = false;
sessionStorage.setItem('faceVerified', faceVerified);

let payFromFacePageOnly = false;
sessionStorage.setItem('payFromFacePageOnly', payFromFacePageOnly);

//-----------------------------------------The References--------------------------------------------//
const signup = document.getElementById('signup');
const login = document.getElementById('login');
const profile = document.getElementById('profile');
const homeButton = document.getElementById('home-next-btn');
let currentUser = null;

//-----------------------------------------Functions--------------------------------------------//
function getUserName() {
    let keepLoggedIn = localStorage.getItem("keepLoggedIn");
    
    if (keepLoggedIn == "yes") {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } else {
        currentUser = JSON.parse(sessionStorage.getItem('user'));
    }
}

const redirectToLogin = () => {
    window.location.href = "./src/login.html";
}

const logout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    localStorage.removeItem('keepLoggedIn');
    window.location.replace("../index.html");
}

//-----------------------------------------WINDOWS LOADS--------------------------------------------//
window.onload = function () {
    getUserName();
    // null is when user is not logged in
    if (currentUser == null) {
        profile.classList.replace("profile-class", "hide");
        //redirecting next home button to login
        homeButton.addEventListener('click', redirectToLogin);
    } else {
        signup.classList.replace("signup-class", "hide");
        login.innerText = "Log Out";
        login.addEventListener('click', logout);
    }
}
