
import React, {Component} from 'react';
import './textInput.sass';

class TextInput extends Component {

  clear = () => {
    this.input.value = null;
  }

  render() {
    return (
      <div className={'textInputContainer'}>
        {(this.props.cols || this.props.rows) ? (
          <textarea
            ref={input => this.input = input}
            className={'inputtextarea'}
            maxLength={this.props.maxLength || 255}
            placeholder={this.props.placeholder ? this.props.placeholder : ''}
            onChange={this.props.inputCallBack}
            cols={this.props.cols}
            rows={this.props.rows} />
        )
          : (
            <input
              ref={input => this.input = input}
              type={'text'}
              className={'input'}
              maxLength={this.props.maxLength || 255}
              placeholder={this.props.placeholder ? this.props.placeholder : ''}
              onChange={this.props.inputCallBack} />
          )}
      </div>
    );
  }
}

export default TextInput;
