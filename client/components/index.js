/**
 * `components/index.js` exists simply as a 'central export' for our components.
 * This way, we can import all of our components from the same place, rather than
 * having to figure out which file they belong to!
 */
export {default as Navbar} from './navbar'
export {default as UserHome} from './user-home'
export {default as Canvas} from './canvas'
export {default as TextBox} from './text-box'
export {Login, Signup} from './auth-form'

export { default as VideoComponent } from './video-component.js'
export { default as VideoApp } from './video-app.js'
