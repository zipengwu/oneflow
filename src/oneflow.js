import {Component, createElement} from 'react'
import Rx from 'rxjs'

let _debug = false;
const debug = (flag) => _debug = flag;

const actionFlow = new Rx.Subject();
const changeFlow = new Rx.BehaviorSubject({});
const stateFlow = new Rx.BehaviorSubject({});

actionFlow.scan((currentState, update) => {
    let change = update instanceof Function ? update(currentState) : update;
    let newState = Object.assign(currentState, change);
    changeFlow.next(change);
    return newState;
}, {})
    .subscribe(state => stateFlow.next(state));


const connect = (WrappedComponent) => {
    class Connect extends Component {
        componentWillMount() {
            this.setState(stateFlow.getValue());
            this.subscription = changeFlow.subscribe(state => this.setState(state));
        }

        componentWillUnmount() {
            this.subscription.unsubscribe();
        }

        render() {
            return createElement(WrappedComponent, Object.assign({}, this.state, this.props));
        }
    }
    return Connect;
}

const next = (state) => actionFlow.next(state);
const initState = next;

let log = (info, state) => {
    if (_debug){
        console.log(`${info} : ${JSON.stringify(state)}`);
    }
}
const setLogger = (logger) => log = logger;

changeFlow.subscribe(state => log('change', state));
stateFlow.subscribe(state => log('state', state));

export {connect, next, initState, debug, setLogger};