import {Component, createElement} from 'react'
import Rx from 'rxjs'

let _debug = false;
let debug = (flag) => _debug = flag;

let actionFlow = new Rx.Subject();
let stateFlow = new Rx.BehaviorSubject({});

actionFlow.scan((currentState, update) => {
    let change = update instanceof Function ? update(currentState) : update;
    let newState = Object.assign(currentState, change);
    if (_debug) {
        console.log(`change: ${JSON.stringify(change)}`);
        console.log(`newState: ${JSON.stringify(newState)}`);
    }
    return newState;
}, {})
    .subscribe(state => stateFlow.next(state));


let connect = (WrappedComponent) => {
    class Connect extends Component {
        componentWillMount() {
            stateFlow.subscribe(state => this.setState(state));
        }

        render() {
            return createElement(WrappedComponent, {...this.state});
        }
    }
    return Connect;
}

let next = (state) => actionFlow.next(state);
let initState = next;

export {connect, next, initState, debug};