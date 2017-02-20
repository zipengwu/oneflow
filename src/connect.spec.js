import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import {connect} from './connect';
import {oneflow} from './oneflow';
import {spy} from 'sinon';

const CLASSNAME = "test class name";
const VALUE = "test value";
const Wrap = ({name, value}) => <div className={name}>{value}</div>
const AB = ({a, b}) => <div>{`${a} - ${b}`}</div>
const Button = ({text, clickHandler, counter}) => <div>
    <button onClick={() => clickHandler(0, counter)}>{text}</button>
    <p>{counter}</p>
</div>
const dummyAction = (params) => (state) => params
const next = oneflow.action(dummyAction)

describe('connect spec: ', () => {

    it('when connect(), return a react component', () => {
        oneflow.initState({});
        const Connect = connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div).to.exist;
        expect(div.text()).to.be.empty;
    });

    it('initState() init component state', () => {
        oneflow.initState({name: CLASSNAME, value: VALUE});
        const Connect = connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
    });

    it('flow next() updates component state', () => {
        oneflow.initState({name: CLASSNAME, value: VALUE});
        const Connect = connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
        next({name: "name2", value: "value2"})
        expect(div.text()).to.equal("value2");
        expect(div.prop('className')).to.equal("name2");
    });
});



describe('Connected component spec: ', () => {
    it('if props exist, take props instead of the one from flow', () => {
        oneflow.initState({name: CLASSNAME, value: VALUE});
        const Connect = connect(Wrap);
        const target = mount(<Connect name="propname"/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("propname");
        next({name: CLASSNAME, value: VALUE});
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("propname");
    });

    it('partial state update works', () => {
        oneflow.initState({name: CLASSNAME, value: VALUE});
        const Connect = connect(Wrap);
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal(CLASSNAME);
        next({name: "test2"});
        expect(div.text()).to.equal(VALUE);
        expect(div.prop('className')).to.equal("test2");
        next({value: "test3"});
        expect(div.text()).to.equal("test3");
        expect(div.prop('className')).to.equal("test2");
        next({name: "test4", value: "test4"});
        expect(div.text()).to.equal("test4");
        expect(div.prop('className')).to.equal("test4");
    });

    it('if update is undefined or empty, setState() will not be called', () => {
        const Connect = connect(AB);
        const target = mount(<Connect/>);
        let setState = spy(target.instance(), "setState")
        next({name: "name"});
        expect(setState.calledOnce).to.be.true;
        next({a: "1", b: "2"});
        expect(setState.calledTwice).to.be.true;
        next({});
        expect(setState.calledThrice).to.be.false;
        next(null);
        expect(setState.calledThrice).to.be.false;
    });
});

describe('Component with state mapping spec: ', () => {
    beforeEach(() => {
        oneflow.initState({});
    });

    it('if stateInjector defined, Connected component works as usual', () => {
        const Connect = connect(AB, ({a, b}) => ({a, b}));
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render");
        const div = target.find('div');
        next({a: "1", b: "2"});
        expect(div.text()).to.equal("1 - 2");
        next({name: "name"});
        expect(div.text()).to.equal("1 - 2");
        next({b: "4"});
        expect(div.text()).to.equal("1 - 4");
        next({});
        expect(div.text()).to.equal("1 - 4");
        next({a: "7"});
        expect(div.text()).to.equal("7 - 4");
    });

    it('if watch undefined, render() call at very updates', () => {
        const Connect = connect(AB);
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        next({name: "name"});
        expect(render.calledOnce).to.be.true;
        next({a: "1", b: "2"});
        expect(render.calledTwice).to.be.true;
    });

    it('if watch defined, render() called only at props updates', () => {
        const Connect = connect(AB, true, {}, ['a', 'b']);
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        next({a: "1", b: "2"});
        expect(render.calledOnce).to.be.true;
        next({name: "name"});
        expect(render.calledOnce).to.be.true;
        next({b: "4"});
        expect(render.calledTwice).to.be.true;
        next({});
        expect(render.calledTwice).to.be.true;
        next({a: "7"});
        expect(render.calledThrice).to.be.true;
    });

    it('if stateInjector set to false, no state subscription', () => {
        const Connect = connect(AB, false);
        const target = mount(<Connect/>);
        let render = spy(target.instance(), "render")
        next({a: "1", b: "2"});
        expect(render.called).to.be.false;
        next({name: "name"});
        expect(render.called).to.be.false;
        next({b: "4"});
        expect(render.called).to.be.false;
    });

    it('stateInjector can pass functions to compute props with latest state', () => {
        next({a: 1, c: 2});
        const Connect = connect(AB, ({a,c}) => ({a, b:a+c}));
        const target = mount(<Connect/>);
        const div = target.find('div');
        expect(div.text()).to.equal("1 - 3");
        next({name: "name"});
        expect(div.text()).to.equal("1 - 3");
        next({b: 4});
        expect(div.text()).to.equal("1 - 3");
        next({});
        expect(div.text()).to.equal("1 - 3");
        next({a: 7});
        expect(div.text()).to.equal("7 - 9");
        next({c: 17});
        expect(div.text()).to.equal("7 - 24");
    });

    it('actionInjector can inject action functions to component props', () => {
        oneflow.initState({text: "click", counter: 0});
        let action = (unuse, counter, unuse2) => (state) =>{
            let num = ++counter;
            return {text: `click ${num}`, counter: num};
        };
        let spyHandler = spy(action);
        const Connect = connect(Button, true, {clickHandler: spyHandler});
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