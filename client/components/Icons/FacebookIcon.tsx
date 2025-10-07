import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

export default function FacebookIcon({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        fill="#1976D2"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.5H9v-2a1 1 0 0 1 1-1h1V0H9a3 3 0 0 0-3 3v2.5H4V8h2v8h3V8h2l1-2.5z"
      />
    </Svg>
  );
}
