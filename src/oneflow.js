import {Component, createElement} from 'react'
import Rx from 'rxjs'

let _debug = false;
const debug = (flag) => _debug = flag;

const actionFlow = new Rx.Subject();
const changeFlow = new Rx.Subject();
const stateFlow = new Rx.BehaviorSubject({});

actionFlow.scan((currentState, update) => {
    let change = update instanceof Function ? update(currentState) : update;
    let newState = Object.assign(currentState, change);
    stateFlow.next(newState);
    changeFlow.next(change);
    return newState;
}, {})
    .publish()
    .connect();


const connect = (WrappedComponent, stateInjector = true) => {
    class Connect extends Component {
        componentWillMount() {
            this.setState(stateFlow.getValue());
            if (stateInjector instanceof Object && !!Object.keys(stateInjector).length) {
                let nameMapping = [];
                for (let key in stateInjector) {
                    if (stateInjector[key] === true) {
                        nameMapping.push(key)
                    }
                }
                this.subscription = changeFlow
                    .filter(state => {
                        let stateKeys = Object.keys(state);
                        return !!nameMapping.find(prop => stateKeys.includes(prop))
                    })
                    .subscribe(state => this.setState(state));
            }
            else if (stateInjector === true) {
                this.subscription = changeFlow.subscribe(state => this.setState(state));
            }
        }

        componentWillUnmount() {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        }

        render() {
            return createElement(WrappedComponent, Object.assign({}, this.state, this.props));
        }
    }
    return Connect;
}

const next = (state) => actionFlow.next(state);
const initState = (state) => {
    next(currentState => {
        Object.keys(currentState).forEach(key => {
            delete currentState[key]
        });
        return state;
    });
};

let log = (info, state) => {
    if (_debug) {
        console.log(`${info} : ${JSON.stringify(state)}`);
    }
}
const setLogger = (logger) => log = logger;

changeFlow.subscribe(state => log('change', state));
stateFlow.subscribe(state => log('state', state));

export {connect, next, initState, debug, setLogger, stateFlow};