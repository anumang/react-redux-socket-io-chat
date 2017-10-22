
import React, {Component} from 'react';
import {history} from '../../redux/store';
import {Route, Switch, Redirect} from 'react-router';
import {ConnectedRouter} from 'react-router-redux';
import Home from '../home/home';
import Room from '../room/room';

class Root extends Component {
  render() {
    return (
      <ConnectedRouter history={history}>
        <Switch>
          <Route path='/home' component={Home} />
          <Route path='/room/:id' component={Room} />
          <Redirect from='/' to='/home' />
        </Switch>
      </ConnectedRouter>
    );
  }
}

export default Root;
