// components/elements/HistoricLinePlot.tsx
import { component$ } from '@builder.io/qwik';
import Chart from '~/components/elements/Chart';
import { historicPrices } from '~/data/historicPrices';

export default component$(() => {
  const config = {
    type: 'line',
    data: historicPrices,
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'white',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          ticks: {
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
  };

  return <Chart config={config} />;
});
