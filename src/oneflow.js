import Rx from 'rxjs';

const compose = (...funcs) => {
    funcs = funcs.filter(func => typeof func === 'function')
    if (funcs.length === 0) {
        return arg => arg
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((a, b) => (first, ...rest) => a(b(first, ...rest), ...rest))
}

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
        if (middlewares.length) {
            let combine = compose(...middlewares);
            this.next = (action, meta) => this.action$.next(combine(action, meta));
        }
        else {
            this.next = (action) => this.action$.next(action);
        }
    }

    subscribe(observer) {
        return this.state$.subscribe(({update, state}) => observer(update, state));
    }

    action(action, name) {
        return (...args) => {
            let meta = {
                '@@ACTION': name ? name : action.name,
                '@@ACTION_PARAMS': args
            }
            this.next(action(...args), meta);
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