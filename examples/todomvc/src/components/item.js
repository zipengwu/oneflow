import React, {PropTypes} from "react";
import classNames from "classnames";
import {ESCAPE_KEY, ENTER_KEY} from "../constants";
import {toggleTodo, editTodo, deleteTodo} from "../actions/index";
import * as flow from "oneflow";

export class Item extends React.Component {
	state = {text: this.props.todo.title}

	componentDidUpdate(prevProps) {
		if (!prevProps.editing && this.props.editing && this.textInput) {
			this.textInput.focus();
		}
	}

	render() {
		const {todo, editing, onToggle, onEdit, onCancel, onSubmit, onDelete} = this.props;
		return (
			<li className={classNames({
				completed: todo.completed,
				editing: editing === todo.id
			})}>
				{
					editing === todo.id ?
						<input
							className='edit'
							ref={input => this.textInput = input}
							value={this.state.text}
							onBlur={e => {
								onSubmit(todo.id, this.state.text.trim());
								onCancel();
							}}
							onChange={e => this.setState({text: e.target.value})}
							onKeyDown={e => {
								switch (e.which) {
									case ENTER_KEY:
										onSubmit(todo.id, this.state.text.trim())
										onCancel();
										break;
									case ESCAPE_KEY:
										onCancel();
										this.setState({text: todo.title})
								}
							}}
						/>
						:
						<div className='view'>
							<input
								className='toggle'
								type='checkbox'
								checked={todo.completed}
								onChange={e => onToggle(todo.id)}
							/>
							<label onDoubleClick={e => onEdit(todo.id)}>
								{todo.title}
							</label>
							<button className='destroy' onClick={e => onDelete(todo.id)}/>
						</div>
				}
			</li>
		);
	}
}

const stateInjector = {
	todo: false,
	editing: true
}

const actionInjector = {
	onToggle: toggleTodo,
	onEdit: id => ({editing: id}),
	onCancel: () => ({editing: null}),
	onSubmit: editTodo,
	onDelete: deleteTodo
}

export default flow.connect(Item, stateInjector, actionInjector)