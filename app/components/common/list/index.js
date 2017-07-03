import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  Text
} from 'react-native';
import styles from './styles';

const nextImage = require('assets/next.png');

function onPress(data) {
  if (data && data.functionOnPress) {
    data.functionOnPress(data.url);
  }
}

function List(props) {
  return (
    <ScrollView>
      { props.content.map((data, key) => (
        <TouchableHighlight
          key={`link-${key}`}
          onPress={() => onPress(data)}
          activeOpacity={1}
          underlayColor="transparent"
        >
          <View
            key={key}
            style={props.bigSeparation ? [styles.container, styles.containerBigSeparation] : [styles.container]}
          >
            <View style={data.text ? styles.containerImageText : styles.containerOnlyImage}>
              {data.image &&
                <Image
                  style={styles.imageList}
                  source={data.image}
                />
              }
              {data.text &&
                <Text style={styles.text}>{data.text}</Text>
              }
            </View>
            <Image
              style={styles.nextIcon}
              source={nextImage}
            />
          </View>
        </TouchableHighlight>
      ))}
    </ScrollView>
  );
}

List.propTypes = {
  content: PropTypes.array,
  bigSeparation: PropTypes.bool
};

export default List;
