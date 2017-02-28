import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, hashHistory} from "react-router";
import "todomvc-app-css/index.css";
import {store} from "./utils";
import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";
import {oneflow} from "oneflow";

const KEY = 'oneflow-todos';
oneflow.initState({todos: store(KEY)})
oneflow.subscribe(({todos}) => todos && store(KEY, todos));

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