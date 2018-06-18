import React from 'react'

class Video extends React.Component{
  constructor(){
    super()
    this.videoLocal           = React.createRef()
    this.videoRemote          = React.createRef()
    this.buttonStart          = React.createRef()
    this.buttonCall           = React.createRef()
    this.buttonHangup         = React.createRef()
    this.localStream          = null
    this.remoteStream         = null
    this.startTime            = null
    this.offerOptions         = null
    this.localPeerConnection  = null
    this.remotePeerConnection = null

    this.trace = this.trace.bind(this)
    this.getOtherPeer = this.getOtherPeer.bind(this)
    this.getPeerName = this.getPeerName.bind(this)
    this.gotLocalMediaStream = this.gotLocalMediaStream.bind(this)
    this.handleLocalMediaStreamError = this.handleLocalMediaStreamError.bind(this)
    this.gotRemoteMediaStream = this.gotRemoteMediaStream.bind(this)
    this.logVideoLoaded = this.logVideoLoaded.bind(this)
    this.logResizedVideo = this.logResizedVideo.bind(this)
    this.handleConnection = this.handleConnection.bind(this)
    this.setDescriptionSuccess = this.setDescriptionSuccess.bind(this)
    this.setLocalDescriptionSuccess = this.setLocalDescriptionSuccess.bind(this)
    this.setRemoteDescriptionSuccess = this.setRemoteDescriptionSuccess.bind(this)
    this.createdOffer = this.createdOffer.bind(this)
    this.createdAnswer = this.createdAnswer.bind(this)
    this.mediaStreamConstraints = null

    this.startAction = this.startAction.bind(this)
    this.callAction = this.callAction.bind(this)
    this.hangupAction = this.hangupAction.bind(this)

  }

  // Define MediaStreams callbacks.

  // Sets the MediaStream as the video element src.
  gotLocalMediaStream(mediaStream) {
    this.videoLocal.current.srcObject = mediaStream
    this.localStream = mediaStream

    this.trace('Received local stream.')
    this.buttonCall.current.disabled = false  // Enable call button.
  }

  // Handles error by logging a message to the console.
  handleLocalMediaStreamError(error) {
    this.trace(`navigator.getUserMedia error: ${error.toString()}.`)
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  gotRemoteMediaStream(event) {
    const mediaStream = event.stream
    this.videoRemote.current.srcObject = mediaStream
    this.remoteStream = mediaStream
    this.trace('Remote peer connection received remote stream.')
  }
  //Add behavior for video streams.

  //Logs a message with the id and size of a video element.
  logVideoLoaded(event) {
    const video = event.target
    this.trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
      `videoHeight: ${video.videoHeight}px.`)
  }

  //Logs a message with the id and size of a video element.
  //This event is fired when video begins streaming.
  logResizedVideo(event) {
    this.logVideoLoaded(event)

    if (this.startTime) {
      const elapsedTime = window.performance.now() - this.startTime
      this.startTime = null
      this.trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`)
    }
  }

  startAction() {
    this.buttonStart.current.disabled = true
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
      .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError)
    this.trace('Requesting local stream.')
  }

  // Handles call button action: creates peer connection.
  callAction() {
    this.buttonCall.current.disabled = true
    this.buttonHangup.current.disabled = false

    this.trace('Starting call.')
    this.startTime = window.performance.now()

    // Get local media stream tracks.
    const videoTracks = this.localStream.getVideoTracks()
    const audioTracks = this.localStream.getAudioTracks()
    if (videoTracks.length > 0) {
      this.trace(`Using video device: ${videoTracks[0].label}.`)
    }
    if (audioTracks.length > 0) {
      this.trace(`Using audio device: ${audioTracks[0].label}.`)
    }

    const servers = null  // Allows for RTC server configuration.

    // Create peer connections and add behavior.
    this.localPeerConnection = new RTCPeerConnection(servers)
    this.trace('Created local peer connection object localPeerConnection.')

    this.localPeerConnection.addEventListener('icecandidate', this.handleConnection)
    this.localPeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange
    )

    this.remotePeerConnection = new RTCPeerConnection(servers)
    this.trace('Created remote peer connection object remotePeerConnection.')

    this.remotePeerConnection.addEventListener('icecandidate', this.handleConnection)
    this.remotePeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange
    )
    this.remotePeerConnection.addEventListener('addstream', this.gotRemoteMediaStream)

    // Add local stream to connection and create offer to connect.
    this.localPeerConnection.addStream(this.localStream)
    this.trace('Added local stream to localPeerConnection.')

    this.trace('localPeerConnection createOffer start.')
    this.localPeerConnection.createOffer(this.offerOptions)
      .then(this.createdOffer).catch(this.setSessionDescriptionError)
  }

  // Handles hangup action: ends up call, closes connections and resets peers.
  hangupAction() {
    this.localPeerConnection.close()
    this.remotePeerConnection.close()
    this.localPeerConnection = null
    this.remotePeerConnection = null
    this.buttonHangup.current.disabled = true
    this.buttonCall.current.disabled = false
    this.trace('Ending call.')
  }

  // Connects with new peer candidate.
  handleConnection(event) {
    const peerConnection = event.target
    const iceCandidate = event.candidate

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate)
      const otherPeer = this.getOtherPeer(peerConnection)

      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          this.handleConnectionSuccess(peerConnection)
        }).catch((error) => {
          this.handleConnectionFailure(peerConnection, error)
        })

      this.trace(`${this.getPeerName(peerConnection)} ICE candidate:\n` +
            `${event.candidate.candidate}.`)
    }
  }


  // Logs that the connection succeeded.
  handleConnectionSuccess(peerConnection) {
    this.trace(`${this.getPeerName(peerConnection)} addIceCandidate success.`)
  }

  // Logs that the connection failed.
  handleConnectionFailure(peerConnection, error) {
    this.trace(`${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
          `${error.toString()}.`)
  }

  // Logs changes to the connection state.
  handleConnectionChange(event) {
    const peerConnection = event.target
    console.log('ICE state change event: ', event)
    this.trace(`${this.getPeerName(peerConnection)} ICE state: ` +
          `${peerConnection.iceConnectionState}.`)
  }

  // Logs error when setting session description fails.
  setSessionDescriptionError(error) {
    this.trace(`Failed to create session description: ${error.toString()}.`)
  }

  // Logs success when setting session description.
  setDescriptionSuccess(peerConnection, functionName) {
    const peerName = this.getPeerName(peerConnection)
    this.trace(`${peerName} ${functionName} complete.`)
  }

  // Logs success when localDescription is set.
  setLocalDescriptionSuccess(peerConnection) {
    this.setDescriptionSuccess(peerConnection, 'setLocalDescription')
  }

  // Logs success when remoteDescription is set.
  setRemoteDescriptionSuccess(peerConnection) {
    this.setDescriptionSuccess(peerConnection, 'setRemoteDescription')
  }
  // Define helper functions.

  // Gets the "other" peer connection.
  getOtherPeer(peerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      this.remotePeerConnection : this.localPeerConnection
  }

  // Gets the name of a certain peer connection.
  getPeerName(peerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      'localPeerConnection' : 'remotePeerConnection'
  }

  // Logs an action (text) and the time when it happened on the console.
  trace(text) {
    text = text.trim()
    const now = (window.performance.now() / 1000).toFixed(3)

    console.log(now, text)
  }
  // Define RTC peer connection behavior.

  // Logs offer creation and sets peer connection session descriptions.
  createdOffer(description) {
    this.trace(`Offer from localPeerConnection:\n${description.sdp}`)

    this.trace('localPeerConnection setLocalDescription start.')
    this.localPeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.localPeerConnection)
      }).catch(this.setSessionDescriptionError)

    this.trace('remotePeerConnection setRemoteDescription start.')
    this.remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.remotePeerConnection)
      }).catch(this.setSessionDescriptionError)

    this.trace('remotePeerConnection createAnswer start.')
    this.remotePeerConnection.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError)
  }

  // Logs answer to offer creation and sets peer connection session descriptions.
  createdAnswer(description) {
    this.trace(`Answer from remotePeerConnection:\n${description.sdp}.`)

    this.trace('remotePeerConnection setLocalDescription start.')
    this.remotePeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.remotePeerConnection)
      }).catch(this.setSessionDescriptionError)

    this.trace('localPeerConnection setRemoteDescription start.')
    this.localPeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.localPeerConnection)
      }).catch(this.setSessionDescriptionError)
  }


  componentDidMount(){
    'use strict'

    this.mediaStreamConstraints = {
      video: true,
    }

    this.offerOptions = {
      offerToReceiveVideo: 1,
    }

    let startTime = null

    const videoLocal   = this.videoLocal.current
    const videoRemote  = this.videoRemote.current
    const buttonStart  = this.buttonStart.current
    const buttonCall  = this.buttonCall.current
    const buttonHangup  = this.buttonHangup.current

    buttonCall.disabled = true
    buttonHangup.disabled = true

    console.log(videoLocal)
    videoLocal.addEventListener('loadedmetadata', this.logVideoLoaded)
    videoRemote.addEventListener('loadedmetadata', this.logVideoLoaded)
    videoRemote.addEventListener('onresize', this.logResizedVideo)

    buttonStart.addEventListener('click', this.startAction)
    buttonCall.addEventListener('click', this.callAction)
    buttonHangup.addEventListener('click', this.hangupAction)

    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
      .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError)
  }

  render() {
    return (
      <div>
        <div>
          <a>
            LocalVideo:
          </a>
          <video  ref={this.videoLocal} autoPlay playsInline />
          <a>
            RemoteVideo:
          </a>
          <video  ref={this.videoRemote} autoPlay playsInline />
        </div>
        <button type="button" ref={this.buttonStart} > Start </button>
        <button type="button" ref={this.buttonCall} > Call </button>
        <button type="button" ref={this.buttonHangup} > Hangup </button>
      </div>
    )
  }
}


export default Video
