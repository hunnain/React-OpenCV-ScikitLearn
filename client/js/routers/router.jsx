import React, { Component } from 'react';
import { Router,Route,Link } from 'react-router-dom';
import Navbar from '../components/Navbar/navbar';
import history from './history';
import App from '../components/home/app';

class Routers extends Component{
    render(){
        return(
            <Router history={history}>
            <div>
                <Navbar />
                <Route exact path="/" component={App} />
                </div>
            </Router>
        )
    }
}
export default Routers;
