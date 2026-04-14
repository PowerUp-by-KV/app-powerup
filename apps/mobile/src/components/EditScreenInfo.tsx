import React from "react";
import { Text, View } from "react-native";

import { ExternalLink } from "./ExternalLink";
import { MonoText } from "./StyledText";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View className="items-center mx-12">
      <View className="items-center mx-0">
        <Text className="text-base leading-6 text-center text-slate-900 dark:text-slate-200">
          Open up the code for this screen:
        </Text>

        <View className="bg-slate-200 dark:bg-white/5 rounded px-1 py-1 my-2">
          <MonoText>{path}</MonoText>
        </View>

        <Text className="text-base leading-6 text-center text-slate-900 dark:text-slate-200">
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>

      <View className="mt-4 mx-5 items-center">
        <ExternalLink
          className="py-4"
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text className="text-center text-blue-600 dark:text-blue-400">
            Tap here if your app doesn&apos;t automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}
