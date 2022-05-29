//In this js file, swal is a keyword in sweetalert.js used instead of alert keyword.

//------------------------importing image from localStorage or RealTime Database-------------------------//
let currentUser;
let keepLoggedIn = localStorage.getItem("keepLoggedIn");
let proceedFromHomeButtonOnly = sessionStorage.getItem("proceedFromHomeButtonOnly")
let payFromFacePageOnly = sessionStorage.getItem('payFromFacePageOnly');
let referencedImageURL;

function getUserName() {
  if (keepLoggedIn == "yes") {
      currentUser = JSON.parse(localStorage.getItem('user'));
  } else {
      currentUser = JSON.parse(sessionStorage.getItem('user'));
  }
}
getUserName();
if (currentUser) {
  referencedImageURL = currentUser.profileImgURL;
  if (proceedFromHomeButtonOnly == "false") {
    swal("Before starting face verification, fill transaction details at home page.", "Pressing 'OK' will redirect you to home.", "warning", {timer: 4000}).then(function() {
      window.location.href = "../index.html"
    })
  }
}
else {
  swal("Login First!", "To start face verification, Please Log In!\n\nPressing 'OK' will redirect you to log in.", "warning", {timer: 4000}).then(function(reply) {
    if (reply) window.location.href = "./login.html"
    else window.location.href = "../index.html"
  })
}



//--------------------------------------Declaration of Variables-----------------------------------------//
const message = document.getElementById('message');
const video = document.getElementById('videoElement');
const main = document.getElementById('main');
const startBtn = document.getElementById('start-btn');

const modelsSrc = "../models";

let faceMatcher;
let canvas;
let showStartBtn = true;
let showCanvas = true;
let faceLabel;
let faceScore;
let faceVerified;


// helper function for HTML file (face-verification.html)
const clickLogoImg = () => {
  window.location.href = '../index.html';
}

const clickStartBtn = () => {
  startFaceRecognition();
}



//-----------------------------------------face-verification--------------------------------------------//
message.innerText = "Starting Camera..."

// Loading Models
Promise.all([
  //faceapi.nets.tinyFaceDetector.loadFromUri(modelsSrc), // This is lighter and faster but little less accurate
  faceapi.nets.ssdMobilenetv1.loadFromUri(modelsSrc), // This is heavier and slower but more accurate
  faceapi.nets.faceLandmark68Net.loadFromUri(modelsSrc),
  faceapi.nets.faceRecognitionNet.loadFromUri(modelsSrc),
]).then(startVideo)


// Getting Camera

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
  // Calling Face Matching Function
  matchFace();
}


// Labeling the refrence image from Database and generating the face descriptor to match further

function loadAndLabelImagesFromDB() {
  //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
  const labels = ['known']
  let i = 0
  return Promise.all(
    labels.map(async (label) => {
      i++
      const descriptions = []
      message.innerText = `Processing Data...`
      //const imgURL = `../images/${label}.jpg`
      const imgURL = referencedImageURL
      
      // if the user has not uploaded the profile picture
      if (imgURL == "null") {
        swal("Update Profile!", "To start face verification, Please upload the profile picture first in the profile section.\n\nPressing 'OK' will redirect you to profile section.", "warning").then(function(reply) {
          if (reply) window.location.href = "./profile.html"
          else message.innerText = "Please update your profile picture!"
        })
      }

      const img = await faceapi.fetchImage(imgURL)
      
      // detect the face with the highest score in the image and compute it's landmarks and face descriptor
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      
      // storing the generated descriptor into an array called descriptions
      descriptions.push(detections.descriptor)
      
      // returning the label and descriptions 
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}


// Face Matching Function

async function matchFace() {
  // calling loadAndLabelImagesFromDB function to feed it into FaceMatcher of faceapi.js
  const labeledFaceDescriptors = await loadAndLabelImagesFromDB()
  // using FaceMatcher API with 60% score which depicts the maximum descriptor distance (i.e. Euclidean Distance)
  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  message.innerText = "Data Processed! and Camera Started!"
  setTimeout(() => {
    message.innerText = "To begin! Press 'Start Verification' below."
    if (showStartBtn) startBtn.classList.replace('hide', 'unhide')
    else swal("Something went wrong!", "Please refresh the page.", "error").then(function(reply) {
      if(reply) window.location.reload()
    })
  }, 1000)
}


// last and final face-recognition function which will be showing the result

async function startFaceRecognition() {
    // removing canvas to prevent overlapping with previous canvas
    if (canvas) canvas.remove();
    
    // creating canvas for displaying on webPage
    canvas = faceapi.createCanvasFromMedia(video)
    main.appendChild(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    recognizing = async () => {
      // Replace faceapi.TinyFaceDetectorOptions() with faceapi.SsdMobilenetv1Options() if using heavier version
      // Also by default it uses the SsdMobilenetv1Options()
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

      // finding the best match and generating the result
      if (!resizedDetections[0]) swal("Face is not detected!", "Please take the shot near better light source.\nOr, Try removing the spectacles/glasses or mask.\nOr, Try updating the profile picture.", "warning")
      const descriptorResult = resizedDetections[0].descriptor
      const result = faceMatcher.findBestMatch(descriptorResult)

      faceLabel = result._label
      faceScore = result._distance

      // console.log(faceLabel)
      // console.log(faceScore)

      // if face is detected then display result
      // also, if don't want to show canvas, just put an exclamation mark before showCanvas -> "!showCanvas" 
      if (descriptorResult && showCanvas) {
        // drawing canvas on webpage with details on it
        const box = resizedDetections[0].detection.box
        // below is canvas box with label
        // const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        const drawBox = new faceapi.draw.DrawBox(box)
        drawBox.draw(canvas)
      }

      // ready for payment :)
      makePayment();
    }
    recognizing();
}



//-----------------------------------------Forwarding for payment response--------------------------------------------//
function makePayment() {
  payFromFacePageOnly = true;
  if (faceLabel == "known" && faceScore <= 0.45) {
    faceVerified = true;
    swal(`${currentUser.fullname}, you are now verified!`, "Press the pay button to make payment.", "success")
    message.innerText = "Press the 'Pay' button to make payment."
    startBtn.innerText = "Pay"
    startBtn.classList.add('pay-btn')
    startBtn.onclick = () => window.location.replace("./payment.html")
  }

  else if (faceLabel == "known" && faceScore > 0.45) {
    faceVerified = false;
    message.innerText = `Try again! we want to be more sure that it's ${currentUser.fullname}.`
  }
  
  else {
    faceVerified = false;
    swal("Verification Failed!", "Face was not matched with the profile", "error").then(function() {
      window.location.replace('./payment.html')
    }) 
  }

  sessionStorage.setItem('payFromFacePageOnly', payFromFacePageOnly);
  sessionStorage.setItem('faceVerified', faceVerified);
}