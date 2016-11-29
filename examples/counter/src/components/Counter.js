import React from "react";
import {increment, decrement} from "../actions/index";
import * as flow from "oneflow";

export const Counter = ({value, onIncrement, onDecrement}) => (
	<p>
		Clicked: {value} times
		{' '}
		<button onClick={e => onIncrement(value)}>
			+
		</button>
		{' '}
		<button onClick={e => onDecrement(value)}>
			-
		</button>
		{' '}
		<button onClick={e => value % 2 !== 0 && onIncrement(value) }>
			Increment if odd
		</button>
		{' '}
		<button onClick={e => setTimeout(() => onIncrement(value), 1000)}>
			Increment async
		</button>
	</p>
)

export default flow.connect(Counter, true, {
	onIncrement: increment,
	onDecrement: decrement
})