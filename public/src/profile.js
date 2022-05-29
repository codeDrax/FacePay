//In this js file, swal is a keyword in sweetalert.js used instead of alert keyword.

//reseting the browser storage value
let proceedFromHomeButtonOnly = false;
sessionStorage.setItem('proceedFromHomeButtonOnly', proceedFromHomeButtonOnly);

let faceVerified = false;
sessionStorage.setItem('faceVerified', faceVerified);

let payFromFacePageOnly = false;
sessionStorage.setItem('payFromFacePageOnly', payFromFacePageOnly);

// helper functions for html
const clickSaveBtn = () => {
    window.location.href = '../index.html';
};
  
const clickLogoImg = () => {
    window.location.href = '../index.html';
};

document.getElementById('logo').addEventListener('click', clickLogoImg);
document.getElementById('save-btn').addEventListener('click', clickSaveBtn);



//-----------------------------------------script for css of profile-img-box--------------------------------------------//
const imgContainer = document.querySelector('.photo-container');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');

//if user hover on imgContainer 
imgContainer.addEventListener('mouseenter', function() {
    uploadBtn.style.display = "block";
});

//if we hover out from imgContainer
imgContainer.addEventListener('mouseleave', function() {
    uploadBtn.style.display = "none";
});



let currentUser = null;
let keepLoggedIn = localStorage.getItem("keepLoggedIn");
//------------------------------fetching data from localStorage to show on profile-------------------------//
function getUserName() {
    if (keepLoggedIn == "yes") {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } else {
        currentUser = JSON.parse(sessionStorage.getItem('user'));
    }
}

getUserName();

if (currentUser) {
    let name = currentUser.fullname;
    let email = currentUser.email;
    let username = currentUser.username;
    let phone = currentUser.phone;
    let payid = phone + "@facepay";
    
    document.getElementById('name').innerText = name;
    document.getElementById('email').innerText = email;
    document.getElementById('username').innerText = username;
    document.getElementById('phone').innerText = phone;
    document.getElementById('payid').innerText = payid;
} else {
    swal("Login First!", "To view profile, Please Log In!\n\nPressing 'OK' will redirect you to log in.", "warning").then(function(reply) {
        if (reply) window.location.href = "./login.html"
        else window.location.href = "../index.html"
    })
}



//-----------------------------------------Firebase--------------------------------------------//
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_xmkI67ZokC5S3bs_I4Wn1ZHL9qbsy6E",
    authDomain: "facepay-b93d2.firebaseapp.com",
    databaseURL: "https://facepay-b93d2-default-rtdb.firebaseio.com",
    projectId: "facepay-b93d2",
    storageBucket: "facepay-b93d2.appspot.com",
    messagingSenderId: "894989632635",
    appId: "1:894989632635:web:a14b1f884f00e60bd20ede",
    measurementId: "G-GPV0QHPX2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Storage Database
import { getStorage, ref as storeRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-storage.js";

// Realtime Database
import { getDatabase, ref, get, child, set, update } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

const realdb = getDatabase();



//-----------------------------------------selection of img from pc--------------------------------------------//
//when we choose an image to upload
let chosenImageToUpload = null;

file.addEventListener('change', function() {
    const imageChosen = this.files[0];
    chosenImageToUpload = imageChosen;
    if (imageChosen) {
        const reader = new FileReader(); //FileReader is a predefined function of JS
        reader.addEventListener('load', function() {
            img.setAttribute('src', reader.result);
        });
        reader.readAsDataURL(imageChosen);
        uploadProcess();
    }
});



//-----------------------------------------Uploading Files (Image) to Firebase Storage Database--------------------------------------------//
let emailString = currentUser.email;
emailString = emailString.replaceAll('.', '');
emailString = emailString.replaceAll('#', '');
emailString = emailString.replaceAll('$', '');
emailString = emailString.replaceAll('[', '');
emailString = emailString.replaceAll(']', '');

let URL = currentUser.profileImgURL;

const uploadProcess = async () => {
    const storage = getStorage();
    const storageRef = storeRef(storage, "Profile Images/profile-img@" + emailString);
    const uploadTask = uploadBytesResumable(storageRef, chosenImageToUpload);
    const uploadMessage = document.getElementById('upload-text');
    
    uploadTask.on('state-changed', (snapshot) => {
        const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes).toFixed(4) * 100;
        uploadMessage.classList.replace('hide', 'unhide');
        uploadMessage.innerHTML = "* * Uploading " + uploadProgress + "% * *";
        document.getElementById('save-btn').classList.replace('unhide', 'hide');

    }, (error) => {
        swal("Image not uploaded!", "", "error");
    }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((imageURL) => {
            URL = imageURL;
            setURLtoRealDB(imageURL);
            setImgToLocalStorage(imageURL);
            swal("Photo uploaded successfully!", "", "success");
            uploadMessage.classList.replace('unhide', 'hide');
            document.getElementById('save-btn').classList.replace('hide', 'unhide');
        });
    });
}



//-----------------------------------------Setting Image URL to Firebase Realtime Database--------------------------------------------//
const setURLtoRealDB = (URL) => {
    update(ref(realdb, "UsersList/" + emailString), {
        profileImgURL: URL
    })
}



//-----------------------------------------Setting Image URL to Local/Session Storage--------------------------------------------//
function setImgToLocalStorage(URL) {
    currentUser.profileImgURL = URL;

    if (keepLoggedIn == "yes") {
        currentUser = localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
        currentUser = sessionStorage.setItem('user', JSON.stringify(currentUser));
    }
}


//We can fetch user profile img either from local storage or from firebase realtime database but fetching from local storage would be faster--------------------------------------------//
//-----------------------------------------Getting Image URL from Local/Session Storage to show on profile--------------------------------------------//
function getImgFromLocalStorage(URL) {
    if (currentUser.profileImgURL != "null") {
        let photoURL = currentUser.profileImgURL;
        img.setAttribute('src', URL);
    } else {
        img.setAttribute('src', "../images/profileM.jpg");
    }
}
getImgFromLocalStorage(URL);


//-----------------------------------------Getting Image URL from Firebase Realtime Database--------------------------------------------//
const dbRef = ref(realdb);
const getURLfromRealDB = () => {
    get(child(dbRef, "UsersList/" + emailString)).then((user) => {
        if (user.exists()) {
            img.setAttribute('src', user.val().profileImgURL);
        }
    })
}

