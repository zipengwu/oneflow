import Rx from 'rxjs';
import compose from './compose';

class Oneflow {
    static instances = {};

    constructor(name) {
        this.name = name;
        this.action$ = new Rx.Subject();
        this.state$ = this.action$.scan(({state}, mutate) => {
                let update = mutate(state);
                return {state: Object.assign(state, update), update};
            }
            , {state: {}})
            .filter(({update}) => update instanceof Object && Object.keys(update).length)
            .publishBehavior({update: {}, state: {}});
        this.state$.connect();
        this.next = (action) => this.action$.next(action);
    }

    applyMiddlewares(...middlewares) {
        let combine = compose(...middlewares);
        this.next = (action) => this.action$.next(combine(action));
    }

    subscribe(observer) {
        return this.state$.subscribe(({update, state}) => observer(update, state));
    }

    from(action, name) {
        return (...args) => {
            let mutation = action(...args);
            //TODO: detect if mutation is a function
            Object.defineProperty(mutation, 'meta', {
                '@@ACTION': name ? name : action.name,
                '@@ACTION_PARAMS': args
            });
            this.next(mutation);
        }
    }

    initState(state) {
        this.action$.next(currentState => {
            if (currentState) {
                Object.keys(currentState).forEach(key => {
                    delete currentState[key]
                });
            }
            return state;
        });
    }

    static instance(name) {
        if (!this.instances[name]) {
            this.instances[name] = new Oneflow(name);
        }
        return this.instances[name];
    }
}

const oneflow = Oneflow.instance('default');
export {oneflow, Oneflow};