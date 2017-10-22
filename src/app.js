
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {store, history} from './redux/store';
import {Route, Switch} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import './app.sass';
import 'font-awesome/scss/font-awesome.scss';
import './fonts/font-awesome.config';
import Root from './modules/root/root';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path='/' component={Root} />
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
