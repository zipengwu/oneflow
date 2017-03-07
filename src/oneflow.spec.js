import {oneflow} from './oneflow';
import {expect} from 'chai';

const dummyState = (params) => (state) => params
const dummyState$ = oneflow.action(dummyState)

const nullState = (params) => null
const nullState$ = oneflow.action(nullState)

const calculate = (a, b) => ({result}) => ({result: (result | 0 + a) * b})
const calculate$ = oneflow.action(calculate)

describe('oneflow instance spec: ', () => {
    it('initState will reset scan accumulator', () => {
        oneflow.initState({});
        let currentState = {};
        let subscription = oneflow.subscribe((update, state) => currentState = state);
        expect(currentState).to.deep.equal({});
        dummyState$({name: "hello"});
        expect(currentState).to.deep.equal({name: "hello"});
        dummyState$({value: "value2"});
        expect(currentState).to.deep.equal({name: "hello", value: "value2"});
        dummyState$({init: 'init'});
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
        dummyState$({name: "hello"});
        expect(state1).to.deep.equal({name: "hello"});
        subscription.unsubscribe();
        dummyState$({value: "value2"});
        dummyState$({init: 'init'});
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
    beforeEach(() => {
        oneflow.initState({});
    });

    afterEach(() => {
        oneflow.applyMiddlewares();
    });

    const middleware = (mutate, meta, flow) => {
        return mutate instanceof Function ? 
            state => Object.assign({}, mutate(state), {
                action: meta['@@ACTION'],
                middleware: 1
            })
            :
            Object.assign({}, mutate, {
                action: meta['@@ACTION'],
                middleware: 1
            })
    }

    const middleware2 = (mutate, meta, flow) => {
        return mutate instanceof Function ? 
            state => Object.assign({}, mutate(state), { middleware: 2 })
            :
            Object.assign({}, mutate, { middleware: 2 })
    }

    it('middleware can read action meta info', () => {
        let currentState = {}
        let subscription = oneflow.subscribe((update, state) => currentState = state);
        oneflow.applyMiddlewares(middleware)
        expect(currentState).to.deep.equal({});
        dummyState$({a: 1, b: 2});
        expect(currentState).to.deep.equal({a: 1, b: 2, action: 'dummyState', middleware: 1});
        calculate$(1, 2);
        expect(currentState).to.deep.equal({a: 1, b: 2, result: 2, action: 'calculate', middleware: 1});
        subscription.unsubscribe();
    });

    it('Apply middlewares cumulative and in right order', () => {
        let currentState = {}
        let subscription = oneflow.subscribe((update, state) => currentState = state);
        oneflow.applyMiddlewares(middleware2, middleware)
        expect(currentState).to.deep.equal({});
        dummyState$({a: 1, b: 2});
        expect(currentState).to.deep.equal({a: 1, b: 2, action: 'dummyState', middleware: 2});
        calculate$(1, 2);
        expect(currentState).to.deep.equal({
            a: 1,
            b: 2,
            result: 2,
            action: 'calculate',
            middleware: 2
        });
        subscription.unsubscribe();
    });

    it('initState can be monitor by middleware', () => {
        let metainfo;
        const metaMonitor = (action, meta, flow) => metainfo = meta;
        oneflow.applyMiddlewares(metaMonitor);
        oneflow.initState({count: 0});
        expect(metainfo['@@ACTION']).to.be.equal('initState');
    });

    it('action return null can work with middleware', () => {
        let currentState;
        let subscription = oneflow.subscribe((update, state) => currentState = state);
        oneflow.applyMiddlewares(middleware)
        nullState$({a: 1, b: 2});
        expect(currentState).to.deep.equal({action: 'nullState', middleware: 1});
        subscription.unsubscribe();
    });
});

