import {oneflow} from './oneflow';
import {expect} from 'chai';

const dummyAction = (params) => (state) => params
const next = oneflow.from(dummyAction)

describe('oneflow instance spec: ', () => {
    it('initState will reset scan accumulator', () => {
        let currentState = {};
        let subscription = oneflow.subscribe((change, state) => currentState = state);
        oneflow.initState({});
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
        let subscription = oneflow.subscribe((change, state) => state1 = state);
        expect(state1).to.deep.equal({});
        next({name: "hello"});
        expect(state1).to.deep.equal({name: "hello"});
        subscription.unsubscribe();
        next({value: "value2"});
        next({init: 'init'});
        let state2 = {};
        subscription = oneflow.subscribe((change, state) => state2 = state);
        expect(state2).to.deep.equal({name: "hello", value: "value2", init: 'init'});
        subscription.unsubscribe();
    });

    it('when subscribe, will get the last latest state', () => {
        let state1 = {};
        oneflow.initState({});
        let subscription = oneflow.subscribe((change, state) => state1 = state);
        expect(state1).to.deep.equal({});
        next({name: "hello"});
        expect(state1).to.deep.equal({name: "hello"});
        subscription.unsubscribe();
        next({value: "value2"});
        next({init: 'init'});
        let state2 = {};
        subscription = oneflow.subscribe((change, state) => state2 = state);
        expect(state2).to.deep.equal({name: "hello", value: "value2", init: 'init'});
        subscription.unsubscribe();
    });
});
