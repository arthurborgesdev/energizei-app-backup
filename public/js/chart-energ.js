window.onload = function() {
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [1,2,3,4,5,6,7],
      datasets: [{
        label: 'VoltageAN',
        data: [224.04, 226.11, 226.53, 226.46, 225.36, 222.32]
      }]
    },
    options: {
      responsive: true
    }
  });
};

