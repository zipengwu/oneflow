import {Component, createElement} from 'react';
import Rx from 'rxjs';

const actionFlow = new Rx.Subject();
const flow = actionFlow.scan(({state}, update) => {
        let change = update instanceof Function ? update(state) : update;
        return {update: change, state: Object.assign(state, change)};
    }
    , {state: {}})
    .filter(({update}) => update instanceof Object && Object.keys(update).length)
    .publishBehavior({update: {}, state: {}});

flow.connect();

const connect = (WrappedComponent, stateInjector = true, actionInjector) => {
    let actionHandlers = {};
    for (let key in actionInjector) {
        actionHandlers[key] = (...params) => actionFlow.next(actionInjector[key](...params));
    }
    let nameMapping = [];
    let funcMapping = [];
    if (stateInjector instanceof Object && Object.keys(stateInjector).length) {
        for (let key in stateInjector) {
            if (stateInjector[key] === true) {
                nameMapping.push(key)
            }
            else if (stateInjector[key] instanceof Function) {
                funcMapping.push(key)
            }
        }
    }
    class Connect extends Component {
        componentWillMount() {
            if (funcMapping.length) {
                this.subscription = flow
                    .map(({state}) => {
                        let impact = {};
                        funcMapping.forEach(key => impact[key] = stateInjector[key](state));
                        nameMapping.forEach(key => impact[key] = state[key]);
                        return impact;
                    })
                    .subscribe(impact => this.setState(impact));
            }
            else if (nameMapping.length) {
                this.subscription = flow
                    .filter(({update}) => {
                        let updateKeys = Object.keys(update);
                        return !!nameMapping.find(prop => updateKeys.includes(prop))
                    })
                    .subscribe(({update}) => this.setState(update));
            }
            else if (stateInjector === true) {
                this.subscription = flow.subscribe(({update}) => this.setState(update));
            }
        }

        componentWillUnmount() {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        }

        render() {
            return createElement(WrappedComponent, Object.assign({}, this.state, actionHandlers, this.props));
        }
    }
    return Connect;
}

const next = (state) => actionFlow.next(state);

const initState = (state) => {
    next(currentState => {
        if (currentState) {
            Object.keys(currentState).forEach(key => {
                delete currentState[key]
            });
        }
        return state;
    });
};

const subscribe = (observer) => flow.subscribe(({update, state}) => observer(update, state));

export {connect, next, subscribe, initState};