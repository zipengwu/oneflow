import React from "react";
import {Item} from "./item";
import {expect} from "chai";
import {shallow} from "enzyme";
import * as sinon from "sinon";

describe('Item component', () => {
	it('when editing is not the same as the current todo, show view', () => {
		const {edit, view} = setup(todo, 'b');
		expect(edit).to.have.length(0);
		expect(view).to.have.length(1);
	})

	it('when editing is not the same as the current todo, show view', () => {
		const {edit, view} = setup(todo, 'a');
		expect(edit).to.have.length(1);
		expect(view).to.have.length(0);
	})
})

const setup = (todo, editing) => {
	const actions = {
		onToggle: sinon.spy(),
		onEdit: sinon.spy(),
		onCancel: sinon.spy(),
		onSubmit: sinon.spy(),
		onDelete: sinon.spy()
	}
	const component = shallow(
		<Item todo={todo} editing={editing} {...actions} />
	)

	return {
		component: component,
		actions: actions,
		edit: component.find('.edit'),
		view: component.find('.view')
	}
}

const todo = {id: 'a', title: 'a', completed: false};