import React, { useEffect, useState } from "react";

import { Alert, AppState, Pressable, StyleSheet, Text, View } from "react-native";
import RenderSequence from "./components/render-sequence";
import BreathingAnim from "./components/breathing-animation";
import { useDispatch, useSelector } from "react-redux";
import TimeControls from "./components/time-controls";
import PrefersHomeIndicatorAutoHidden from "react-native-home-indicator";
import { useKeepAwake } from "@sayem314/react-native-keep-awake";
import Sound from "react-native-sound";
import useTooltip from "../../components/tooltip-hook";
import { colors } from "../../config/colors";
import { exitTutorial } from "../../store/features/tutorialSlice";
import useTimer from "./components/timer-hook";
import { RootState } from "../../store/store";

Sound.setCategory("Playback");

const PatternTime = ({ route, navigation }) => {
  const { id } = route.params;
  const patternData = useSelector((state: RootState) => state.breathing.patterns[id]);
  const settings = useSelector((state: RootState) => state.settings.breathing);

  useKeepAwake();

  //Tutorial state
  const tutorial = useSelector((state: RootState) => state.tutorial.breathing);
  const tooltip = useTooltip();
  const dispatch = useDispatch();

  const completed = () => {
    navigation.goBack();
    navigation.navigate("Completed", {id})
  }

  const [paused, setPaused] = useState(false);

  const {
    title,
    sequenceTime,
    currentIndex,
    currentTime,
    secondsPassed,
    patternCompletion,
    completionText
  } = useTimer({
    id,
    paused,
    completed
  })

  //On component loaded
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        setPaused(true)
      }
    });


    setTimeout(() => { //Pause on tutorial
      if (tutorial.open && tutorial.completion === 6) {
        setPaused(true);
      }
    }, 500)


    return () => {
      subscription.remove();
    }
  }, [])

  /*
   Pause Functions
  */
  const togglePause = () => {
    if (paused) setPaused(false);
    else setPaused(true);
  }

  const exit = () => navigation.navigate("Patterns")

  const confirmExit = () => {
    if (tutorial.open && tutorial.completion === 7) {
      handleTutorialExit()
      return;
    } //Use different tap handler
    setPaused(true)
    Alert.alert(
      "Exit Breathing?",
      `Are you sure you want to exit this breathing pattern?`,
      [

        {text: "Nevermind"},
        {
          text: "Confirm", onPress: () => {
            exit();
          }

        }
      ]
    );
  }

  const handleTutorialExit = () => {
    if (tutorial.open && tutorial.completion === 7) {
      dispatch(exitTutorial("breathing"));
      completed()
    }
  }



  return (
    <View style={styles.container}>
      <PrefersHomeIndicatorAutoHidden />
      <RenderSequence style={styles.sequenceContainer} sequence={patternData.sequence}
                      backgroundColor={colors.background2} />
      <View style={styles.animationContainer}>
        <BreathingAnim
          sequenceTime={sequenceTime}
          currentIndex={currentIndex}
          currentTime={currentTime}
          secondsPassed={secondsPassed}
          settings={settings}
          paused={paused}
          title={title}
          baseSize={45}
          canvasSize={260}/>
      </View>

      <TimeControls
        patternCompletion={3}
        completionText={completionText}
        togglePause={togglePause}
        paused={paused}
      />

      {
        tooltip(<Pressable style={styles.exitPressable} hitSlop={20} onPress={handleTutorialExit}>
          <View style={styles.exitContainer}>
            <Pressable hitSlop={30} onPress={confirmExit}>
              <Text style={styles.exit}>Exit</Text>
            </Pressable>
          </View>
        </Pressable>, 7)
      }
    </View>
  );
}

const styles = StyleSheet.create({
  exitPressable: {
    width: "100%",

  },
  exit: {
    fontSize: 20,
    fontFamily: "Avenir",
    // fontWeight: "normal",
    color: colors.primary
  },
  exitContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 6
  },
  sequenceContainer: {
    marginTop: 20
  },
  container: {
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  animationContainer: {
    width: "100%",
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center"
  }
})

export default PatternTime;
