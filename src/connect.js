import {Component, createElement} from 'react';
import {oneflow} from './oneflow';

// test pr 123
const connectAvance = (flowInstance) => (wrapped, stateInjector = true, actionInjector = {}, watch) => {
    let stateflow
    if (stateInjector) {
        stateflow = flowInstance.state$;
        if (watch instanceof Array && watch.length) {
            stateflow = stateflow.filter(({update}) => watch.findIndex(el => update.hasOwnProperty(el)) !== -1)
        }
        if (stateInjector === true) {
            stateflow = stateflow.map(({state}) => state)
        }
        else if (stateInjector instanceof Function) {
            stateflow = stateflow.map(({state}) => stateInjector(state))
        }
    }

    let actionHandlers = {};
    for ( const key in actionInjector ) {
        actionHandlers[key] = flowInstance.action(actionInjector[key], `${actionInjector[key].name}[${flowInstance.name}:${key}]`)
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
            return createElement(wrapped, Object.assign({}, this.state, actionHandlers, this.props));
        }

        static getWrappedComponent() {
            return wrapped;
        }
    }
    return Connect;
}

const connect = connectAvance(oneflow);

export {connectAvance, connect};
