// components/home/HistoricLinePlot.tsx
import { component$ } from "@qwik.dev/core";
import Chart from "~/components/Elements/Chart";
import { historicPrices } from "./historicPrices";

export default component$(() => {
  const config = {
    type: "line",
    data: historicPrices,
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "var(--color-lum-text)",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "var(--color-lum-text)",
          },
          grid: {
            color: "var(--color-lum-text-secondary)",
          },
        },
        y: {
          ticks: {
            color: "var(--color-lum-text)",
          },
          grid: {
            color: "var(--color-lum-text-secondary)",
          },
        },
      },
    },
  };

  return <Chart config={config} />;
});
