
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import './home.sass';
import Button from '../common/button';
import TextInput from '../common/textInput';
import * as HomeActions from './homeReducer';
import {connect} from 'react-redux';
import Spinner from 'react-spinkit';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      roomName: ''
    };
  }

  onChangeInput = (e) => {
    this.setState({roomName: e.target.value});
  }

  openChatRoom = () => {
    console.debug('ChatRoom is opening with url:', this.state.roomName);
    this.props.homeActions.createChatRoom(this.state.roomName);
    this.setState({roomName: ''});
  }

  render() {
    return (
      <div className={'home'}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            this.openChatRoom();
            event.preventDefault();
          }
        } }>
        <div className={'inputElement'}>
          <TextInput inputCallBack={this.onChangeInput} placeholder={'Please enter room name'} />
        </div>
        <div className={'buttonElement'}>
          <Button clickHandler={this.openChatRoom} label={'Open New Room'} />
        </div>
        {this.props.isLoading ? (
          <div className={'spinner'}>
            <div>
              <Spinner style={{top: '50%'}} name='three-bounce' color='blue' />
            </div>
          </div>)
          : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    success: state.getIn(['home', 'success']),
    isLoading: state.getIn(['home', 'isLoading'])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    homeActions: bindActionCreators(HomeActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

