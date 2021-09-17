import React from 'react';
import styled from 'styled-components';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform, ListView, FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import {colors} from "../../config/colors";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false
};

const Container = styled.View`
  height: ${props => props.wrapperHeight}px;
  display: flex;
  overflow: hidden;
  align-self: center;
  width: ${props => props.wrapperWidth}px;
  background-color: ${props => props.wrapperBackground};
`;
export const HighLightView = styled.View`
  position: absolute;
  /*top: ${props => (props.wrapperHeight - props.itemHeight) / 2}px;*/
  height: ${props => props.wrapperHeight};
  width: ${props => props.wrapperWidth};
  border-radius: ${props => props.borderRadius};
  background: ${colors.background2};
  
`;
export const SelectedItem = styled.View`
  justify-content: center;
  align-items: center;
  height: ${props => props.itemHeight}px;
  color: ${colors.primary}
`;
const deviceWidth = Dimensions.get('window').width;
export default class ScrollPicker extends React.Component {
  private currentIndex: number;
  private paddingSize: number;

  constructor() {
    super();
    this.onMomentumScrollBegin = this.onMomentumScrollBegin.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
    this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.renderItem = this.renderItem.bind(this)
    this.currentIndex = 1;
    this.state = {
      selectedIndex: 1,
    }
  }

  componentDidMount() {
    if (typeof this.props.selectedIndex !== 'undefined') {
      this.scrollToIndex(this.props.selectedIndex);
      this.currentIndex = this.props.selectedIndex
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    const header = this.renderHeader();
    const footer = this.renderFooter();
    return (
      <Container
        style={[{overflow: "hidden"}, this.props.wrapperStyle]}
        wrapperHeight={this.props.wrapperHeight}
        wrapperWidth={this.props.wrapperWidth}
        wrapperBackground={this.props.wrapperBackground}
      >
        <HighLightView
          highlightColor={this.props.highlightColor}
          highlightWidth={this.props.highlightWidth}
          wrapperHeight={this.props.wrapperHeight}
          wrapperWidth={this.props.wrapperWidth}
          itemHeight={this.props.itemHeight}
          highlightBorderWidth={this.props.highlightBorderWidth}
          borderRadius={this.props.borderRadius || 10}
        />

        <FlatList
          ref={(sview) => this.sview = sview}
          bounces={false}
          data={this.props.dataSource}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          renderItem={({item, index}) => this.renderItem(item, index)}
          showsVerticalScrollIndicator={false}
          onTouchStart={this.props.onTouchStart}
          getItemLayout={(data, index) => (
            {length: this.props.itemHeight, offset: this.props.itemHeight * index, index}
          )}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onScrollEndDrag={this.onScrollEndDrag}
          scrollEventThrottle={5}
          onScroll={this.onScroll}
        >
        </FlatList>
      </Container>
    );
  }

  onScroll({nativeEvent}) {
    const totalHeight = nativeEvent.contentOffset.y - this.paddingSize;
    const itemHeight = Math.floor(totalHeight / this.props.itemHeight);

    if (itemHeight !== this.currentIndex) {
      this.currentIndex = itemHeight;
      ReactNativeHapticFeedback.trigger("impactLight", options);
    }
  }

  renderHeader() {
    const height = (this.props.wrapperHeight - this.props.itemHeight) / 3;
    this.paddingSize = height;
    const header = <View style={{height, flex: 1}}></View>;
    return header;
  }

  renderFooter() {
    const height = (this.props.wrapperHeight - this.props.itemHeight) / 2;
    const footer = <View style={{height: height + 5, flex: 1}}></View>;
    return footer;
  }

  renderItem(data, index) {
    const isSelected = index === this.state.selectedIndex;
    const item = <Text style={[this.props.itemTextStyle, isSelected && this.props.activeItemTextStyle]}>{data}</Text>;

    return (
      <SelectedItem key={index} itemHeight={this.props.itemHeight}>
        {item}
      </SelectedItem>
    );
  }

  scrollFix(e) {
    let verticalY = 0;
    const h = this.props.itemHeight;
    if (e.nativeEvent.contentOffset) {
      verticalY = e.nativeEvent.contentOffset.y;
    }
    const selectedIndex = Math.round(verticalY / h);
    const verticalElem = selectedIndex * h;
    if (verticalElem !== verticalY) {
      // using scrollTo in ios, onMomentumScrollEnd will be invoked
      if (Platform.OS === 'ios') {
        this.isScrollTo = true;
      }
      if (this.sview) {
        this.sview.scrollToIndex({index: selectedIndex});
      }
    }
    if (this.state.selectedIndex === selectedIndex) {
      return;
    }
    this.setState({
      selectedIndex,
    });
    // onValueChange
    if (this.props.onValueChange) {
      const selectedValue = this.props.dataSource[selectedIndex];
      this.props.onValueChange(selectedValue, selectedIndex);
    }
  }

  onScrollBeginDrag() {
    this.dragStarted = true;
    if (Platform.OS === 'ios') {
      this.isScrollTo = false;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onScrollEndDrag(e) {
    this.props.onScrollEndDrag();
    this.dragStarted = false;
    // if not used, event will be garbaged
    const element = {
      nativeEvent: {
        contentOffset: {
          y: e.nativeEvent.contentOffset.y,
        },
      },
    };
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(
      () => {
        if (!this.momentumStarted && !this.dragStarted) {
          this.scrollFix(element, 'timeout');
        }
      },
      10,
    );
  }

  onMomentumScrollBegin() {
    this.momentumStarted = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onMomentumScrollEnd(e) {
    this.props.onMomentumScrollEnd();
    this.momentumStarted = false;
    if (!this.isScrollTo && !this.momentumStarted && !this.dragStarted) {
      this.scrollFix(e);
    }
  }

  scrollToIndex(ind) {
    this.setState({
      selectedIndex: ind,
    });
    // const y = this.props.itemHeight * ind;
    setTimeout(() => {
      if (this.sview) {
        this.sview.scrollToIndex({index: ind, animated: false});
      }
    }, 0);
  }
}
ScrollPicker.propTypes = {
  style: PropTypes.object,
  dataSource: PropTypes.array,
  selectedIndex: PropTypes.number,
  onValueChange: PropTypes.func,
  renderItem: PropTypes.func,
  highlightColor: PropTypes.string,
  itemHeight: PropTypes.number,
  wrapperBackground: PropTypes.string,
  wrapperWidth: PropTypes.number,
  wrapperHeight: PropTypes.number,
  highlightWidth: PropTypes.number,
  highlightBorderWidth: PropTypes.number,
  itemTextStyle: PropTypes.object,
  activeItemTextStyle: PropTypes.object,
  onMomentumScrollEnd: PropTypes.func,
  onScrollEndDrag: PropTypes.func,
};
ScrollPicker.defaultProps = {
  dataSource: [1, 2, 3],
  itemHeight: 60,
  wrapperBackground: '#FFFFFF',
  wrapperHeight: 180,
  wrapperWidth: 150,
  highlightWidth: deviceWidth,
  highlightBorderWidth: 2,
  highlightColor: '#333',
  onMomentumScrollEnd: () => {
  },
  onScrollEndDrag: () => {
  },
  itemTextStyle: {fontSize: 20, lineHeight: 26, textAlign: 'center', color: '#B4B4B4'},
  activeItemTextStyle: {fontSize: 20, lineHeight: 26, textAlign: 'center', color: '#222121'}
};
