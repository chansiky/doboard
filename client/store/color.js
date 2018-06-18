//initialState
const initialState = {
  currentColor: 'black',
  colors: ['black', 'red', 'white']
}

//action types
const SET_COLOR = 'SET_COLOR'

//action creators
export const setColorAcreator = ( color ) => {
  return {
    type: SET_COLOR,
    color
  }
}

//action creator thunk

//reducer
export default function(state = initialState, action) {
  switch (action.type){
  case SET_COLOR:
    return {...state, currentColor: action.color}
  default:
    return state
  }
}
