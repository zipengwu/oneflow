import {oneflow} from './oneflow';
import {expect} from 'chai';

const dummyStateAction = (params) => (state) => params
const next = oneflow.action(dummyStateAction)

const calculateAction = (a, b) => ({result}) => ({result: (result | 0 + a) * b})
const calculate = oneflow.action(calculateAction)

describe('oneflow instance spec: ', () => {
    it('initState will reset scan accumulator', () => {
        oneflow.initState({});
        let currentState = {};
        let subscription = oneflow.subscribe((update, state) => currentState = state);
        expect(currentState).to.deep.equal({});
        next({name: "hello"});
        expect(currentState).to.deep.equal({name: "hello"});
        next({value: "value2"});
        expect(currentState).to.deep.equal({name: "hello", value: "value2"});
        next({init: 'init'});
        expect(currentState).to.deep.equal({name: "hello", value: "value2", init: 'init'});
        oneflow.initState({init: 'init'});
        expect(currentState).to.deep.equal({init: 'init'});
        subscription.unsubscribe();
    });

    it('when subscribe, will get the last latest state', () => {
        let state1 = {};
        oneflow.initState({});
        let subscription = oneflow.subscribe((update, state) => state1 = state);
        expect(state1).to.deep.equal({});
        next({name: "hello"});
        expect(state1).to.deep.equal({name: "hello"});
        subscription.unsubscribe();
        next({value: "value2"});
        next({init: 'init'});
        let state2 = {};
        subscription = oneflow.subscribe((update, state) => state2 = state);
        expect(state2).to.deep.equal({name: "hello", value: "value2", init: 'init'});
        subscription.unsubscribe();
    });

    it('Simple action with no state inject works', () => {
        oneflow.initState({});
        let action = oneflow.action(params => params);
        let change;
        let subscription = oneflow.subscribe(update => change = update);
        action({hello: true});
        expect(change).to.deep.equal({hello: true});
        action({name: "hello"});
        expect(change).to.deep.equal({name: "hello"});
        subscription.unsubscribe();
    });
});

describe('Middlewares spec: ', () => {
    const middleware = (action, meta, flow) => (state) => {
        let update = action(state);
        update.actionName = meta['@@ACTION'];
        return update;
    }

    const middleware2 = (action, meta, flow) => (state) => {
        let update = action(state);
        update.actionName = meta['@@ACTION'].replace('Action', 'Func');
        update.tag = 'middleware2'
        return update;
    }

    beforeEach(() => {
        oneflow.initState({});
    });

    afterEach(() => {
        oneflow.applyMiddlewares();
    });

    it('middleware can read action meta info', () => {
        let currentState;
        oneflow.applyMiddlewares(middleware)
        oneflow.subscribe((update, state) => currentState = state);
        expect(currentState).to.deep.equal({});
        next({a: 1, b: 2});
        expect(currentState).to.deep.equal({a: 1, b: 2, actionName: 'dummyStateAction'});
        calculate(1, 2);
        expect(currentState).to.deep.equal({a: 1, b: 2, result: 2, actionName: 'calculateAction'});
    });

    it('Apply middlewares cumulative and in right order', () => {
        let currentState;
        oneflow.applyMiddlewares(middleware2, middleware)
        oneflow.subscribe((update, state) => currentState = state);
        expect(currentState).to.deep.equal({});
        next({a: 1, b: 2});
        expect(currentState).to.deep.equal({a: 1, b: 2, actionName: 'dummyStateFunc', tag: 'middleware2'});
        calculate(1, 2);
        expect(currentState).to.deep.equal({
            a: 1,
            b: 2,
            result: 2,
            actionName: 'calculateFunc',
            tag: 'middleware2'
        });
    });
});

