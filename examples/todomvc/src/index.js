import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, hashHistory} from "react-router";
import "todomvc-app-css/index.css";
import {store} from "./utils";
import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";
import * as flow from "oneflow";

const KEY = 'oneflow-todos';
flow.initState({todos: store(KEY)})
flow.subscribe(({todos}) => todos && store(KEY, todos));

const App = ({params}) => (
	<section className='todoapp'>
		<Header/>
		<Main showing={params.showing}/>
		<Footer/>
	</section>
)

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/(:showing)" component={App}/>
	</Router>
	, document.getElementById('root'))