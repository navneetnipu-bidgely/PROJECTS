// ------------
// - Template -
// ------------

// Configure the template
var template = `
<div style="width: 100%; height: 700px">
    <canvas id="weather_data_chart" height="75"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx = document.getElementById("weather_data_chart");

    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want
    var weather_data_chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [], // We will update this later in pm.getData()
            datasets: []
        },
        options: {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false,
            },
            legend: { display: true,position: 'top'},
            title: {
                display: true,
                text: 'weather data'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'date'
                    }
                }],
                yAxes: [{
                    stacked: false,
                    ticks: {
                        fontColor: this.tickColor,
                        min: 0
                        },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'temperature(F)'
                    }
                }]
            }
        }

    });


    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        weather_data_chart.data.labels=value.data.labels;
        weather_data_chart.data.datasets=value.data.datasets;

        weather_data_chart.update();
    });
</script>`;


// -------------------------
// - Bind data to template -
// -------------------------

// get request url response
var response = pm.response.json();
// console.log(response);

// some basic tests to check if we have proper data for ploting or not
var testpassed = true;

// test to check if raw data url response is correct or not
pm.test("response for raw data url have non empty list of values!", function () {

    try {
        pm.response.to.be.ok;
        pm.response.to.be.withBody;
        pm.response.to.be.json;
    } catch (e) {
        testpassed = false;
        console.error(e);
        throw Error(e);
    }

});


// console.log("testpassed:",testpassed);
// if the data passes the test, we will now proceed to contruct the plot
if (testpassed) {
    // console.log("testpassed:",testpassed);
    build_weather_data_plot(response);
}

// build_raw_data_plot plot function which creates vizData variable 
// which stores the necessary data to construct the plot for raw data values
// and this variable and template is passed to visualizer function
// like pm.visualizer.set(template, vizData) to use the data and template 
// and bind them together to create the plot

function build_weather_data_plot() {

    // call function to get the raw data values in proper format to be passed to template for plotting
    var weather_chart_data = get_weather_chart_data(response);
    
    // storing the visualization plot data in vizData in proper format
    var vizData = {
        data:{
            labels:weather_chart_data.data.labels,
            datasets:weather_chart_data.data.datasets
        }
    }

    console.log("vizData:", vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);

}

function get_weather_chart_data(weather_data){
    // raw_data_month_chart_data contains consumption details for each available billing cycle

    /*
       In get_raw_data_month_chart_data , we first initialize our output data structure which is below:
       
       var raw_data_month_chart_data={
           data:{
               labels:[],
               datasets:[] // datasets={data:[],backgroundColor:""};
           }
       };

       each data.labels will hold the billing cycles (x-axis)
       data.datasets represents the data consumption corresponding to particular billing cycle.
       that means data.datasets={
           data: this will hold Y-axis data consumption for this particular billing cycle
           backgroundColor: this will contain the bar graph background color which will be same for all bar graphs.
       };

   */
    // datasets={data:[],backgroundColor:""};
    var weather_chart_data={
           data:{
               labels:[],
               datasets:[
                   {    
                       label:"Max Temperature ",
                        data:[],
                        borderColor:"#d43013"
                    },
                    {    
                       label:"Avg Temperature",
                        data:[],
                        borderColor:"#188518"
                    },
                    {    
                       label:"Min Temperature",
                        data:[],
                        borderColor:"#e3e64c"
                    }

               ] 
           }
       };



    try{

        var date_index=0;
        for(var timestamp in weather_data){
            var date=getDateFromTimestamp(timestamp);
            var data=weather_data[timestamp];

            weather_chart_data.data.labels[date_index]=weather_chart_data.data.labels[date_index]=date;

            var minTemp=data.minTemp;
            var maxTemp=data.maxTemp;
            var avgTemp=data.avgTemp;

            weather_chart_data.data.datasets[0].data[date_index]=weather_chart_data.data.datasets[0].data[date_index]=maxTemp;

            weather_chart_data.data.datasets[1].data[date_index]=weather_chart_data.data.datasets[1].data[date_index]=avgTemp;

            weather_chart_data.data.datasets[2].data[date_index]=weather_chart_data.data.datasets[2].data[date_index]=minTemp;

            date_index++;
        }


    }catch (e){
        console.error(e);
        throw Error (e);
    }
    console.log("weather_chart_data:",weather_chart_data);
    return weather_chart_data;
}

// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp) {
    var date = new Date((timestamp-19800) * 1000);
    var date_str = date.toLocaleDateString("en-US");
    // console.log(date_str)
    return date_str;
}