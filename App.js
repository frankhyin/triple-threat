import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  AsyncStorage,
  RefreshControl
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import moment from 'moment';
import { Location, Permissions, MapView } from 'expo';
import Swiper from 'react-native-swiper';

//Screens
class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home'
  };

  press() {
    this.props.navigation.navigate('Login');
  }

  register() {
    this.props.navigation.navigate('Register');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TouchableOpacity onPress={ () => {this.press()} } style={[styles.button, styles.buttonBlue]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={ () => {this.register()} }>
          <Text style={styles.buttonLabel}>Tap to Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class RegisterScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: ''
    }
  }

  static navigationOptions = {
    title: 'Register'
  };

  register() {
    //console.log(this.state);
    fetch('https://hohoho-backend.herokuapp.com/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      /* do something with responseJson and go back to the Login view but
       * make sure to check for responseJson.success! */
       if (responseJson.success === true) {
        alert('Successfully registered!');
        this.props.navigation.goBack();
       } else {
        alert('Failed to register, please try again!')
       }
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log('ERROR:', err)
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={[{height: 50, paddingLeft: 20, borderColor: 'black', borderWidth: 2}, styles.button]}
          placeholder="Enter your username"
          onChangeText={(text) => this.setState({username: text})} />
        <TextInput
          style={[{height: 50, paddingLeft: 20, borderColor: 'black', borderWidth: 2}, styles.button]}
          placeholder="Enter your password"
          secureTextEntry={true}
          onChangeText={(text) => this.setState({password: text})} />
        <TouchableOpacity 
          style={[styles.button, styles.buttonRed]}
          onPress={this.register.bind(this)}>
          <Text style={styles.buttonLabel}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      message: ''
    }
  }

  static navigationOptions = {
    title: 'Login'
  };

  login() {
    //console.log(this.state);
    fetch('https://hohoho-backend.herokuapp.com/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      /* do something with responseJson and go back to the Login view but
       * make sure to check for responseJson.success! */
       if (responseJson.success === true) {
        alert('Successfully logged in!');
        AsyncStorage.setItem('user', JSON.stringify({
          username: this.state.username,
          password: this.state.password
        }));
        this.props.navigation.navigate('Swiper');
       } else {
        this.setState({message: responseJson.error})
       }
       //console.log(responseJson);
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log('ERROR:', err)
    });
  }

  componentDidMount() {
    AsyncStorage.getItem('user')
    .then(result => {
      var parsedResult = JSON.parse(result);
      var username = parsedResult.username;
      var password = parsedResult.password;
      if (username && password) {
        // return login(username, password)
        //   .then(resp => resp.json())
        //   .then(checkResponseAndGoToMainScreen);
        this.setState({username: username, password: password});
        //this.login();
      }
    })
    .catch(err => { console.log('ERROR:', err) })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{color: 'red', fontSize: 20}}>{this.state.message}</Text>
        <TextInput
          style={[{height: 50, paddingLeft: 20, borderColor: 'black', borderWidth: 2}, styles.button]}
          placeholder="Enter your username"
          value={this.state.username}
          onChangeText={(text) => this.setState({username: text})} />
        <TextInput
          style={[{height: 50, paddingLeft: 20, borderColor: 'black', borderWidth: 2}, styles.button]}
          placeholder="Enter your password"
          secureTextEntry={true}
          value={this.state.password}
          onChangeText={(text) => this.setState({password: text})} />
        <TouchableOpacity 
          style={[styles.button, styles.buttonBlue]}
          onPress={this.login.bind(this)}>
          <Text style={styles.buttonLabel}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class SwiperScreen extends React.Component {
  static navigationOptions = {
    title: 'HoHoHo!'
  };

  render() {
    return (
      <Swiper showsPagination={false} loop={false}>
        <UsersScreen />
        <MessagesScreen />
      </Swiper>
    );
  }
}

class UsersScreen extends React.Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      dataSource: ds.cloneWithRows([]),
      refreshing: false
    };
    fetch('https://hohoho-backend.herokuapp.com/users')
    .then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success === true) {
        console.log(responseJson.users);
        this.setState({dataSource: ds.cloneWithRows(responseJson.users.slice(1))})
       } else {
        alert('Not logged in!')
       }
       //console.log(responseJson);
    })
    .catch((err) => {
      console.log('ERROR:', err)
    });
  }

  static navigationOptions = (props) => ({
    title: 'Users',
    headerRight: <Button title='Messages' onPress={() => {props.navigation.navigate('Messages')}} />
  });

  _onRefresh() {
    this.setState({refreshing: true});
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    fetch('https://hohoho-backend.herokuapp.com/users')
    .then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success === true) {
        console.log(responseJson.users);
        this.setState({dataSource: ds.cloneWithRows(responseJson.users.slice(1))});
        this.setState({refreshing: false});
       } else {
        alert('Not logged in!')
       }
    })
    .catch((err) => {
      console.log('ERROR:', err)
    });
  }

  touchUser(user) {
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: user._id
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success === true) {
        alert(`Your message to ${user.username} has been sent!`)
      } else {
        alert(`Failed to message ${user.username}. Please try again later!`)
      }
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log('ERROR:', err)
    });
  }

  sendLocation = async(user) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      return alert('No permission to access location :(')
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    //console.log(location);
    this.longTouchUser(user, location);
  }

  longTouchUser(user, location) {
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: user._id,
        location: {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
        }
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success === true) {
        alert(`Your location has been sent to ${user.username}!`)
      } else {
        alert(`Failed to send location to ${user.username}. Please try again later!`)
      }
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log('ERROR:', err)
    });
  }

  render() {
    return (
      this.state.dataSource ? 
      <View style={styles.containerFull}>
        <ListView 
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} />}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <TouchableOpacity onPress={this.touchUser.bind(this, rowData)} 
                                                    onLongPress={this.sendLocation.bind(this, rowData)}
                                                    delayLongPress={1000}
                                                    style={[styles.button, styles.user]}><Text style={{textAlign: 'center'}}>{rowData.username}</Text></TouchableOpacity>}
        />
      </View>
      : null
    )
  }
}

class MessagesScreen extends React.Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      refreshing: false,
    }
    fetch('https://hohoho-backend.herokuapp.com/messages')
    .then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success === true) {
        this.setState({dataSource: ds.cloneWithRows(responseJson.messages)})
       } else {
        alert('Not logged in!')
       }
       //console.log(responseJson);
    })
    .catch((err) => {
      console.log('ERROR:', err)
    });
    // this.fetchData = this.fetchData.bind(this);
    // this.fetchData();
    AsyncStorage.getItem('user').then(result => this.setState({currentUser: JSON.parse(result).username}));
  }


  _onRefresh() {
    this.setState({refreshing: true});
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    fetch('https://hohoho-backend.herokuapp.com/messages')
    .then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success === true) {
        this.setState({dataSource: ds.cloneWithRows(responseJson.messages)});
        this.setState({refreshing: false});
       } else {
        alert('Not logged in!')
       }
       //console.log(responseJson);
    })
    .catch((err) => {
      console.log('ERROR:', err)
    });
  }

  static navigationOptions = {
    title: 'Messages (newest first)',
  }

  render() {
    return (
      <View style={styles.containerFull}>
        <ListView 
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} />}
          dataSource={this.state.dataSource}
          renderRow={(message) => {
            //console.log(date);
            if (this.state.currentUser === message.from.username) {
              console.log(message);
              return (
                <View style={[styles.button, styles.buttonGreen, styles.message, styles.fromUserMsg]}>
                  <Text>To: {message.to.username}</Text>
                  <Text>At: {moment(new Date(message.timestamp), 'YYYY-MM-DDThh:mm:ss.SSSZ').format("dddd, M-D-YYYY, h:mm:ss a")}</Text>
                  <Text>Message: {message.body}</Text>
                  {message.location ? (
                    <MapView style={[{height: 150}, styles.container]} region={{
                      latitude: message.location.latitude,
                      longitude: message.location.longitude,
                      latitudeDelta: 0.125,
                      longitudeDelta: 0.125
                    }}>
                      <MapView.Marker
                        coordinate={message.location} />
                    </MapView>) : <Text/>}
                </View>
              )
            } else {
              return (
                <View style={[styles.button, styles.buttonBlue, styles.message, styles.toUserMsg]}>
                  <Text>From: {message.from.username}</Text>
                  <Text>At: {moment(new Date(message.timestamp), 'YYYY-MM-DDThh:mm:ss.SSSZ').format("dddd, M-D-YYYY, h:mm:ss a")}</Text>
                  <Text>Message: {message.body}</Text>
                  {message.location ? (
                    <MapView style={[{height: 150}, styles.container]} region={{
                      latitude: message.location.latitude,
                      longitude: message.location.longitude,
                      latitudeDelta: 0.125,
                      longitudeDelta: 0.125
                    }}>
                      <MapView.Marker
                        coordinate={message.location} />
                    </MapView>) : <Text/>}
                </View>
              )
            }
          }}
        />
      </View>
    )
  }
}

//Navigator
export default StackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  Login: {
    screen: LoginScreen,
  },
  Swiper: {
    screen: SwiperScreen,
  },
  // Users: {
  //   screen: UsersScreen,
  // },
  // Messages: {
  //   screen: MessagesScreen,
  // }
}, {initialRouteName: 'Home'});


//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    //paddingBottom: 100
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
  user: {
    //flexDirection: 'column',
    //alignItems: 'stretch',
    //width: 300,
    height: 40, 
    borderColor: 'blue', 
    borderWidth: 1, 
  },
  message: {
    paddingLeft: 15,
    paddingRight: 15
  },
  toUserMsg: {
    marginRight: 100
  },
  fromUserMsg: {
    marginLeft: 100
  }
});
