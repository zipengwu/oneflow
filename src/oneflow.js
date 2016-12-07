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
    let stateflow;
    if (stateInjector === true) {
        stateflow = flow.map(({state}) => state);
    }
    else if (stateInjector instanceof Object && Object.keys(stateInjector).length) {
        let nameMapping = [];
        let funcMapping = [];
        for (let key in stateInjector) {
            if (stateInjector[key] === true) {
                nameMapping.push(key)
            }
            else if (stateInjector[key] instanceof Function) {
                funcMapping.push(key)
            }
        }
        if (funcMapping.length) {
            stateflow = flow
                .map(({state}) => {
                    let impact = {};
                    funcMapping.forEach(key => impact[key] = stateInjector[key](state));
                    nameMapping.forEach(key => impact[key] = state[key]);
                    return impact;
                })
        }
        else if (nameMapping.length) {
            stateflow = flow
                .filter(({update}) => {
                    let updateKeys = Object.keys(update);
                    return !!nameMapping.find(prop => updateKeys.includes(prop))
                })
                .map(({update}) => update)
        }
        else {
            //should never happen
        }
    }

    class Connect extends Component {
        componentWillMount() {
            if (stateflow) {
                this.subscription = stateflow.subscribe(state => this.setState(state));
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

        static getWrappedComponent() {
            return WrappedComponent;
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