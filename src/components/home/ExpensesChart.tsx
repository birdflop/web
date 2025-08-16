// components/elements/HistoricLinePlot.tsx
import { component$ } from '@builder.io/qwik';
import Chart from '~/components/Elements/Chart';

export default component$(() => {
  const config = {
    type: 'doughnut',
    data: {
      labels: [
        'EU Hosting Expenses',
        'US Hosting Expenses',
        'Infrastructure',
        'Platform Development',
        'Client Reimbursements',
        'Hosting Revenue',
        'Ad Revenue',
      ],
      datasets: [{
        // Outer Ring (EXPENDITURES)
        backgroundColor: [
          'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses
          'rgba(255, 50, 0, 0.2)', // US Hosting Expenses
          'rgba(255, 100, 0, 0.2)', // Infra
          'rgba(255, 150, 0, 0.2)', // Dev
          // 'rgba(255, 160, 0, 1)', // loan payments
          'rgba(255, 200, 0, 0.2)', // client reimbursements
          'rgba(0, 200, 0, 0.2)', // hosting revenue
          'rgba(0, 200, 120, 0.2)', // ad revenue
          // 'rgba(0, 210, 100, 1)',
          // 'rgba(0, 215, 150, 1)',
        ],
        borderColor: [
          'rgba(255, 0, 0, 1)', // EU Hosting Expenses
          'rgba(255, 50, 0, 1)', // US Hosting Expenses
          'rgba(255, 100, 0, 1)', // Infra
          'rgba(255, 150, 0, 1)', // Dev
          // 'rgba(255, 160, 0, 1)', // loan payments
          'rgba(255, 200, 0, 1)', // client reimbursements
          'rgba(0, 200, 0, 1)', // hosting revenue
          'rgba(0, 200, 120, 1)', // ad revenue
          // 'rgba(0, 210, 100, 1)',
          // 'rgba(0, 215, 150, 1)',
        ],
        borderWidth: 1,
        data: [1256.97, 2447.66, 319.02, 132.75, 1385.13, null, null],
      },
      {
        // Inner Ring (REVENUE)
        backgroundColor: [
          'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses
          'rgba(255, 50, 0, 0.2)', // US Hosting Expenses
          'rgba(255, 100, 0, 0.2)', // Infra
          'rgba(255, 150, 0, 0.2)', // Dev
          // 'rgba(255, 160, 0, 1)', // loan payments
          'rgba(255, 200, 0, 0.2)', // client reimbursements
          'rgba(0, 200, 0, 0.2)', // hosting revenue
          'rgba(0, 200, 120, 0.2)', // ad revenue
          // 'rgba(0, 210, 100, 1)',
          // 'rgba(0, 215, 150, 1)',
        ],
        borderColor: [
          'rgba(255, 0, 0, 1)', // EU Hosting Expenses
          'rgba(255, 50, 0, 1)', // US Hosting Expenses
          'rgba(255, 100, 0, 1)', // Infra
          'rgba(255, 150, 0, 1)', // Dev
          // 'rgba(255, 160, 0, 1)', // loan payments
          'rgba(255, 200, 0, 1)', // client reimbursements
          'rgba(0, 200, 0, 1)', // hosting revenue
          'rgba(0, 200, 120, 1)', // ad revenue
          // 'rgba(0, 210, 100, 1)',
          // 'rgba(0, 215, 150, 1)',
        ],
        borderWidth: 1,
        data: [null, null, null, null, null, 5693.36, 126.96],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'var(--color-lum-text)',
            usePointStyle: true,
          },
          position: 'bottom',
          title: {
            display: true,
            text: '',
            color: 'var(--color-lum-text)',
          },
        },
        tooltip: {
          enabled: true,
          cornerRadius: 10,
          padding: 10,
          callbacks: {
            label: 'dollarLabel',
          },
        },
      },
    },
  };

  return <Chart config={config} />;
});
