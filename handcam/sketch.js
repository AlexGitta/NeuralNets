/*
  Data and machine learning for creative practice (DMLCP)

  Handpose webcam demo

  Originally from here (deprecated): https://editor.p5js.org/ml5/sketches/Handpose_Webcam
  Reference here: https://docs.ml5js.org/#/reference/handpose
  And other examples: https://docs.ml5js.org/#/reference/handpose?id=examples
*/

let video,
    handPose,
    hands = [];

let osc;
let isSoundStarted = false;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  
  // setup oscillator
  osc = new p5.Oscillator();
  osc.setType('sine');
  osc.freq(440); // base frequency
  osc.amp(0);

  let startButton = createButton('Start Sound');
  startButton.mousePressed(() => {
    if (!isSoundStarted) {
      osc.start();
      isSoundStarted = true;
    }
  });
}

function draw() {

  // if we have the video access yet, draw it
  if (video) {
    image(video, 0, 0);
  }

  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);

  // IDEA: like in previous sketches, there is no obligation to display the video,
  //       and you could for instance imagine a blank canvas where points from the
  //       hand, can be used in artistic ways! To draw or influence shapes on
  //       the canvas in real time!
  // IDEA: (advanced) in this vein, it might be possible to train a sound model
  //       on Teachable Machine using different hand poses, and then combine the
  //       local sound sketch with this one, where the landmarks control
  //       animations and sound!

  drawHand();
  updateSound();
}

function gotHands(results) {
    // Save the output to the hands variable
  hands = results;
}

// This time, using a click to display the hand object
function mousePressed() {
  console.log(hand);
}

function drawHand() {
  push(); // Precaution: styles remain within this function
  noStroke();
  fill(255,0,0); // Set colour of circle

  // if we have any hand detected, draw it
  if (hands.length > 0) {

    // Draw all the tracked hand points
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];

      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        fill(0);
        stroke(0, 255, 0);
        circle(keypoint.x, keypoint.y, 5);
      }

    }

  }

  pop();
}

// IDEA: one thing that could be done, to familiarise yourself with the landmarks and
//       the geometry of the hands, would be to draw lines between the landmarks, to
//       create a silhouette of a hand, as seen here for instance:
//       https://github.com/tensorflow/tfjs-models/tree/master/handpose#mediapipe-handpose


function updateSound() {
  if (hands.length > 0) {
    let hand = hands[0];
    let totalDistance = 0;
    let pairs = 0;
    let avgY = 0;
    
    // calculate average distance between points and average Y position
    for (let i = 0; i < hand.keypoints.length; i++) {
      avgY += hand.keypoints[i].y;  // Sum up Y positions
      for (let j = i + 1; j < hand.keypoints.length; j++) {
        let p1 = hand.keypoints[i];
        let p2 = hand.keypoints[j];
        let d = dist(p1.x, p1.y, p2.x, p2.y);
        totalDistance += d;
        pairs++;
      }
    }

    // aim is higher pitch when hand is higher
    // and louder when hand is a fist, quiet when hand is open
    
    avgY = avgY / hand.keypoints.length;  // average Y position
    let avgDistance = totalDistance / pairs;
    
    // map distance to amplitude (inverse relationship)
    let amplitude = map(avgDistance, 50, 200, 0.5, 0, true);
    
    // map Y position to frequency
    let frequency = map(avgY, height, 0, 100, 1000, true);
    
    osc.freq(frequency);
    osc.amp(amplitude);
  } else {
    // no hands detected, no sound
    osc.amp(0);
  }
}