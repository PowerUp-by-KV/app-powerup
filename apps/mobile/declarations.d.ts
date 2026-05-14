import { ImageSourcePropType } from "react-native";

declare module "*.mp3" {
  const value: number;
  export default value;
}

declare module "*.png" {
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.jpg" {
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.jpeg" {
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.svg" {
  const value: ImageSourcePropType;
  export default value;
}
