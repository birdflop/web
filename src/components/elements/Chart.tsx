import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, registerables } from 'chart.js';

export default component$(() => {
  const myChart = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (myChart?.value) {
      Chart.register(...registerables);
      new Chart(myChart.value, {
        type: 'doughnut',
        data: {
          labels: [
            'EU Hosting Expenses',
            'US Hosting Expenses',
            'Other Hosting Expenses',
            'Client Reimbursements',
            'Sustainability Fund Contributions',
            'Market Research',
            'Hosting Revenue',
            'Charitable Donations',
          ],
          datasets: [{
            // Outer Ring (EXPENDITURES)
            backgroundColor: [
              'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses
              'rgba(255, 40, 0, 0.2)', // US Hosting Expenses
              'rgba(255, 80, 0, 0.2)', // Other Hosting Expenses
              'rgba(255, 120, 0, 0.2)', // Client Reimbursements
              'rgba(255, 160, 0, 0.2)', // Sustainability Fund
              'rgba(255, 200, 0, 0.2)', // Market Research
              'rgba(0, 200, 0, 0.2)',
              'rgba(0, 200, 100, 0.2)',
            ],
            borderColor: [
              'rgba(255, 0, 0, 1)', // EU Hosting Expenses
              'rgba(255, 40, 0, 1)', // US Hosting Expenses
              'rgba(255, 80, 0, 1)', // Other Hosting Expenses
              'rgba(255, 120, 0, 1)', // Client Reimbursements
              'rgba(255, 160, 0, 1)', // Sustainability Fund
              'rgba(255, 200, 0, 1)', // Market Research
              'rgba(0, 200, 0, 1)',
              'rgba(0, 200, 100, 1)',
            ],
            borderWidth: 1,
            data: [436.20, 301.53, 80.07, 206.8, 2500, 300, null, null],
          },
          {
            // Inner Ring (REVENUE)
            backgroundColor: [
              'rgba(235, 100, 100, 0.2)',
              'rgba(255, 0, 0, 0.2)',
              'rgba(255, 0, 100, 0.2)',
              'rgba(235, 162, 54, 0.2)',
              'rgba(256, 100, 0, 0.2)',
              'rgba(256, 20, 0, 0.2)',
              'rgba(0, 200, 0, 0.2)',
              'rgba(0, 200, 100, 0.2)',
            ],
            borderColor: [
              'rgba(235, 100, 100, 1)',
              'rgba(255, 0, 0, 1)',
              'rgba(255, 0, 100, 1)',
              'rgba(235, 162, 54, 1)',
              'rgba(256, 100, 0, 1)',
              'rgba(256, 20, 0, 1)',
              'rgba(0, 200, 0, 1)',
              'rgba(0, 200, 100, 1)',
            ],
            borderWidth: 1,
            data: [null, null, null, null, null, null, 1034.89, 2889.98],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: 'white',
                usePointStyle: true,
              },
              position: 'bottom',
              title: {
                display: true,
                text: '',
                color: 'white',
              },
            },
            tooltip: {
              enabled: true,
              cornerRadius: 10,
              padding: 10,
              callbacks: {
                label: function (context) {
                  const label = ' ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(context.parsed);
                  return label;
                },
              },
            },
          },
        },
      });
    }
  });

  return (
    <div>
      <canvas ref={myChart} id="myChart"></canvas>
    </div>
  );
});