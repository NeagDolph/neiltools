import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {Alert, LayoutAnimation, Pressable, StyleSheet, Text, View} from "react-native";
import {Surface} from "react-native-paper";
import PropTypes from 'prop-types'
import {colors} from "../../config/colors";
import AudioPage from "../audio-page";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  FadeInUp,
  FadeOut,
  runOnJS, Layout, FadeOutUp, FadeIn, useAnimatedGestureHandler, withSpring,
} from "react-native-reanimated";

import IconEntypo from "react-native-vector-icons/Entypo";
import AudioSetFiles from "./audio-set-files";
import {useDispatch, useSelector} from "react-redux";
import IconIonicons from "react-native-vector-icons/Ionicons";
import {downloadAudioSet} from "../../helpers/downloadAudio";
import {setDownload, setDownloaded, setFavorite, setProgress} from "../../store/features/tapesSlice";
import RNBackgroundDownloader from 'react-native-background-downloader'
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import ReanimatedArc from "../../breathing/use/components/ReanimatedArc";
import haptic from "../../helpers/haptic";
import LabelBackground from "react-native-paper/lib/typescript/components/TextInput/Label/LabelBackground";
import {ContextMenuButton, ContextMenuView} from "react-native-ios-context-menu";
import {PanGestureHandler} from "react-native-gesture-handler";
import background from "../../components/background";

const AudioSet = (props) => {
  const downloads = useSelector(state => state.tapes[props.set.name]);
  const favorites = useSelector(state => state.tapes.favorites);

  const pressTimeRef = useRef(Date.now());
  const panRef = useRef();

  const [dragMode, setDragMode] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [tapeHeight, setTapeHeight] = useState(0);

  const dragX = useSharedValue(0);

  const swipeActivate = () => {
    toggleFavorite()
  }

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = dragX.value;
      ctx.activateOffset = 30
      ctx.dragMode = 0
    },
    onActive: ({translationX}, ctx) => {
      if (open) return

      if (translationX !== 0) {
        // const deadZone = 30 //Acts like min dist
        if (translationX < 0) {
          translationX = -Math.pow(-translationX, 0.75)
          translationX = Math.min(translationX, 0);
        } else translationX = 0
      }

      ctx.totalMove = translationX
      if (translationX < -ctx.activateOffset) {
        if (ctx.dragMode !== 1) runOnJS(haptic)(1)
        ctx.dragMode = 1
      } else if (translationX > -ctx.activateOffset) {
        if (ctx.dragMode !== 0) runOnJS(haptic)(0)
        ctx.dragMode = 0
      }


      runOnJS(setDragMode)(ctx.dragMode);

      dragX.value = ctx.startX + translationX;
    },
    onEnd: (_, ctx) => {
      dragX.value = withSpring(0, {
        overshootClamping: true,
        mass: 3.5,
        damping: 25,
        stiffness: 340
      });

      if (ctx.totalMove < -ctx.activateOffset && !open) runOnJS(swipeActivate)();
    }
  }, [open, dragMode])

  const panStyle = useAnimatedStyle(() => ({transform: [{translateX: dragX.value}]}));


  const dispatch = useDispatch();

  const anyDownloaded = useMemo(() => {
    return downloads?.some(tape => tape?.downloads?.some(part => part?.downloadState >= 1) ?? false) ?? false
  }, [downloads])


  const isFavorite = useMemo(() => favorites.includes(props.set.name), [props.set.name, favorites]);

  const toggleFavorite = () => {
    haptic(1)
    LayoutAnimation.easeInEaseOut()
    if (isFavorite) dispatch(setFavorite({set: props.set.name, favorite: false}));
    else {
      dispatch(setFavorite({set: props.set.name, favorite: true}))
    }
  }

  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  const [downloadingAll, setDownloadingAll] = useState(false);

  const fullProgressCalc = useMemo(() => {
    return downloadingAll ? downloads?.reduce((tot, el, i) => {
      return tot.concat(el?.downloads?.slice(0, props.set.files[i].parts.length).reduce((tot2, el2) => {
        return tot2.concat([el2?.progress])
      }, []))
    }, []) : [0]
  }, [downloads, downloadingAll]);

  const allDownloaded = useMemo(() => { //If all parts of all tapes are downloaded
    return downloads?.every((tape, i) => {
      return tape?.downloads?.slice(0, props.set.files[i].parts.length).every(part => part.downloadState === 3) ?? false
    }) ?? false
  }, [downloads]);

  const filesLength = (audioSet) => audioSet.files.reduce((tot, el) => tot + el.parts.length, 0)

  useEffect(() => {
    if (open && mounted) {
      openValue.value = 1
    } else {
      openValue.value = 0
    }

    if (open) setShowOpen(true)
  }, [mounted, open]);

  useEffect(() => {
    if (allDownloaded) setDownloadingAll(false)
  }, [allDownloaded]);

  const layoutContent = ({nativeEvent}) => {
    openHeightValue.value = nativeEvent.layout.height + 100
  }


  const openValue = useSharedValue(0)
  const openHeightValue = useSharedValue(0)

  const stopShowOpen = () => setShowOpen(false)

  const heightStyle = useAnimatedStyle(() => {
    const heightValue = interpolate(openValue.value, [0, 1], [90, openHeightValue.value], {extrapolateLeft: "clamp"});
    // const heightValue = (openHeightValue.value < 200 && open) ? 900 : interpolate(openValue.value, [0, 1], [72, openHeightValue.value], {});

    return {
      height: withTiming(heightValue, {
        duration: 300,
        easing: Easing.linear
      }, () => {
        if (!open) runOnJS(stopShowOpen)()
      }),
    };
  }, [open]);

  const buttonStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(openValue.value, [0, 1], [0, 90], {extrapolateRight: "clamp"});

    return {
      transform: [
        {
          rotateZ: withTiming(rotateValue + "deg", {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        }
      ]
    }
  })

  const downloadSet = () => {
    haptic(0)
    setDownloadingAll(true)
    downloadAudioSet(props.set)
      .catch(console.error)
  }

  const renderOpenButton = () => {
    const calcAverage = average(fullProgressCalc)
    return <View style={styles.animatedButtonContainer}>
      {
        (calcAverage < 100 && downloadingAll) &&
          <ReanimatedArc
              color={colors.text}
              style={{position: "absolute"}}
              diameter={38}
              width={2}
              arcSweepAngle={(average(fullProgressCalc) * 3.6) ?? 0}
            // arcSweepAngle={(75 * 3.6) ?? 0}
              animationDuration={200}
              lineCap="round"
          />
      }
      <Animated.View style={[styles.openButton, buttonStyle]}>
        <IconEntypo size={22} name="chevron-right" color={colors.text}/>
      </Animated.View>
    </View>
  }

  const pressToggle = () => {
    const timeSinceIn = Date.now() - pressTimeRef.current;

    if (timeSinceIn < 170) setOpen(!open)
  }

  return (
    <ContextMenuView
      isContextMenuEnabled={!open}
      lazyPreview={false}
      menuConfig={{
        menuTitle: `${props.set.name}`,
        menuItems: [
          {
            actionKey: "toggleFavorite",
            actionTitle: isFavorite ? 'Remove From Favorites' : "Add to Favorites",
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: isFavorite ? "heart.slash" : 'heart',
              },
            }
          },
          allDownloaded || {
            actionKey: "downloadAll",
            actionTitle: "Download all Tapes",
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'square.and.arrow.down.on.square',
              },
            }
          }
        ],
      }}
      onPressMenuItem={({nativeEvent}) => {
        if (nativeEvent.actionKey === "toggleFavorite") setTimeout(toggleFavorite, 550);
        if (nativeEvent.actionKey === "downloadAll") downloadSet();
      }}
    >
      <View style={[styles.backplate, {height: Math.min(tapeHeight, 90)}]}>
        <IconIonicons
          name={
            isFavorite ?
              (dragMode === 1 ? "heart-dislike-sharp" : "heart-dislike-outline") :
              (dragMode === 1 ? "heart-sharp" : "heart-outline")
          }
          size={30}
          color={dragMode === 0 ? colors.text : (isFavorite ? colors.primary : colors.red)}
        />
      </View>
      <PanGestureHandler ref={panRef} minDist={30} onGestureEvent={panHandler}
                         simultaneousHandlers={[props.scrollRef]}
      >
        <Animated.View style={[styles.animatedContainer, heightStyle, panStyle]}>
          <Surface onLayout={(e) => {
            setTapeHeight(e.nativeEvent.layout.height)
          }} style={[styles.audioSet, {borderLeftWidth: 6, borderLeftColor: props.set.icon}]}
                   key={props.set.name}>
            <View style={styles.topContainer}>
              <Pressable style={{width: "100%", flexDirection: "row"}}
                         onPressIn={() => pressTimeRef.current = Date.now()}
                         onPress={pressToggle}>
                <View style={styles.titleContainer}>
                  <Text style={styles.author}>Richard L. Johnson</Text>
                  <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>{props.set.name}</Text>
                  <Text style={styles.subtitle}>{filesLength(props.set)} Tapes</Text>
                </View>
                <View style={styles.openButtonContainer}>
                  {anyDownloaded ?
                    renderOpenButton() :
                    <Pressable onPress={downloadSet}>
                      <View style={styles.downloadButton}>
                        <IconIonicons size={25} name="md-download-outline" color={colors.primary}/>
                      </View>
                    </Pressable>
                  }
                  {/*<Pressable onPress={toggleFavorite} style={styles.favoriteContainer} hitSlop={15}>*/}
                  {/*  {*/}
                  {/*    isFavorite ?*/}
                  {/*      <IconIonicons name={"md-heart"} color={colors.red} size={22}></IconIonicons> :*/}
                  {/*      <IconIonicons name={"md-heart-outline"} color={colors.text} size={22}></IconIonicons>*/}

                  {/*  }*/}
                  {/*</Pressable>*/}
                </View>
              </Pressable>
            </View>
            <View style={styles.audioContainer}>
              <View onLayout={layoutContent}>
                {
                  showOpen &&
                    <>
                      {/*<View style={styles.descriptionContainerOuter}>*/}
                      {/*    <View style={styles.descriptionContainer}>*/}
                      {/*        <View style={styles.descriptionTitleContainer}>*/}
                      {/*            <IconMaterial name="note-text-outline" size={25} color={colors.primary}/>*/}
                      {/*            <Text style={styles.descriptionTitle}>About This Tape</Text>*/}
                      {/*        </View>*/}
                      {/*        <Text style={styles.description}>{props.set.description}</Text>*/}
                      {/*    </View>*/}
                      {/*</View>*/}
                        <AudioSetFiles layout={() => setMounted(true)} set={props.set} downloadData={downloads}/>
                    </>
                }
              </View>
            </View>
          </Surface>
        </Animated.View>

      </PanGestureHandler>
    </ContextMenuView>
  );
};

AudioSet.propTypes = {
  set: PropTypes.object,
  setIndex: PropTypes.number,
  scrollRef: PropTypes.any
}

const styles = StyleSheet.create({
  backplate: {
    width: "100%",
    paddingRight: 5,
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "flex-end",
    alignItems: "flex-end",
    // paddingVertical: 5,
    backgroundColor: colors.background3,
    position: "absolute"
  },
  favoriteContainer: {
    marginLeft: 5
  },
  author: {
    fontFamily: "avenir",
    fontSize: 14,
    color: colors.text
  },
  animatedButtonContainer: {
    width: 42,
    justifyContent: "center",
    alignItems: "center"
  },
  descriptionTitleContainer: {
    flexDirection: "row",
  },
  descriptionTitle: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 5,
    fontFamily: "Baloo 2",
  },
  description: {
    fontSize: 16,
    paddingHorizontal: 2,
    fontFamily: "Baloo 2",
    color: colors.primary
  },
  descriptionContainer: {
    width: "100%",
    backgroundColor: colors.background3,
    paddingVertical: 8,
    borderRadius: 5,
    paddingHorizontal: 12
  },

  descriptionContainerOuter: {
    width: "100%",
    paddingHorizontal: 5
  },
  downloadButton: {
    padding: 9,
    // width: 42,
    // height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background3,
    borderRadius: 50
  },
  openButtonContainer: {
    justifyContent: "center",
    marginRight: 5,
    alignItems: "center",
    alignContent: "center",
    flexDirection: "row"
  },
  openButton: {
    padding: 6,
    backgroundColor: colors.background3,
    borderRadius: 50
  },
  animatedContainer: {
    // marginTop: 15,
    overflow: "hidden",
    // flex: 1,
    // padding: 3,
  },
  audioContainer: {
    // height: 260,
    // flex: 1,
    width: "100%",
  },
  topContainer: {
    flexDirection: "row",
    height: 75,
    alignItems: "center"
  },
  audioOpen: {
    height: 300
  },
  audioSet: {
    // flex: 1,
    minHeight: 65,
    width: "100%",
    backgroundColor: colors.background2,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5,
    // justifyContent: "center",
    flexDirection: "column",
    elevation: 2,
    marginBottom: 0
  },
  setIcon: {
    backgroundColor: "#71A8FA",
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  titleContainer: {
    flexDirection: "column",
    paddingLeft: 0,
    height: 62,
    flex: 1,
    justifyContent: "flex-start",
    paddingRight: 4
  },
  title: {
    fontFamily: "Roboto",
    fontSize: 18,
    // lineHeight: 26,
    // maxWidth: 200,
    color: colors.primary,
    paddingRight: 10,
    marginVertical: 0,
    // flex: 0
    paddingBottom: 2,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,

    color: colors.text,
    fontFamily: "Baloo 2"
  }
})
export default AudioSet;
