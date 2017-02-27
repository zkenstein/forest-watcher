import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import I18n from 'locales';
import FeedBackForm from 'containers/feedback/form';
import styles from './styles';

// Component necessary to set the navigationOptions
class Reports extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  };

  render() {
    const { state } = this.props.navigation;
    const feedback = state && state.params && state.params.feedback;
    if (feedback) return <FeedBackForm feedback={feedback} />;
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>{I18n.t('feedback.feedBackTypeRequired')}</Text>
      </View>
    );
  }
}

Reports.propTypes = {
  navigation: React.PropTypes.object.isRequired
};

export default Reports;