// data/historicPrices.ts
export const historicPrices = {
  labels: ['Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
  datasets: [
    {
      label: 'US Prices ($/GB RAM)',
      data: [2.33, 1.95, 1.95, 1.95, 1.89, 1.89, 1.99],
      borderColor: '#55BBFF',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    },
    {
      label: 'EU Prices ($/GB RAM)',
      data: [2.00, 1.88, 1.58, 1.58, 1.48, 1.46, 1.44],
      borderColor: '#55FFBB',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    },
  ],
};
