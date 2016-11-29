import {increment, decrement} from "./index";
import {expect} from "chai";

describe('Counter actions', () => {
	it('given a counter, increment() return a counter state increased by 1', () => {
		let state = {value: 1};
		let newState = increment(state.value);
		expect(newState.value).to.be.equal(2);
	});

	it('given a counter, decrement() return a counter state decreased by 1', () => {
		let state = {value: 1};
		let newState = decrement(state.value);
		expect(newState.value).to.be.equal(0);
	});
})