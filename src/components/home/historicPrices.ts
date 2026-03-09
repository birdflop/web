// data/historicPrices.ts
export const historicPrices = {
  labels: ['Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
  datasets: [
    {
      label: 'US Reimbursements (%)',
      data: [22.2, 35.0, 35.0, 35.0, 37.0, 37.0, 33.7, 33.7, 33.7, 33.7],
      borderColor: '#55BBFF',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    },
    {
      label: 'EU Reimbursements (%)',
      data: [0.0, 6.0, 21.0, 21.0, 26.0, 27.0, 28.0, 26.0, 26.0, 26.0],
      borderColor: '#55FFBB',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1,
    },
  ],
};
