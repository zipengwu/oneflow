import {expect} from "chai";
import * as sinon from "sinon";
import {store, uuid} from "./utils";

global.localStorage = sinon.stub({
	setItem: () => null,
	getItem: () => null
})

describe('utils: ', () => {
	it('store() will save to/get from localstorage', () => {
		let key = 'react-todos';
		let data = [1, 2, 3];
		store(key, data);
		expect(localStorage.setItem.calledWith(key, JSON.stringify(data))).to.be.true;
		store('react-todos')
		expect(localStorage.getItem.calledWith(key)).to.be.true;
	});

	it('uuid() generate uniq id', () => {
		let id1 = uuid();
		let id2 = uuid();
		let id3 = uuid();
		expect(id1 !== id2).to.be.true;
		expect(id1 !== id3).to.be.true;
		expect(id3 !== id2).to.be.true;
	});

})