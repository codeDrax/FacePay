//In this js file, swal is a keyword in sweetalert.js used instead of alert keyword.

//reseting the browser storage value
let proceedFromHomeButtonOnly = false;
sessionStorage.setItem('proceedFromHomeButtonOnly', proceedFromHomeButtonOnly);

let faceVerified = false;
sessionStorage.setItem('faceVerified', faceVerified);

let payFromFacePageOnly = false;
sessionStorage.setItem('payFromFacePageOnly', payFromFacePageOnly);

// if already logged in avoid login again
let currentUser = null;
let keepLoggedIn = localStorage.getItem("keepLoggedIn"); 
function getUserName() {
    if (keepLoggedIn == "yes") {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } else {
        currentUser = JSON.parse(sessionStorage.getItem('user'));
    }
}
getUserName();
if (currentUser) {
    swal("Already Logged In!", "Log Out first to continue.", "warning").then(function() {
        window.location.replace('../index.html');
    });
}


//-----------------------------------------Firebase--------------------------------------------//
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_xmkI67ZokC5S3bs_I4Wn1ZHL9qbsy6E",
    authDomain: "facepay-b93d2.firebaseapp.com",
    projectId: "facepay-b93d2",
    storageBucket: "facepay-b93d2.appspot.com",
    messagingSenderId: "894989632635",
    appId: "1:894989632635:web:a14b1f884f00e60bd20ede",
    measurementId: "G-GPV0QHPX2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

const db = getDatabase();

//-----------------------------------------The References--------------------------------------------//

const email = document.getElementById('emailInp');
const pass = document.getElementById('passInp');
const submit = document.getElementById('submitBtn');

//-----------------------------------------VALIDATION-----------------------------------------------//
function isEmptyOrSpaces(str) {
    return str == null || str.match(/^ *$/) != null;
}

function Validation() {
    // let emailregex = /^[a-zA-Z0-9]+@(gmail|yahoo|outlook)\.com$/;
    let emailregex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if (isEmptyOrSpaces(email.value) || isEmptyOrSpaces(pass.value)) {
        swal("", "You cannot leave any field empty!", "warning");
        return false;
    }

    if (!emailregex.test(email.value)) {
        swal("", "Enter a valid email!", "warning");
        return false;
    }

    return true; 
}

//---------------------------------------AUTHENTICATION PROCESS--------------------------------------//
function AuthenticateUser() {
    if (!Validation()) return;

    const dbref = ref(db);

    // replacing dot(.) from the email to avoid error,
    // Uncaught Error: child failed: path argument was an invalid path = "UsersList/user@email.com". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]".
    let emailString = email.value;
    emailString = emailString.replaceAll('.', '');
    emailString = emailString.replaceAll('#', '');
    emailString = emailString.replaceAll('$', '');
    emailString = emailString.replaceAll('[', '');
    emailString = emailString.replaceAll(']', '');
    
    get(child(dbref, "UsersList/" + emailString)).then((user) => {
        if (user.exists()) {
            let dbpassword = decPass(user.val().password);
            if (dbpassword == pass.value) login(user.val());
            else swal("", "Email or Password is invalid!", "warning");
        } else {
            swal("User does not exist!", "To get started, please create an account!", "warning");
        }
    });
}   

//-------------------------------------------DECRYPT Process--------------------------------------------//
function decPass (dbpassword) {
    let pass12 = CryptoJS.AES.decrypt(dbpassword, pass.value); 
    return pass12.toString(CryptoJS.enc.Utf8);
} 

//------------------------------------------LOGIN------------------------------------------------------//
function login(user) {
    let keepLoggedIn = document.getElementById('customSwitch1').checked;
    
    if (!keepLoggedIn) {
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.replace("../index.html");
    } else {
        localStorage.setItem('keepLoggedIn','yes');
        localStorage.setItem('user', JSON.stringify(user));
        window.location.replace("../index.html");
    }
}

//------------------------------------ASSIGN THE EVENTS-----------------------------------------//
submit.addEventListener('click', AuthenticateUser);