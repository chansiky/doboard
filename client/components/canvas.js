import React from 'react'
import { TextBox } from './index'
import eventEmitter from 'events'

class Canvas extends React.Component{
  constructor(){
    super();
    this.localVideo   = React.createRef();
    this.remoteVideo  = React.createRef();
    this.startButton  = React.createRef();
    this.callButton   = React.createRef();
    this.hangupButton = React.createRef();
    this.streamButton = null;
    this.remoteStream = null;
    this.startTime    = null;
    this.localPeerConnection;
    this.remotePeerConnection;

    this.drawingCanvas = React.createRef();
  }


  setupCanvas() {
    // Set the size of the canvas and attach a listener
    // to handle resizing.
    resize()
    window.addEventListener('resize', resize)

    window.addEventListener('mousedown', function (e) {
        currentMousePosition = pos(e)
    });

    window.addEventListener('mousemove', function (e) {
        if (!e.buttons) return;
        lastMousePosition = currentMousePosition
        currentMousePosition = pos(e)
        lastMousePosition && currentMousePosition &&
            draw(lastMousePosition, currentMousePosition, color, true);
    });
  }


  componentDidMount(){
    //const drawingCanvas = this.drawingCanvas.current
    //const ctx = drawingCanvas.getContext('2d')
    const ctx = this.drawingCanvas.current.getContext('2d')

    ctx.fillStyle = 'green'
    ctx.fillRect(10, 10, 100, 100)
  }

  render() {
    return (
      <div>
        <h1>
          <TextBox />
          <video  ref={this.videoLocal} autoPlay playsInline />
          <video  ref={this.videoRemote} autoPlay playsInline />
        </h1>
        <div>
          <canvas ref={this.drawingCanvas} />
        </div>

        <button ref={this.buttonStart} />
        <button ref={this.buttonCall} />
        <button ref={this.buttonHangup} />
      </div>
    )
  }
}


export default Canvas
