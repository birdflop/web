// components/elements/Chart.tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, registerables } from 'chart.js';

export interface ChartProps {
  config?: {
    type: string;
    data: any;
    options?: any;
  };
}

export default component$<ChartProps>((props) => {
  const myChart = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (myChart?.value) {
      Chart.register(...registerables);
      // Use the provided config if available, otherwise default to the existing donut chart config.
      const chartConfig = props.config || {
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
                color: 'gray',
                usePointStyle: true,
              },
              position: 'bottom',
              title: {
                display: true,
                text: '',
                color: 'gray',
              },
            },
            tooltip: {
              enabled: true,
              cornerRadius: 10,
              padding: 10,
              callbacks: {
                label: function (context: { parsed: number | bigint; }) {
                  const label = ' ' + new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(context.parsed);
                  return label;
                },
              },
            },
          },
        },
      };

      new Chart(myChart.value, chartConfig);
    }
  });

  return (
    <div>
      <canvas ref={myChart} id="myChart"></canvas>
    </div>
  );
});
