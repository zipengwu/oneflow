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
                let update = mutate instanceof Function ? mutate(state) : mutate;
                return {state: Object.assign(state, update), update};
            }
            , {state: {}})
            .filter(({update}) => update instanceof Object && Object.keys(update).length)
            .publishBehavior({update: {}, state: {}});
        this.state$.connect();
    }

    applyMiddlewares(...middlewares) {
        this.combine = middlewares.length ? compose(...middlewares) : null;
    }

    subscribe(observer) {
        return this.state$.subscribe(({update, state}) => observer(update, state));
    }

    action(action, name) {
        return (...args) => {
            let mutate = action(...args);
            if(this.combine) {
                let meta = {
                '@@ACTION': name ? name : action.name,
                '@@ACTION_PARAMS': args
                }
                this.action$.next(this.combine(mutate, meta, this));
            }
            else {
                this.action$.next(mutate);
            }
        }
    }

    initState = this.action((newState) => (state) => {
            if (state) {
                Object.keys(state).forEach(key => {
                    delete state[key]
                });
            }
            return newState;
        }, 'initState')

    static instance(name) {
        if (!this.instances[name]) {
            this.instances[name] = new Oneflow(name);
        }
        return this.instances[name];
    }
}

const oneflow = Oneflow.instance('default');
export {oneflow, Oneflow};