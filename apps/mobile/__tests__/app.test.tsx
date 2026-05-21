import { render } from "@testing-library/react-native";
import { Text } from "react-native";

describe("App", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Text>PowerUp</Text>);
    expect(getByText("PowerUp")).toBeTruthy();
  });
});
