import { Alert } from "react-native";

export const confirm = ({title, message, destructive=false}: {title: string, message: string, destructive: boolean}, callback: () => void) => {
    Alert.alert(
      title,
      message,
      [

        {
          text: "Confirm",
          style: destructive ? "destructive" : "default",
          onPress: callback
        },
        {
          text: "Cancel",
          style: "cancel"
        },
      ]
    );
}
