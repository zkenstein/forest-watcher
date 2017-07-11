import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  datesSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateContainerLabel: {
    width: 120,
    height: 22,
    overflow: 'hidden'
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  pickerContainer: {
    overflow: 'hidden'
  }
});
