import React, { memo, ReactNode, useCallback, useEffect, useMemo } from "react";

import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import { colors } from "../../config/colors";
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { deleteTape } from "../../store/features/tapesSlice";

import { useNavigation } from "@react-navigation/native";
import IconIonicons from "react-native-vector-icons/Ionicons";
import ReanimatedArc from "../../breathing/use/components/ReanimatedArc";
import { cancelDownload, deleteAudio, downloadSingleTape, processDownloadQ } from "../../helpers/downloadAudio";
import { confirm } from "../../helpers/confirm";
import { playAudio } from "../../helpers/playAudio";
import RNFS from "react-native-fs";
import haptic from "../../helpers/haptic";
import RNBackgroundDownloader from "@kesha-antonov/react-native-background-downloader";
import { Easing } from "react-native-reanimated";
import AnimatedArc from "../../breathing/use/components/AnimatedArc";

let ContextMenuView;

if (Platform.OS === "ios") {
  ContextMenuView = require("react-native-ios-context-menu").ContextMenuView;
}

const AudioSetFilesTape = props => {
  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  useEffect(() => {
    console.log("Tapes rerendered!");
  });

  const calcDownloadData = useCallback(() => {
    let dlaverage;
    let calcStatus;

    // calculates status to show for entire set based on download status of individual parts
    if (props.file.parts.length >= 2 && props.downloadData) {
      const mapData = (props.downloadData ?? []).map(e => e.downloadState);

      if (mapData.every(data => data === 3)) {
        return { average: 0, status: 3 };
      } else if (mapData.some(data => data >= 1)) calcStatus = 2;
      else {
        return { average: 0, status: 0 };
      }

      const downloadsProgess = props.downloadData
        ?.slice(0, props.file.parts.length)
        ?.map(el => el?.progress ?? 0) ?? [];

      dlaverage = average(downloadsProgess) ?? 0;

    } else calcStatus = props.downloadData?.[0]?.downloadState ?? 0;

    let partDownload =
      props.file.parts.length >= 2
        ? dlaverage
        : props.downloadData?.[0]?.progress;

    const downloadData = { average: partDownload, status: calcStatus };

    return downloadData;
  }, [props.downloadData]);

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const disabledColor = useMemo(() => {
    const fullyDownloaded = props.downloadData
      ?.slice(0, props.file.parts.length)
      .every(part => part.downloadState === 3);
    // return fullyDownloaded ? undefined : {color: colors.dark ? "#444444" : "#B4B4B4"}
    return fullyDownloaded ? undefined : { color: "rgba(100, 100, 100, 0.6)" };
  }, [props.downloadData]);

  const typeIcons = {
    listen: (
      <IconMaterial
        name="headphones"
        size={18}
        color={colors.text}
        style={disabledColor}
      />
    ),
    sleep: (
      <IconMaterial
        name="sleep"
        size={21}
        color={colors.text}
        style={disabledColor}
      />
    ),
    relax: (
      <IconMaterial
        name="bed-queen-outline"
        size={23}
        color={colors.text}
        style={disabledColor}
      />
    )
  };

  const playAudioTrack = ({
                            part,
                            partData,
                            tapeName,
                            tapeNum,
                            totalParts,
                            file
                          }) => {
    const fileUrl = props.downloadData?.[part];
    if (!(fileUrl?.downloadState === 3) || !fileUrl.location) return;

    RNFS.exists(
      `${RNBackgroundDownloader.directories.documents}/${fileUrl.location}`
    ).then(fileExists => {
      if (!fileExists) {
        deleteAudio({ set: props.set.name, tape: tapeNum }).then(() => {
          dispatch(deleteTape({ set: props.set.name, tape: tapeNum }));

          downloadSingleTape(props.set, file);
          processDownloadQ();
        });
      } else {
        playAudio({
          part,
          tapeNum,
          tapeName,
          partData,
          set: props.set,
          totalParts
        }).then(() => {
          // @ts-ignore
          navigation.navigate("AudioPlayer");
        });
      }
    });
  };

  const handleCancel = downloadState => {
    switch (downloadState) {
      case 3:
        confirm(
          {
            title: "Delete Audio?",
            message: `\Delete "${props.file.name}" from downloads?`,
            destructive: true
          },
          () => {
            haptic(1);
            deleteAudio({ set: props.set.name, tape: props.file.episode }).catch(
              console.error
            );
            dispatch(
              deleteTape({ set: props.set.name, tape: props.file.episode })
            );
          }
        );
        break;
      case 1:
        cancelDownload({ set: props.set.name, tape: props.file.episode }).catch(
          console.error
        );
        dispatch(deleteTape({ set: props.set.name, tape: props.file.episode }));
        break;
      case 2:
        confirm(
          {
            title: `Cancel Download?`,
            message: `Stop downloading "${props.file.name}"?`,
            destructive: true
          },
          () => {
            haptic(1);
            cancelDownload({
              set: props.set.name,
              tape: props.file.episode
            }).catch(console.error);
            deleteAudio({ set: props.set.name, tape: props.file.episode }).catch(
              console.error
            );
            dispatch(
              deleteTape({ set: props.set.name, tape: props.file.episode })
            );
          }
        );

        break;
      default:
        haptic(1);

        downloadSingleTape(props.set, props.file).then(r => processDownloadQ());
    }
  };

  const renderLoadingCircle = (average: number) => {

    if (Platform.OS === "ios") {
      return <>
        <ReanimatedArc
          color={colors.text2}
          style={{ position: "absolute" }}
          diameter={22}
          width={2}
          rotation={0}
          easing={Easing.ease}
          initialAnimation={false}
          hideSmallAngle={true}
          arcSweepAngle={359}
          // arcSweepAngle={360}
          animationDuration={0}
          lineCap="round"
        />
        <ReanimatedArc
          color={colors.text}
          style={{ position: "absolute" }}
          diameter={22}
          width={2}
          rotation={0}
          easing={Easing.ease}
          initialAnimation={true}
          hideSmallAngle={false}
          arcSweepAngle={average * 3.5 ?? 0}
          // arcSweepAngle={360}
          animationDuration={200}
          lineCap="round"
        />
      </>;
    }

    return <>
      <AnimatedArc
        style={{ position: "absolute" }}
        diameter={22}
        color={colors.text}
        value={average / 100}
        duration={200}
      />
      <AnimatedArc
        style={{ position: "absolute" }}
        diameter={22}
        color={colors.text2}
        value={1}
        duration={0}
      />
    </>;
  };

  const renderDownload = ({ part = 0, inner }) => {
    //If audio is part of two-set or more then it averages progress between files
    const { status, average } = calcDownloadData();

    //Pressable needs to be on outside and have variable onpress because pressable creates alignment issues
    return (
      <Pressable
        style={[
          styles.download,
          inner ? styles.downloadInner : styles.downloadOuter
        ]}
        hitSlop={12}
        onPress={() => handleCancel(status)}>
        {(status === 1 || status === 2) && (
          <View style={[styles.loadingContainer, inner && { top: 8 }]}>
            <IconIonicons
              name={"ios-square"}
              // style={}
              size={10}
              color={colors.primary}
            />

            {renderLoadingCircle(average)}
          </View>
        )}

        {status === 3 && (
          <IconIonicons
            style={{ top: 5, height: 30 }}
            name={"trash-bin-outline"}
            size={20}
            color={colors.primary}
          />
        )}

        {status === 0 && (
          <IconIonicons
            style={{ top: 5, height: 30 }}
            name={"md-cloud-download-outline"}
            size={20}
            color={colors.primary}
          />
        )}
      </Pressable>
    );
  };

  const renderSingle = ({
                          totalParts = 1,
                          tapeName,
                          partData,
                          part = 0,
                          inner = false
                        }) => {
    const partNames = ["Part A", "Part B", "Part C", "Part D"];

    return (
      <Pressable
        onPress={() =>
          playAudioTrack({
            part,
            partData,
            tapeName,
            tapeNum: props.file.episode,
            totalParts,
            file: props.file
          })
        }>
        <View style={inner ? styles.singleTapeInner : styles.singleTape}>
          <IconIonicons
            name="play"
            size={28}
            color={colors.text}
            style={disabledColor}
          />
          <View style={styles.titleContainer}>
            <Text style={[styles.title, disabledColor]}>
              {inner ? partNames[part] : tapeName}
            </Text>
            <View style={styles.subtitle}>
              {typeIcons[partData[part].type]}
              <Text style={[styles.tapeTime, disabledColor]}>
                {partData[part].time || "22:00"}
              </Text>
            </View>
            {!inner && renderDownload({ part, inner: false })}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderMulti = file => {
    return (
      <View style={styles.multiTape}>
        <Text
          style={[styles.multiTapeTitle, disabledColor]}
          adjustsFontSizeToFit={true}
          numberOfLines={1}>
          {file.name}
        </Text>
        {renderDownload({ inner: true })}
        <View style={{ flexDirection: "row" }}>
          {file.parts.map((part, i) => {
            return (
              <View style={styles.multiInner} key={i}>
                {renderSingle({
                  tapeName: file.name,
                  partData: file.parts,
                  totalParts: file.parts.length,
                  part: i,
                  inner: true
                })}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (Platform.OS === "android") {
    {
      props.file.parts.length === 1
        ? renderSingle({ tapeName: props.file.name, partData: props.file.parts })
        : renderMulti(props.file);
    }
  }

  const iosRender = (content: ReactNode) => {
    if (Platform.Version <= 12) {
      return content;
    }

    return (<ContextMenuView
      lazyPreview={true}
      menuConfig={{
        menuTitle: `${props.set.name}`,
        menuItems: [
          {
            actionKey: "toggleFavorite",
            actionTitle: "Add to Favorites",
            icon: {
              type: "IMAGE_SYSTEM",
              imageValue: {
                systemName: "heart"
              }
            }
          }
        ]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        if (nativeEvent.actionKey === "toggleFavorite") return;
      }}>
      content
    </ContextMenuView>);
  };

  const getContent = () => {
    return props.file.parts.length === 1
      ? renderSingle({ tapeName: props.file.name, partData: props.file.parts })
      : renderMulti(props.file);
  };

  return (
    Platform.OS === "ios" ? iosRender(getContent()) : getContent()
  );
};

AudioSetFilesTape.propTypes = {
  file: PropTypes.object,
  set: PropTypes.object,
  downloadData: PropTypes.array
};

const styles = StyleSheet.create({
  loadingContainer: {
    right: 5,
    paddingLeft: 1,
    top: -8,
    justifyContent: "center",
    alignItems: "center"
  },
  downloadPress: {
    backgroundColor: "black",
    width: 20
  },
  download: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center"
  },
  downloadInner: {
    top: 4,
    right: 10
  },
  downloadOuter: {
    bottom: 1,
    right: -6
  },
  multiTapeTitle: {
    marginLeft: 6,
    marginTop: 8,
    // marginRight: 20,
    fontFamily: "Baloo 2",
    maxWidth: 205,
    lineHeight: 23,
    color: colors.primary,
    fontSize: 19
  },
  multiInner: {
    margin: 5
  },
  multiTape: {
    backgroundColor: colors.background3,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  titleContainer: {
    marginLeft: 5,
    paddingTop: 6,
    paddingBottom: 2,
    // marginRight: 10,
    justifyContent: "center"
  },
  title: {
    fontFamily: "Baloo 2",
    maxWidth: 220,
    lineHeight: 20,
    // marginRight: 30,
    marginBottom: 8,
    fontSize: 18,
    // textAlign: "center",
    textAlignVertical: "bottom",
    color: colors.primary,
    transform: [{ translateY: 3 }]
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
    transform: [{ translateY: -3 }]
  },
  tapeTime: {
    marginLeft: 4,
    fontFamily: "Baloo 2",
    fontSize: 18,
    color: colors.text
  },
  singleTape: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 7,
    backgroundColor: colors.background3,
    paddingLeft: 8,
    maxWidth: 270,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 16
  },
  singleTapeInner: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 7,
    backgroundColor: colors.dark ? colors.background4 : colors.background3,
    paddingLeft: 4,
    paddingTop: 1,
    paddingBottom: 0,
    paddingRight: 12
  },
  container: {
    // flexDirection: "row",
    // width: "100%",
    // height: 200
    // flex: 1,
  }
});

export default memo(AudioSetFilesTape);
