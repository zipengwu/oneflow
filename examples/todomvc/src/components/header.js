import React from "react";
import {addTodo} from "../actions/index";
import {ENTER_KEY} from "../constants";
import * as flow from "oneflow";

class HeaderView extends React.Component {
	state = {text: ''}

	render() {
		const {onSubmit} = this.props
		return (
			<header className='header'>
				<h1>todos</h1>
				<input
					className='new-todo'
					placeholder='What needs to be done?'
					value={this.state.text}
					onKeyDown={e => {
						if (e.which === ENTER_KEY) {
							onSubmit(this.state.text.trim());
							this.setState({text: ''});
						}
					}}
					onChange={e => this.setState({text: e.target.value})}
					autoFocus={true}
				/>
			</header>
		)
	}
}

const actionsInjector = {
	onSubmit: addTodo
}

export default flow.connect(HeaderView, false, actionsInjector)