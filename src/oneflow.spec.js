import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import * as flow from './oneflow'

const CLASSNAME = "test class name";
const VALUE = "test value";
const Wrap = ({name, value}) => <div className={name}>{value}</div>
const Num = ({i}) => <div>{i}</div>

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