import React from "react";
import {pluralize} from "../utils";
import {ACTIVE_TODOS, COMPLETED_TODOS, ALL_TODOS} from "../constants";
import {IndexLink} from "react-router";
import {clearCompleted} from "../actions/index";
import * as flow from "oneflow";

export const Footer = ({count, completedCount, onClearCompleted}) => {
	let activeCount = count - completedCount;
	const clearButton = completedCount > 0 ?
		<button
			className='clear-completed'
			onClick={e => onClearCompleted()}>
			Clear completed
		</button>
		: null;

	return count ? (
		<footer className='footer'>
					<span className='todo-count'>
						<strong>{activeCount}</strong> {pluralize(activeCount, 'item')} left
					</span>
			<ul className='filters'>
				<li><IndexLink to='/' activeClassName='selected'>{ALL_TODOS}</IndexLink></li>
				{' '}
				<li><IndexLink to={'/' + ACTIVE_TODOS} activeClassName='selected'>{ACTIVE_TODOS}</IndexLink></li>
				{' '}
				<li><IndexLink to={'/' + COMPLETED_TODOS} activeClassName='selected'>{COMPLETED_TODOS}</IndexLink>
				</li>
			</ul>
			{clearButton}
		</footer>
	)
		: null;
}

const stateInjector = {
	count: state => state.todos.length,
	completedCount: state => state.todos.filter(todo => todo.completed).length
}

const actionInjector = {onClearCompleted: clearCompleted}

export default flow.connect(Footer, stateInjector, actionInjector)