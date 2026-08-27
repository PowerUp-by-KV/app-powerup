import React from "react";
import { Text, Pressable, View } from "react-native";

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
}

// Deliberately dependency-free: this sits above the Redux Provider and the
// router Stack, so it must render a fallback even if the crash happened
// inside those providers - it cannot rely on hooks that need them (router,
// Redux, safe-area context). Without this, any uncaught render error was a
// permanent blank white screen, which also fails the Play Console
// pre-launch report.
export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Uncaught render error at app root:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-slate-900 font-extrabold text-2xl text-center">
            Something went wrong
          </Text>
          <Text className="text-slate-500 font-medium text-sm text-center mt-2 mb-8 max-w-[80%]">
            The app hit an unexpected error. Try restarting it.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="px-6 py-3 bg-indigo-600 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Text className="text-white font-bold text-sm">RETRY</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
