import React from "react";
import {Footer} from "./footer";
import {expect} from "chai";
import {shallow} from "enzyme";
import * as sinon from "sinon";

describe('Footer component', () => {
	it('when count is 0, component render no footer', () => {
		const {footer} = setup();
		expect(footer).to.have.length(0);
	})

	it('when completedCount is 0, there is no clearButton', () => {
		const {clearButton} = setup(3)
		expect(clearButton).to.have.length(0);
	})

	it('when clearButton is clicked, onClearcompleted is called', () => {
		const {clearButton, actions} = setup(3, 1)
		clearButton.simulate('click');
		expect(actions.onClearCompleted.calledOnce).to.be.true;
	})
})

const setup = (count = 0, completedCount = 0) => {
	const actions = {
		onClearCompleted: sinon.spy()
	}
	const component = shallow(
		<Footer count={count} completedCount={completedCount} {...actions} />
	)

	return {
		component: component,
		actions: actions,
		clearButton: component.find('button'),
		footer: component.find('footer')
	}
}