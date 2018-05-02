window.onload = function() {
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [1,2,3,4,5,6,7],
      datasets: [{
        label: [],
        data: []
      }]
    },
    options: {
      responsive: true
    }
  });
};

