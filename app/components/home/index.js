import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';

import { getLanguage } from 'helpers/language';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import ConnectionStatus from 'containers/connectionstatus';
import styles from './styles';

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  componentWillReceiveProps(newProps) {
    if ((this.props.user.loggedIn !== newProps.user.loggedIn)
        || (this.props.areasSynced !== newProps.areasSynced)
        || (this.props.language && this.isDifferentLanguage())) {
      this.props = newProps;
      this.handleStatus();
    }
  }

  isDifferentLanguage() {
    return this.props.language !== getLanguage();
  }

  cacheForms() {
    if (!this.props.report || this.isDifferentLanguage()) this.props.getReportQuestions();
    if (!this.props.dailyFeedback || this.isDifferentLanguage()) this.props.getFeedbackQuestions('daily');
    if (!this.props.weeklyFeedback || this.isDifferentLanguage()) this.props.getFeedbackQuestions('weekly');
  }

  handleStatus() {
    const { token, loggedIn } = this.props.user;
    if (token) {
      tracker.setUser(token);
      this.cacheForms();

      if (!loggedIn) {
        this.props.setLoginStatus({
          loggedIn: true,
          token
        });
      }

      if (!this.props.user.hasData) {
        this.props.getUser();
      }

      if (this.isDifferentLanguage()) {
        this.props.setLanguage(getLanguage());
        this.props.getCountries();
      }

      if (this.props.areasSynced) {
        if (this.props.areas) {
          setTimeout(() => {
            this.props.navigator.resetTo({
              screen: 'ForestWatcher.Dashboard',
              title: 'FOREST WATCHER'
            });
          }, 100);
        } else {
          const { setupComplete } = this.props;
          setTimeout(() => {
            if (setupComplete === 'Dashboard') {
              this.props.navigator.resetTo({
                screen: 'ForestWatcher.Dashboard',
                title: 'FOREST WATCHER'
              });
            } else {
              this.props.navigator.resetTo({
                screen: 'ForestWatcher.Setup',
                title: 'Set up',
                passProps: {
                  goBackDisabled: true
                }
              });
            }
          }, 100);
        }
      } else {
        this.props.getAreas();
      }
    } else {
      this.props.navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
  }

  render() {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator
          color={Theme.colors.color1}
          style={{ height: 80 }}
          size="large"
        />
        <ConnectionStatus />
      </View>
    );
  }
}

Home.propTypes = {
  user: React.PropTypes.shape({
    loggedIn: React.PropTypes.bool.isRequired,
    token: React.PropTypes.string,
    hasData: React.PropTypes.bool.isRequired
  }).isRequired,
  language: React.PropTypes.string,
  areas: React.PropTypes.bool.isRequired,
  setupComplete: React.PropTypes.bool.isRequired,
  report: React.PropTypes.bool.isRequired,
  dailyFeedback: React.PropTypes.bool.isRequired,
  weeklyFeedback: React.PropTypes.bool.isRequired,
  getAreas: React.PropTypes.func.isRequired,
  areasSynced: React.PropTypes.bool.isRequired,
  getUser: React.PropTypes.func.isRequired,
  getCountries: React.PropTypes.func.isRequired,
  getReportQuestions: React.PropTypes.func.isRequired,
  getFeedbackQuestions: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired
};

Home.navigationOptions = {
  header: {
    visible: false
  }
};

export default Home;
