import {Component, createElement} from 'react'
import Rx from 'rxjs'

let _debug = false;
let debug = (flag) => _debug = flag;

let flow = new Rx.BehaviorSubject({});
let stateFlow = flow.scan((oldState, newState) => {
    let state = Object.assign(oldState, newState)
    if (_debug) {
        console.log(`newState: ${JSON.stringify(state)}`);
    }
    return state;
});

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

let next = (state) => flow.next(state);
let initState = next;

export {connect, next, initState, debug};



