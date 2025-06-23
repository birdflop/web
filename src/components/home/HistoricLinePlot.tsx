// components/elements/HistoricLinePlot.tsx
import { component$ } from '@builder.io/qwik';
import Chart from '~/components/home/Chart';
import { historicPrices } from './historicPrices';

export default component$(() => {
  const config = {
    type: 'line',
    data: historicPrices,
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'gray',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: 'gray',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          ticks: {
            color: 'gray',
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
