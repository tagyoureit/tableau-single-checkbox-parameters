import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import Configure from './Configure';
import Home from './Home';
import SingleCheckboxParameter from './SingleCheckboxParameter';


const PrimaryLayout = () => (
  <React.Fragment>
      <Route path='/' exact={true} component={Home} />
      <Route path='/single-checkbox-parameter' component={SingleCheckboxParameter} />
      <Route path='/config' component={Configure} />
  </React.Fragment>
)

class App extends React.Component {
  public render() {
      return (
          <HashRouter>
              <PrimaryLayout />
          </HashRouter>
      )
  }
}

ReactDOM.render(<App />, document.getElementById('container'));