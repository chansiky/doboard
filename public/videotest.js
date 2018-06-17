'use strict';

console.log('whats up doc?')
console.log('in hackedwebRTCscript.js')

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  video: true,
};

// Video element where stream will be placed.
const localVideo = document.getElementById('video');
console.log('localVideo is: ', localVideo)

// Handles success by adding the MediaStream to the video element.
function gotLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream;
}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// Initializes media stream.
navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);
