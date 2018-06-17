import React from 'react'
import { TextBox } from './index'

class Canvas extends React.Component{
  constructor(){
    super();
    this.videoLocal   = React.createRef();
    this.videoRemote  = React.createRef();
    this.buttonStart  = React.createRef();
    this.buttonCall   = React.createRef();
    this.buttonHangup = React.createRef();
    this.localStream  = null;
    this.remoteStream = null;
    this.startTime    = null;

    this.trace = this.trace.bind(this)
    this.getOtherPeer = this.getOtherPeer.bind(this)
    this.getPeerName = this.getPeerName.bind(this)
    this.gotLocalMediaStream = this.gotLocalMediaStream.bind(this)
    this.handleLocalMediaStreamError = this.handleLocalMediaStreamError.bind(this)
    this.gotRemoteMediaStream = this.gotRemoteMediaStream.bind(this)
    this.logVideoLoaded = this.logVideoLoaded.bind(this)
    this.logResizedVideo = this.logResizedVideo.bind(this)
    this.handleConnection = this.handleConnection.bind(this)
  }

    // Define MediaStreams callbacks.

    // Sets the MediaStream as the video element src.
  gotLocalMediaStream(mediaStream) {
    this.videoLocal.current.srcObject = mediaStream;
    this.localStream = mediaStream;

    this.trace('Received local stream.');
    this.buttonCall.current.disabled = false;  // Enable call button.
  }

  // Handles error by logging a message to the console.
  handleLocalMediaStreamError(error) {
    this.trace(`navigator.getUserMedia error: ${error.toString()}.`);
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    this.videoRemote.current.srcObject = mediaStream;
    this.remoteStream = mediaStream;
    this.trace('Remote peer connection received remote stream.');
  }


  //Add behavior for video streams.

  //Logs a message with the id and size of a video element.
  logVideoLoaded(event) {
    const video = event.target;
    this.trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
      `videoHeight: ${video.videoHeight}px.`);
}

  //Logs a message with the id and size of a video element.
  //This event is fired when video begins streaming.
  logResizedVideo(event) {
    this.logVideoLoaded(event);

    if (startTime) {
      const elapsedTime = window.performance.now() - startTime;
      this.startTime = null;
      this.trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
    }
  }


  // Logs that the connection succeeded.
  handleConnectionSuccess(peerConnection) {
    this.trace(`${getPeerName(peerConnection)} addIceCandidate success.`);
  };
  
  // Logs that the connection failed.
  handleConnectionFailure(peerConnection, error) {
    this.trace(`${getPeerName(peerConnection)} failed to add ICE Candidate:\n`+
          `${error.toString()}.`);
  }
  
  // Logs changes to the connection state.
  handleConnectionChange(event) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    this.trace(`${getPeerName(peerConnection)} ICE state: ` +
          `${peerConnection.iceConnectionState}.`);
  }
  
  // Logs error when setting session description fails.
  setSessionDescriptionError(error) {
    this.trace(`Failed to create session description: ${error.toString()}.`);
  }

// Logs success when setting session description.
function setDescriptionSuccess(peerConnection, functionName) {
  const peerName = getPeerName(peerConnection);
  trace(`${peerName} ${functionName} complete.`);
}

// Logs success when localDescription is set.
function setLocalDescriptionSuccess(peerConnection) {
  setDescriptionSuccess(peerConnection, 'setLocalDescription');
}

// Logs success when remoteDescription is set.
function setRemoteDescriptionSuccess(peerConnection) {
  setDescriptionSuccess(peerConnection, 'setRemoteDescription');
}


  // Define helper functions.
  
  // Gets the "other" peer connection.
  getOtherPeer(peerConnection) {
    return (peerConnection === localPeerConnection) ?
        remotePeerConnection : localPeerConnection;
  }
  
  // Gets the name of a certain peer connection.
  getPeerName(peerConnection) {
    return (peerConnection === localPeerConnection) ?
        'localPeerConnection' : 'remotePeerConnection';
  }

  // Logs an action (text) and the time when it happened on the console.
  trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
  
    console.log(now, text);
  }
  // Define RTC peer connection behavior.

  // Connects with new peer candidate.
  handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          this.handleConnectionSuccess(peerConnection);
        }).catch((error) => {
          this.handleConnectionFailure(peerConnection, error);
        });

      trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
            `${event.candidate.candidate}.`);
    }
  }

  componentDidMount(){
    'use strict';

    const mediaStreamConstraints = {
      video: true,
    };

    const offerOptions = {
      offerToReceiveVideo: 1,
    };

    let startTime = null;

    const videoLocal   = this.videoLocal.current
    const videoRemote  = this.videoRemote.current
    const buttonStart  = this.buttonStart.current
    const buttonCall   = this.buttonCall.current
    const buttonHangup = this.buttonHangup.current

    console.log(videoLocal)
    videoLocal.addEventListener('loadedmetadata', this.logVideoLoaded);
    videoRemote.addEventListener('loadedmetadata', this.logVideoLoaded);
    videoRemote.addEventListener('onresize', this.logResizedVideo);

    let localStream;
    let remoteStream;

    let localPeerConnection;
    let remotePeerConnection;

    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
      .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError);
  }

  render() {
    return (
      <div>
        <h1>
          <TextBox />
          <video  ref={this.videoLocal} autoPlay playsInline />
          <video  ref={this.videoRemote} autoPlay playsInline />
        </h1>

        <button ref={this.buttonStart} />
        <button ref={this.buttonCall} />
        <button ref={this.buttonHangup} />
      </div>
    )
  }
}


export default Canvas
