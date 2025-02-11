import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";


import Header from "./components/header";
import ToolItem from "./components/tool-item";
import StartScreen from "./start/start-screen";
import LogoBox from "./components/logo-box";
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { setSetting, setUsed } from "../store/features/settingsSlice";
import { colors } from "../config/colors";
import Rate from "react-native-rate";
import { RootState } from "../store/store";

interface ToolData {
  title: string;
  icon: any;
  iconDark: any;
  description: string;
  tags: string[];
  nav: () => void;
}


const HomePage = ({navigation}: any) => {
  const settings = useSelector((state: RootState) => state.settings.general);
  const copyUsed = useRef(settings.used);

  const lockConstant = 680

  const askReview = () => {
    // crashlytics().log("User clicked open review button.");

    if (settings.openedReview) {
      Alert.alert(
        "Throw us a review",
        `Do you want to open the app store?`,
        [

          {
            text: "Yes!", onPress: () => {
              // crashlytics().log("Opened app store to give review");
              // https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336

              Linking.openURL("https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336")
              //   .catch((err) => {

              // });
            }

          },
          {text: "Nevermind"},
        ]
      );
    } else {
      const options = {
        AppleAppID: "1592436336",
        preferInApp: true,
        openAppStoreIfInAppFails: true,
        fallbackPlatformURL: "https://peacebox.app/download",
      }
      Rate.rate(options, (success, errorMessage) => {
        if (success) {
          // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
          // crashlytics().log("User completed rating lifecycle.");
          dispatch(setSetting({
            page: "general",
            setting: "openedReview",
            value: true
          }))
        }
        if (errorMessage) {
          // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
          // crashlytics().log("Error with reviewing.");
          // crashlytics().recordError(Error(errorMessage));
        }
      })
    }
  }

  const toolsData: ToolData[] = [
    {
      title: "Free Writing",
      icon: require("../assets/writing.png"),
      iconDark: require("../assets/dark/writing.png"),
      description: "Let go of internal troubles by writing down your thoughts.",
      tags: ["Anxiety", "Quick Relief"],
      nav: () => navigation.navigate("Freewriting")
    },
    {
      title: "Breathing",
      icon: require("../assets/wind.png"),
      iconDark: require("../assets/dark/wind.png"),
      description: "Breathing exercises to relax and improve your mood.",
      nav: () => navigation.navigate("Patterns"),
      tags: ["Anxiety", "Stress", "Discontentment"]
    },
    {
      title: "Audio",
      description: "Transformative sleep meditations to use at night.",
      nav: () => navigation.navigate("Audio"),
      icon: require("../assets/audio-waves.png"),
      iconDark: require("../assets/dark/audio-waves.png"),
      tags: ["Sleep", "Meditation"]
    },
    {
      title: "More Coming Soon...",
      description: "Tap this card this to give us a review!",
      nav: askReview,
      tags: [],
      icon: require("../assets/toolbox.png"),
      iconDark: require("../assets/dark/toolbox.png"),
    }
  ]

  const dispatch = useDispatch();

  const scrollOffset = useSharedValue(0);

  const [endOfScroll, setEndOfScroll] = useState(false)

  const scrollRef = useRef(null)


  useEffect(() => {
    if (endOfScroll && !settings.used) dispatch(setUsed("general"));
  }, [endOfScroll])

  useEffect(() => {
    // crashlytics().log("Page loaded: Home Page")
    if (!settings.used) {
      // crashlytics().log("Home page loaded for the first time")
      scrollRef.current.flashScrollIndicators()
    }
  }, [])


  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;

    if (event.contentOffset.y > lockConstant - 100) runOnJS(setEndOfScroll)(true);
    else if (endOfScroll) runOnJS(setEndOfScroll)(false);
  });


  const approximateMargin = () => {
    return Dimensions.get("window").height > 750 ? Dimensions.get("window").height / 22 : 0
  }

  const scrollBottom = () => {
    scrollRef.current.scrollToEnd({animated: true})
  }

  const renderTools = (toolsData: ToolData[]) => {
    return toolsData.map(data => {
      return <ToolItem
        {...data}
        key={data.title}
      />
    })
  }

  return (
    <View style={styles.container}>
      {/*<StatusBar*/}
      {/*  // animated={true}*/}
      {/*  // backgroundColor="#61dafb"*/}
      {/*  barStyle="dark-content"*/}
      {/*  // showHideTransition="slide"*/}
      {/*  />*/}

      <LogoBox
        used={settings.used}
        scrollOffset={scrollOffset}
        endOfScroll={endOfScroll}
        lockConstant={lockConstant}
        safeViewHeight={approximateMargin()}
      />
      <Animated.ScrollView
        bounces={false}
        onScroll={scrollHandler}
        ref={scrollRef}
        contentOffset={{x: 0, y: (copyUsed.current) ? lockConstant + 5 : 0}}
        // decelerationRate={0.5}
        scrollEventThrottle={16}
        // scrollEnabled={!(endOfScroll && !endOfAnim)}
        scrollEnabled={true}
        indicatorStyle="black"
        showsVerticalScrollIndicator={true}
      >
        <StartScreen scrollOffset={scrollOffset} scrollBottom={scrollBottom}/>
        <View style={{marginBottom: approximateMargin()}}>
          <View style={{paddingHorizontal: 20}}>
            <Header/>
            <View style={{marginTop: 20}}>
              {renderTools(toolsData)}
            </View>
            <View style={styles.aboutContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("About")}>
                <Text style={styles.about}>About</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background
  },
  aboutContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  about: {
    fontSize: 16,
    fontFamily: "baloo2",
    color: colors.primary,
    width: 100,
    height: 40,
    textAlign: "center"
  },
  logoText: {
    fontSize: 67,
    fontFamily: "futura",
    lineHeight: 93
  },

  logoContainer: {
    height: 70,
    marginTop: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
})

export default HomePage;
