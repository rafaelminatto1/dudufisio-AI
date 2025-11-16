import type { ResponsiveBarProps } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import type { Theme } from '@nivo/core';
import { mergeThemes } from '../theme';

export type NivoBarChartProps<RawDatum extends object> = ResponsiveBarProps<RawDatum> & {
  height?: number;
  themeOverride?: Theme;
};

export function NivoBarChart<RawDatum extends object>({
  height = 300,
  themeOverride,
  margin = { top: 24, right: 24, bottom: 48, left: 60 },
  motionConfig = 'gentle',
  padding = 0.3,
  enableLabel = false,
  ...props
}: NivoBarChartProps<RawDatum>) {
  return (
    <div style={{ height }}>
      <ResponsiveBar<RawDatum>
        {...props}
        margin={margin}
        motionConfig={motionConfig}
        padding={padding}
        enableLabel={enableLabel}
        theme={mergeThemes(themeOverride)}
      />
    </div>
  );
}

