/*
  Data and machine learning for creative practice (DMLCP)

  Face mesh with a webcam

  Fun experiments with facemesh and particle systems:
  (still using v0, but that shouldn't matter too much)
  https://www.youtube.com/live/931bqqpQqvI?si=YRJL9SVDJAbgcdtp&t=7379

  Reference here: https://docs.ml5js.org/#/reference/facemesh
*/


let video,
    faceMesh,
    faces = [],
    hasLogged = false, // Used to log preds only once
    options = { maxFaces: 1, refineLandmarks: false, flipped: false },
    showKeypoints = false;
    // note that you must set the limit of detectable faces in advance!
    // landmarks refinement: more precision but slower (more compute!)
    // to flip, also flip the video below

let smileyEmoji, shockedEmoji;

function preload() {
  faceMesh = ml5.faceMesh(options);
  // load emoji images
  smileyEmoji = loadImage('assets/smile.png');
  shockedEmoji = loadImage('assets/shock.png');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO); // to flip, add: { flipped: true }
  video.size(width, height);

  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);

  // This sets up an event that fills the global variable "faces"
  // with an array every time new predictions are made
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);

  drawKeypoints();

  // We call our function to draw all keypoints
  // IDEA: like in previous sketches, there is no obligation to display the
  //       video, and you could for instance imagine a blank canvas where a few
  //       points from the face are used to draw vanishing circles, using the
  //       same logic as when you want a circle to leave a trail behind it when
  //       it moves?

}

function gotFaces(results) {
  faces = results;

  // Log `results` to see its contents
  if (!hasLogged && results.length > 0) {
    console.log("The predictions object:");
    console.log(results);
    hasLogged = true;
  }

}

function getMouthState(keypoints) {
  // get key mouth points
  const leftMouth = keypoints[61];   // left corner of mouth
  const rightMouth = keypoints[291]; // right corner of mouth
  const upperLip = keypoints[13];    // top of upper lip
  const lowerLip = keypoints[14];    // bottom of lower lip

  // calculate mouth width and height
  const mouthWidth = dist(leftMouth.x, leftMouth.y, rightMouth.x, rightMouth.y);
  const mouthHeight = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);
  const ratio = mouthWidth / mouthHeight;

  // check mouth ratios
  return (mouthHeight > 15) ? "open" : (ratio > 10 ? "smiling" : "");
}

// Add this function to handle keypress
function keyPressed() {
  if (key === 'k' || key === 'K') {
    showKeypoints = !showKeypoints;
  }
}

// Modify drawKeypoints() to include smile detection
function drawKeypoints() {
  if (faces.length > 0) {
    for (let i = 0; i < faces.length; i++) {
      const keypoints = faces[i].keypoints;
      const mouthState = getMouthState(keypoints);
      
      // Calculate face dimensions with larger multipliers
      const leftEye = keypoints[33];
      const rightEye = keypoints[263];
      const chin = keypoints[152];
      const foreHead = keypoints[10];
      
      const faceWidth = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y) * 3;    // Increased from 2 to 3
      const faceHeight = dist(foreHead.x, foreHead.y, chin.x, chin.y) * 1.8;       // Increased from 1.2 to 1.8
      const faceX = leftEye.x - faceWidth/3;                                        // Adjusted positioning
      const faceY = foreHead.y - faceHeight/6;                                      // Adjusted positioning

      // draw emoji over face
      if (mouthState === "smiling") {
        image(smileyEmoji, faceX, faceY, faceWidth, faceHeight);
      } else if (mouthState === "open") {
        image(shockedEmoji, faceX, faceY, faceWidth, faceHeight);
      }

      // only draw keypoints if toggle is on
      if (showKeypoints) {
        for (let j = 0; j < keypoints.length; j++) {
          const {x, y} = keypoints[j];
          fill(0, 255, 0);
          ellipse(x, y, 5, 5);
        }
      }
    }
  }
}

// IDEA: the predictions object comes with a bounding box, accessible under the
//       `.boundingBox` property. This is also an object, with the x y coordinates of
//       the four corners as arrays: topLeft, topRight, bottomLeft, bottomRight. A
//       nice exercise could be to write a function called drawBoundingBox, similar to
//       drawKeyPoints, that would:
//         - set the rectMode to CORNERS (using a push/pop logic for security)
//         - loop through all the predictions
//         - fetch the topLeft and bottomRight coordinates
//         - and draw the box! (You would call that function in draw after drawKeypoints.)
//       Note that you could imagine doing something different with that, just
//       as you could use the various face points in different ways. It is
//       probably particularly interesting if you focus on only some points
//       (maybe one in each cheek?), or perhaps three-four points that would allow
//       you to define an arc, a spline, or a Bézier curve?