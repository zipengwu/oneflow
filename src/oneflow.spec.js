import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import * as flow from './oneflow';
import {spy} from 'sinon';

const CLASSNAME = "test class name";
const VALUE = "test value";
const Wrap = ({name, value}) => <div className={name}>{value}</div>
const Num = ({i}) => <div>{i}</div>
const AB = ({a, b}) => <div>{`${a} - ${b}`}</div>
const Button = ({text, clickHandler, counter}) => <div>
    <button onClick={() => clickHandler(0, counter)}>{text}</button>
    <p>{counter}</p>
</div>

describe('Exported methods spec: ', () => {

    it('when connect(), return a react component', () => {
        const Connect = flow.connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div).to.exist;
        expect(div.text()).to.be.empty;
    });

    it('initState() init component state', () => {
        flow.initState({name: CLASSNAME, value: VALUE});
        const Connect = flow.connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
    });

    it('next() updates component state', () => {
        flow.initState({name: CLASSNAME, value: VALUE});
        const Connect = flow.connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
        flow.next({name: "name2", value: "value2"});
        expect(div.text()).to.equal("value2");
        expect(div.prop('className')).to.equal("name2");
    });

    it('next() able to pass lambda with latest state', () => {
        flow.initState({i: 1});
        const Connect = flow.connect(Num);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal('1');
        flow.next(currentState => {
            return {i: ++currentState.i};
        });
        expect(div.text()).to.equal('2');
        flow.next(currentState => {
            return {i: currentState.i + 10};
        });
        expect(div.text()).to.equal('12');
    });

    it('initState will reset scan accumulator', () => {
        let currentState = {};
        let subscription = flow.subscribe((change, state) => currentState = state);
        flow.initState({});
        expect(currentState).to.deep.equal({});
        flow.next({name: "hello"});
        expect(currentState).to.deep.equal({name: "hello"});
        flow.next({value: "value2"});
        expect(currentState).to.deep.equal({name: "hello", value: "value2"});
        flow.next({init: 'init'});
        expect(currentState).to.deep.equal({name: "hello", value: "value2", init: 'init'});
        flow.initState({init: 'init'});
        expect(currentState).to.deep.equal({init: 'init'});
        subscription.unsubscribe();
    });
});

describe('Connected component spec: ', () => {
    it('if props exist, take props instead of the one from flow', () => {
        flow.initState({name: CLASSNAME, value: VALUE});
        const Connect = flow.connect(Wrap);
        const target = mount(<Connect name="propname"/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("propname");
        flow.next({name: CLASSNAME, value: VALUE});
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("propname");
    });

    it('partial state update works', () => {
        flow.initState({name: CLASSNAME, value: VALUE});
        const Connect = flow.connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
        flow.next({name: "test2"});
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("test2");
        flow.next({value: "test3"});
        expect(div.text()).to.equal("test3");
        expect(div.prop('className')).to.equal("test2");
        flow.next({name: "test4", value: "test4"});
        expect(div.text()).to.equal("test4");
        expect(div.prop('className')).to.equal("test4");
    });
});

describe('Component with state mapping spec: ', () => {
    beforeEach(() => {
        flow.initState({});
    });

    it('if stateInjector defined, Connected component works as usual', () => {
        const Connect = flow.connect(AB, {a: true, b: true});
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render");
        const div = target.find('div');
        flow.next({a: "1", b: "2"});
        expect(div.text()).to.equal("1 - 2");
        flow.next({name: "name"});
        expect(div.text()).to.equal("1 - 2");
        flow.next({b: "4"});
        expect(div.text()).to.equal("1 - 4");
        flow.next({});
        expect(div.text()).to.equal("1 - 4");
        flow.next({a: "7"});
        expect(div.text()).to.equal("7 - 4");
    });

    it('if stateInjector undefined, render() call at very updates', () => {
        const Connect = flow.connect(AB);
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        flow.next({name: "name"});
        expect(render.calledOnce).to.be.true;
        flow.next({a: "1", b: "2"});
        expect(render.calledTwice).to.be.true;
        flow.next({});
        expect(render.calledThrice).to.be.true;
    });

    it('if stateInjector defined, render() called only at props updates', () => {
        const Connect = flow.connect(AB, {a: true, b: true});
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        flow.next({a: "1", b: "2"});
        expect(render.calledOnce).to.be.true;
        flow.next({name: "name"});
        expect(render.calledOnce).to.be.true;
        flow.next({b: "4"});
        expect(render.calledTwice).to.be.true;
        flow.next({});
        expect(render.calledTwice).to.be.true;
        flow.next({a: "7"});
        expect(render.calledThrice).to.be.true;
    });

    it('if stateInjector set to false, no state subscription', () => {
        const Connect = flow.connect(AB, false);
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        flow.next({a: "1", b: "2"});
        expect(render.called).to.be.false;
        flow.next({name: "name"});
        expect(render.called).to.be.false;
        flow.next({b: "4"});
        expect(render.called).to.be.false;
    });

    it('stateInjector can pass functions to compute props with latest state', () => {
        flow.next({a: 1, c: 2});
        const Connect = flow.connect(AB, {a: true, b: state => state.a + state.c});
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal("1 - 3");
        flow.next({name: "name"});
        expect(div.text()).to.equal("1 - 3");
        flow.next({b: 4});
        expect(div.text()).to.equal("1 - 3");
        flow.next({});
        expect(div.text()).to.equal("1 - 3");
        flow.next({a: 7});
        expect(div.text()).to.equal("7 - 9");
        flow.next({c: 17});
        expect(div.text()).to.equal("7 - 24");
    });

    it('actionInjector can inject action functions to component props', () => {
        flow.initState({text: "click", counter: 0});
        let action = (unuse, counter, unuse2) => {
            let num = ++counter;
            return {text: `click ${num}`, counter: num};
        };
        let spyHandler = spy(action);
        const Connect = flow.connect(Button, true, {clickHandler: spyHandler});
        const target = mount(<Connect/>);
        const button = target.find('button');
        const p = target.find('p');
        expect(p.text()).to.equal("0");
        expect(button.text()).to.equal("click");
        button.simulate('click');
        expect(spyHandler.calledOnce).to.be.true;
        expect(p.text()).to.equal("1");
        expect(button.text()).to.equal("click 1");
        button.simulate('click');
        expect(spyHandler.calledTwice).to.be.true;
        expect(p.text()).to.equal("2");
        expect(button.text()).to.equal("click 2");
    });
});