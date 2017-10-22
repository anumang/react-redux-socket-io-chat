
import React, {Component} from 'react';
import './button.sass';

class Button extends Component {

  render() {
    return (
      <div className={'buttonContainer'}>
        <button className={'button'} onClick={this.props.clickHandler}>{this.props.label}</button>
      </div>
    );
  }
}

export default Button;
