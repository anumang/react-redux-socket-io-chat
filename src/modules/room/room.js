import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import * as RoomActions from './roomReducer';
import {connect} from 'react-redux';
import Spinner from 'react-spinkit';
import Linkify from 'react-linkify';
import ReactDOM from 'react-dom';
import AlertContainer from 'react-alert';
import Button from '../common/button';
import TextInput from '../common/textInput';
import './room.sass';

class Room extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      message: ''
    };
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isLoading &&
      nextProps.connected &&
      nextProps.userId &&
      nextProps.users.toJS().length === 0) {
      console.debug('Fetching users & messages ...');
      this.props.roomActions.initializeRoomMessages(nextProps.username,
        nextProps.userId, nextProps.match.params.id);
      this.props.roomActions.initializeRoomUsers(nextProps.username,
        nextProps.userId, nextProps.match.params.id);
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  alertOptions = () => {
    return {
      offset: 14,
      position: 'bottom left',
      theme: 'dark',
      time: 5000,
      transition: 'scale'
    };
  }

  scrollToBottom = () => {
    const node = ReactDOM.findDOMNode(this.messagesEnd);
    if (node) {
      node.scrollIntoView(false);
    }
  }

  onChangeInput = (e) => {
    this.setState({username: e.target.value});
  }

  onChangeMessage = (e) => {
    this.setState({message: e.target.value});
  }

  connectChatRoom = () => {
    console.debug('Connecting watch room...', this.props.match.params.id);
    this.props.roomActions.connectChatRoom(this.state.username, this.props.match.params.id);
    this.userInput.clear();
    this.setState({username: null});
  }

  tryToReconnect = () => {
    console.debug('Trying to reconnect...');
    this.props.roomActions.reConnectChatRoom(this.props.username,
      this.props.userId, this.props.roomId, this.props.roomName);
  }

  sendMessage = () => {
    console.debug('Room message is sending ...', this.state.message);
    if (this.state.message && this.state.message.length > 0) {
      this.props.roomActions.sendMessage(this.props.username,
        this.props.userId, this.props.roomId, this.state.message);
      this.messageInput.clear();
      this.setState({message: null});
    }
  }

  showUnexpectedError = () => {
    this.msg.show('Something went wrong, Please try again!', {
      time: 3000,
      type: 'error'
    });
  }

  showReconnecting = () => {
    this.msg.show('Connection lost, trying to reconnect.', {
      time: 3000,
      type: 'info',
      onClose: () => this.tryToReconnect()
    });
  }

  handleError = () => {
    if (!this.props.isLoading) {
      if (this.props.username && this.props.roomId) {
        setTimeout(() => this.showReconnecting(), 200);
      } else {
        setTimeout(() => this.showUnexpectedError(), 200);
      }
    }
  }

  openSlider = () => {
    const slider = ReactDOM.findDOMNode(this.slider);
    slider.style.opacity = 1;
    slider.style.width = '300px';
    const player = ReactDOM.findDOMNode(this.player);
    player.style.marginLeft = '250px';
  }

  closeSlider = () => {
    const slider = ReactDOM.findDOMNode(this.slider);
    slider.style.opacity = 0.5;
    slider.style.width = '0';
    const player = ReactDOM.findDOMNode(this.player);
    player.style.marginLeft = '0';
  }

  messageIsBelongsUser = (message) => {
    return message.userId === this.props.userId;
  }

  _renderEnterPage = () => {
    return (
      <div className={'user-container'}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            this.connectChatRoom();
            event.preventDefault();
          }
        } }>
        <div>
          <TextInput
            ref={userInput => this.userInput = userInput}
            inputCallBack={this.onChangeInput}
            placeholder={'Please type a username'} />
        </div>
        <div className={'buttonElement'}>
          <Button clickHandler={this.connectChatRoom} label={'Enter'} />
        </div>
      </div>
    );
  }

  _renderLandingPage = () => {
    return (
      <div className={'watch-container'}>
        <div ref={player => this.player = player} className={'player-container'} onClick={this.closeSlider}>
          This is ChatRoom container
        </div>
        <div
          className={'message-container'}
          onKeyPress={event => {
            if (event.key === 'Enter') {
              this.sendMessage();
              event.preventDefault();
            }
          } }>
          <div className={'openbtn'}>
            <a onClick={this.openSlider} className={'fa fa-bars'} />
          </div>
          <div ref={slider => this.slider = slider} className={'slider'}>
            <div className={'usersHeader'}>
              <div>
                Joiners ({this.props.users.size})
              </div>
              <a className={'closebtn'} onClick={this.closeSlider}>&times;</a>
            </div>
            <div className={'users'}>
              {this.props.users.toJS().map((user, i) => (
                <div key={'u_' + user.userId + i} className={'user'}>
                  {user.username}
                </div>
              ))}
            </div>
            <div className={'chat-container'}>
              <div className={'chat-view'}>
                {this.props.messages.toJS().map((message, i) => {
                  if (message.username && this.messageIsBelongsUser(message)) {
                    return (
                      <div key={'m_' + message.messageId + i} className={'chat-message-container-self'}>
                        <div className={'chat-message'}>
                          <Linkify>
                            {message.message}
                          </Linkify>
                        </div>
                      </div>
                    );
                  } else if (message.username) {
                    return (
                      <div key={'m_' + message.messageId + i} className={'chat-message-container'}>
                        <div className={'chat-message-user'}>
                          {message.username}:
                        </div>
                        <div className={'chat-message'}>
                          <Linkify>
                            {message.message}
                          </Linkify>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={'m_' + message.messageId + i} className={'chat-message-container-server'}>
                        <div className={'chat-message'}>
                          <Linkify>
                            {message.message}
                          </Linkify>
                        </div>
                      </div>
                    );
                  }
                })}
                <div className={'hidden'}
                  ref={(el) => this.messagesEnd = el} />
              </div>
              <div className={'chat-box'}>
                <div className={'chat-input'}>
                  <TextInput ref={messageInput => this.messageInput = messageInput}
                    inputCallBack={this.onChangeMessage}
                    placeholder={'type a message'} cols={18} rows={5} />
                </div>
                <div className={'chat-button'}>
                  <a onClick={this.sendMessage} className={'fa fa-paper-plane'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    // In case of error, show alert & take action
    if (this.props.error) {
      this.handleError();
    }
    const page = (this.props.username &&
      this.props.username.length > 0 &&
      this.props.connected) ? this._renderLandingPage() : this._renderEnterPage();
    return (
      <div className={'room'}>
        <AlertContainer ref={a => this.msg = a} {...this.alertOptions() } />
        {page}
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
    username: state.getIn(['room', 'username']),
    userId: state.getIn(['room', 'userId']),
    connected: state.getIn(['room', 'connected']),
    isLoading: state.getIn(['room', 'isLoading']),
    users: state.getIn(['room', 'users']),
    messages: state.getIn(['room', 'messages']),
    roomId: state.getIn(['room', 'roomId']),
    error: state.getIn(['room', 'error']),
    roomName: state.getIn(['room', 'roomName'])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    roomActions: bindActionCreators(RoomActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Room);

