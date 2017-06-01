import { connect } from 'react-redux';
import AreaCarousel from 'components/map/area-carousel';
import { updateSelectedIndex } from 'redux-modules/areas';

function mapStateToProps(state) {
  const areas = state.areas.data;
  return {
    areas
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSelectedArea: (index) => {
      dispatch(updateSelectedIndex(index));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaCarousel);
