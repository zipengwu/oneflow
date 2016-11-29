import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import * as flow from 'oneflow';

flow.initState({value: 0});
//to log every counter updates
flow.subscribe(update => console.log(`new counter: ${update.value}`));

ReactDOM.render(
  <Counter />,
  document.getElementById('root')
);
