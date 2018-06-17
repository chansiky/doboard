import React from 'react'


var localConnection;
var remoteConnection;
var sendChannel;
var receiveChannel;

const mediaStreamContraints = {
  video: true,
};

const localVideo = document.querySelector('video');

function gotLocalMediaStream(mediaStream) {
  
}

class TextBox extends React.Component{
  render(){
    return (
      <div>
        <h1>
          <label htmlFor="textSend" > Send Text </label>
          <input name="textSend" type="text" />
        </h1>
      </div>
    )
  }
}

export default TextBox
