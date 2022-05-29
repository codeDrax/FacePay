//reseting the browser storage value
let proceedFromHomeButtonOnly = false;
sessionStorage.setItem('proceedFromHomeButtonOnly', proceedFromHomeButtonOnly);

const clickHomeBtn = () => {
    window.location.replace('../index.html');
}

// checking that the this page is forwarded from face-verification page only
let payFromFacePageOnly = sessionStorage.getItem('payFromFacePageOnly');
if (payFromFacePageOnly == "false") window.location.href = "../index.html"

//getting values from browser storage
let faceVerified = sessionStorage.getItem('faceVerified');

if (faceVerified == "false") {
    document.querySelector(".success").classList.add('hide')
    document.querySelector(".failed").classList.replace('hide', 'unhide')
    document.getElementById("success-message").innerText = "Failed!"
    document.getElementById("success-message").style.color = "red"
    document.getElementById("request-message").innerText = "Your request has not been processed."
    document.getElementById("request-message").style.padding = "0"
    document.getElementById("failure-reason").classList.replace('hide', 'unhide')
}

setTimeout(() => window.location.replace('../index.html'), 10000);