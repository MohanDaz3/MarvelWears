axios.get('/admin/chartdata')
.then((response) => {
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: response.data.date,
                datasets: [{
                    label: 'Sales',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: response.data.data
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }
})
.catch(error => {
    console.error(error);
});

// ******************second chart****************
axios.get('/admin/chartdata2')
    .then((response) => {
      const data = response.data.data;
      const date = response.data.date;
  
      if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: date,
            datasets: [
              {
                label: "Sales",
                backgroundColor: "#5897fb",
                barThickness: 10,
                data: data
              }
            ]
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    })
    .catch(error => {
      console.error(error);
    });