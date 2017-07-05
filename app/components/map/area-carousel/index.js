import React, { Component } from 'react';
import PropTypes from 'prop-types';
import I18n from 'locales';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import throttle from 'lodash/throttle';
import moment from 'moment';
import Theme from 'config/theme';

import Carousel from 'react-native-snap-carousel';
import { enabledDatasetName, activeDataset } from 'helpers/area';
import GeoPoint from 'geopoint';
import { sliderWidth, itemWidth, styles } from './styles';

const settingsIcon = require('assets/settings.png');

const NO_ALERT_SELECTED = I18n.t('commonText.noAlertSystem');

class AreaCarousel extends Component {
  handleLink(area) {
    this.props.navigator.push({
      screen: 'ForestWatcher.AreaDetail',
      title: area.name,
      passProps: {
        id: area.id,
        disableDelete: true
      }
    });
  }

  render() {
    const { alertSelected, lastPosition, selectedArea } = this.props;

    let distanceText = '';
    let positionText = '';
    let datasetName = I18n.t('commonText.notAvailable');
    let distance = 999999;
    const containerTextStyle = alertSelected
      ? [styles.textContainer, styles.textContainerSmall]
      : styles.textContainer;
    if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
      const geoPoint = new GeoPoint(alertSelected.latitude, alertSelected.longitude);
      const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
      positionText = `${I18n.t('commonText.yourPosition')}: ${lastPosition.latitude.toFixed(4)}, ${lastPosition.longitude.toFixed(4)}`;
      distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
      distanceText = `${distance} ${I18n.t('commonText.kmAway')}`; // in Kilometers
    }

    const settingsButton = (area) => (
      <View style={styles.settingsButton}>
        <TouchableHighlight
          onPress={() => this.handleLink(area)}
          underlayColor="transparent"
          activeOpacity={0.8}
        >
          <Image style={Theme.icon} source={settingsIcon} />
        </TouchableHighlight>
      </View>
    );

    const sliderItems = this.props.areas.map((area, index) => {
      const dataset = activeDataset(area);
      const lastUpdatedText = dataset ? `${I18n.t('commonText.lastUpdated')}: ${moment(dataset.lastUpdate).fromNow()}` : '';
      datasetName = enabledDatasetName(area) || NO_ALERT_SELECTED;
      return (
        <View key={`entry-${index}`} style={styles.slideInnerContainer}>
          <Text style={containerTextStyle}>{ area.name } - { datasetName }</Text>
          {!alertSelected &&
          <View style={styles.lastUpdated}>
            <Text style={styles.smallCarouselText}>
              {lastUpdatedText}
            </Text>
          </View>
          }
          {settingsButton(area)}
        </View>
      );
    });
    return (
      <View style={{ position: 'absolute', bottom: 0, zIndex: 4 }}>
        {alertSelected &&
          <View pointerEvents="none" style={styles.currentPositionContainer}>
            <View style={styles.currentPosition}>
              <Text style={[styles.smallCarouselText, styles.coordinateDistanceText]}>
                {distanceText}
              </Text>
              <Text style={[styles.smallCarouselText, styles.coordinateDistanceText]}>
                {positionText}
              </Text>
            </View>
          </View>
        }
        {!alertSelected &&
          <Carousel
            firstItem={selectedArea}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            onSnapToItem={throttle((index) => this.props.updateSelectedArea(index), 300)}
            showsHorizontalScrollIndicator={false}
            slideStyle={styles.slideStyle}
          >
            { sliderItems }
          </Carousel>
        }
      </View>
    );
  }
}

AreaCarousel.propTypes = {
  alertSelected: PropTypes.object,
  lastPosition: PropTypes.object,
  areas: PropTypes.array,
  navigator: PropTypes.object.isRequired,
  updateSelectedArea: PropTypes.func,
  selectedArea: PropTypes.number
};

export default AreaCarousel;
