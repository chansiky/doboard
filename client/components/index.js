/**
 * `components/index.js` exists simply as a 'central export' for our components.
 * This way, we can import all of our components from the same place, rather than
 * having to figure out which file they belong to!
 */
export {default as Navbar} from './navbar'
export {default as UserHome} from './user-home'
export {Login, Signup} from './auth-form'

export { default as CanvasPage } from './canvas-page.js'
export { default as Canvas } from './canvas'
export { default as Video } from './video.js'
export { default as VideoComponent } from './video-component.js'
export { default as VideoApp } from './video-app.js'
