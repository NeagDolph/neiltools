import { Dimensions, Platform, StyleSheet } from "react-native";
import IconEntypo from "react-native-vector-icons/Entypo";
import React, { useEffect, useState } from "react";
import { colors } from "../../config/colors";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

function Backplate(props: { height: number, dragX: any, dragMode: number, setDragMode: (number) => void }) {
  const bgColor = useSharedValue(colors.background3);
  const [bgColorState, setBgColor] = useState(colors.background3);

  useEffect(() => {
    const calcColor = [colors.background3, colors.accent, colors.red][props.dragMode];
    if (true) {
      bgColor.value = withTiming(calcColor, {
        duration: colors.dark ? 0 : 100,
        easing: Easing.linear
      });
    } else {
      setBgColor(calcColor);
    }
  }, [props.dragMode])

  const animatedStyles = useAnimatedStyle(() => {
    const obj = {
      height: props.height - 1,
      transform: [
        { perspective: -300 }
        // {rotateY: props.dragX.value / 3 + 'deg'},
      ]
    };

    if (true) {
      obj["backgroundColor"] = bgColor.value;
    }

    return obj;
  }, [props.height, props.dragMode])

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: props.dragX.value * 0.1}
      ]
    }
  })

  const editStyle = useAnimatedStyle(() => {
    return {
      height: props.height - 30,
      opacity: props.dragX.value,
      color: bgColor.value,
      transform: [
        { translateX: Math.max(-props.dragX.value * 1.3, -34) }
      ]
    };
  })

  const deleteStyle = useAnimatedStyle(() => {
    return {
      height: props.height - 30,
      opacity: -props.dragX.value,

      color: bgColor.value,
      transform: [
        { translateX: Math.min(-props.dragX.value * 1.3, 34) }
      ]
    };
  })

  return <Animated.View style={[styles.container, {height: props.height - 1}, containerStyle]}>
    <Animated.View
      style={[styles.backplate, animatedStyles, Platform.OS === "android" && { backgroundColor: bgColorState }]}>
    </Animated.View>
    <Animated.View style={[styles.editContainer, editStyle]}>
      {/*<Text style={[styles.edit, {fontWeight: props.dragMode !== 0 ? "500" : "800"}]}>Edit</Text>*/}
      <IconEntypo size={22} name="pencil" color={colors.primary} />
    </Animated.View>
    <Animated.View style={[styles.trashContainer, deleteStyle]}>
      <IconEntypo size={22} name="trash" color={colors.primary}/>
    </Animated.View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    width: (Dimensions.get('window').width - 84) / 2,
    zIndex: -100
  },
  editContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: "center",
    left: 20,
    position: "absolute",
    top: 10,
    zIndex: 1000
  },
  trashContainer: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    position: "absolute",
    top: 10,
    zIndex: 1000
  },
  edit: {
    fontFamily: "Avenir",
    fontWeight: "500",
    fontSize: 16,
    color: colors.background,
    textAlign: "center"
  },
  backplate: {
    width: (Dimensions.get("window").width - 84) / 2,
    backgroundColor: colors.background3,
    borderRadius: 15,
    position: "absolute",
    top: 0,
    left: 0
  },
})

export default Backplate
