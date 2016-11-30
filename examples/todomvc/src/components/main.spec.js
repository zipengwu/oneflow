import React from "react";
import {Main} from "./main";
import {ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS} from "../constants";
import {expect} from "chai";
import {mount} from "enzyme";
import * as sinon from "sinon";

describe('Main component', () => {
	it('when showing is ALL_TODOS, show all todos', () => {
		let todos = getTodos();
		const {items} = setup(todos, ALL_TODOS);
		expect(items).to.have.length(3);
	})

	it('when showing is ACTIVE_TODOS, show only todos which is not completed', () => {
		let todos = getTodos();
		const {items} = setup(todos, ACTIVE_TODOS);
		expect(items).to.have.length(2);
	})

	it('when showing is COMPLETED_TODOS, show only todos which is completed', () => {
		let todos = getTodos();
		const {items} = setup(todos, COMPLETED_TODOS);
		expect(items).to.have.length(1);
	})

	it('when showing is COMPLETED_TODOS, show only todos which is completed', () => {
		let todos = getTodos();
		const {toggleAll, actions} = setup(todos, COMPLETED_TODOS);
		toggleAll.simulate('change');
		expect(actions.onToggleAll.calledOnce).to.be.true;
	})
})

const setup = (todos = [], showing = ALL_TODOS) => {
	const actions = {
		onToggleAll: sinon.spy()
	}
	const component = mount(
		<Main todos={todos} showing={showing} {...actions} />
	)

	return {
		component: component,
		actions: actions,
		items: component.find('li'),
		toggleAll: component.find('.toggle-all')
	}
}

const getTodos = () => {
	return [
		{id: 'a', title: 'a', completed: false},
		{id: 'b', title: 'b', completed: true},
		{id: 'c', title: 'c', completed: false},
	]
}