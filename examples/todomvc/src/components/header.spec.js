import React from "react";
import {Header} from "./header";
import {expect} from "chai";
import {shallow} from "enzyme";
import * as sinon from "sinon";

describe('Header component', () => {
	it('when user input ENTER, onSubmit is called', () => {
		const {input, actions} = setup();
		input.simulate('change', {target: {value: 'text'}});
		input.simulate('keydown', {which: 13});
		expect(actions.onSubmit.calledWith('text')).to.be.true;
	})
})

const setup = () => {
	const actions = {
		onSubmit: sinon.spy()
	}
	const component = shallow(
		<Header {...actions} />
	)

	return {
		component: component,
		actions: actions,
		input: component.find('input')
	}
}