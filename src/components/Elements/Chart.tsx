// components/elements/Chart.tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, registerables } from 'chart.js';

export interface ChartProps {
  config: {
    type: string;
    data: any;
    options?: any;
  };
}
const dollarLabel = (context: {
  parsed: number | bigint | null | undefined;
}) => {
  if (
    context.parsed === null ||
    context.parsed === undefined ||
    isNaN(Number(context.parsed))
  ) {
    return ' N/A';
  }
  const label =
    ' ' +
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(context.parsed));
  return label;
};

export default component$<ChartProps>((props) => {
  const myChart = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (myChart?.value) {
      Chart.register(...registerables);

      let providedConfig = props.config;

      // find css variables in the config and replace them with their values
      const jsonString = JSON.stringify(providedConfig);
      const cssVarRegex = /var\(--(.*?)\)/g;
      const replacedString = jsonString.replace(
        cssVarRegex,
        (match, varName) => {
          const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${varName}`)
            .trim();
          return value ? value : match; // Return the original match if the variable is not found
        },
      );
      providedConfig = JSON.parse(replacedString);

      // small workaround for functions in the config
      if (
        providedConfig.options?.plugins?.tooltip?.callbacks?.label ===
        'dollarLabel'
      ) {
        providedConfig.options.plugins.tooltip.callbacks.label = dollarLabel;
      }

      // Use the provided config if available, otherwise default to the existing donut chart config.
      const chartConfig = providedConfig;

      new Chart(myChart.value, chartConfig);
    }
  });

  return (
    <div>
      <canvas ref={myChart} id="myChart"></canvas>
    </div>
  );
});
