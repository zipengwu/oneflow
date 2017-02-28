import React from "react";
import TodoItem from "./item";
import {toggleAll} from "../actions/index";
import {ACTIVE_TODOS, COMPLETED_TODOS} from "../constants";
import {connect} from "oneflow";

export const Main = ({todos, showing, onToggleAll}) => {
	return todos.length === 0 ? null : (
		<section className='main'>
			<input
				className='toggle-all'
				type='checkbox'
				onChange={e => onToggleAll()}
				checked={todos.filter(todo => !todo.completed).length === 0}
			/>
			<ul className='todo-list'>
				{
					todos
						.filter(todo => {
							switch (showing) {
								case ACTIVE_TODOS:
									return !todo.completed;
								case COMPLETED_TODOS:
									return todo.completed;
								default:
									return true;
							}
						})
						.map(todo => <TodoItem key={todo.id} todo={todo}/>)
				}
			</ul>
		</section>
	)
}

const stateInjector = (state) => ({todos: state.todos})

const actionInjector = {
	onToggleAll: toggleAll
}

export default connect(Main, stateInjector, actionInjector)