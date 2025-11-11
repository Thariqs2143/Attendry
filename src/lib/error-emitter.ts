
import { EventEmitter } from 'events';

// Since we are in a single-threaded environment for the user's session,
// a simple event emitter is sufficient.
export const errorEmitter = new EventEmitter();
