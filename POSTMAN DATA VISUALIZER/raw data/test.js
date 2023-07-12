// ------------
// - Template -
// ------------

// Configure the template
var template = `
<div style="width: 100%; height: 700px">
<canvas id="raw_data_month_chart" height="100"></canvas>
</div>

<div style="width: 100%; height: 500px">
<canvas id="raw_data_day_chart" height="150"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx1 = document.getElementById("raw_data_month_chart");
    var ctx2 = document.getElementById("raw_data_day_chart");

    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want
    var raw_data_month_chart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // we will make datasets list of 99 values where each json value will represent an appliance data
            // datasets: [{
            //     label: [], // label for appliances
            //     data: [], // We will update this later in pm.getData()
            //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // }]

            datasets: []
        },
        options: {
            legend: { display: false,position: 'bottom'},
            title: {
                display: true,
                text: 'raw consumption data for each BC'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'billing cycle dates'
                    },
                    stacked: false,
                    barThickness: 30,
                    maxBarThickness: 10
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
                        labelString: 'raw data consumption in kWh'
                    }
                }]
            }
        }

    });

    var raw_data_day_chart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // we will make datasets list of 99 values where each json value will represent an appliance data
            // datasets: [{
            //     label: [], // label for appliances
            //     data: [], // We will update this later in pm.getData()
            //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // }]

            datasets: []
        },
        options: {
            legend: { display: false,position: 'bottom'},
            title: {
                display: true,
                text: 'raw data for each day'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'day'
                    },
                    stacked: false
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
                        labelString: 'raw data consumption (kWh)'
                    }
                }]
            }
        }

    });


    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        // populate raw_data_month_chart and raw_data_day_chart data for plotting

        raw_data_month_chart.data.labels=value.raw_data_month_chart_data.data.labels;
        raw_data_month_chart.data.datasets=value.raw_data_month_chart_data.data.datasets;

        raw_data_day_chart.data.labels=value.raw_data_day_chart_data.data.labels;
        raw_data_day_chart.data.datasets=value.raw_data_day_chart_data.data.datasets;
        
        raw_data_month_chart.update();
        raw_data_day_chart.update();


        });
</script>`;

// -------------------------
// - Bind data to template -
// -------------------------


// get request url response
var response = pm.response.json();
// console.log(response);

// list of billing cycles
var billing_cycles=pm.environment.get("billing_cycles");

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

// test to check if the billingcycles have atleast one bill cycle or not
pm.test("billing_cycles have atleast one bill cycle present !", function () {
    try {
        pm.expect(Object.keys(billing_cycles).length).to.be.greaterThan(0);
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
    build_raw_data_plot(response);
}

// build_raw_data_plot plot function which creates vizData variable 
// which stores the necessary data to construct the plot for raw data values
// and this variable and template is passed to visualizer function
// like pm.visualizer.set(template, vizData) to use the data and template 
// and bind them together to create the plot

function build_raw_data_plot() {

    // call function to get the raw data values in proper format to be passed to template for plotting
    var raw_data_month_chart_data = get_raw_data_month_chart_data(response);
    var raw_data_day_chart_data = get_raw_data_day_chart_data(response);

    // storing the visualization plot data in vizData in proper format
    var vizData = {
        raw_data_month_chart_data: raw_data_month_chart_data,
        raw_data_day_chart_data: raw_data_day_chart_data
    }

    console.log("vizData:", vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);


}

// function to get the disagg values
function get_raw_data_month_chart_data(api_raw_data) {

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
    var raw_data_month_chart_data={
           data:{
               labels:[],
               datasets:[{
                data:[],
                backgroundColor:"#348c29"
               }
               ] 
           }
       };

    try {

        // first store the input raw data in JSON format so as to sort the timestamps
        // data structure for JSON raw data will be:
        /*
            raw_data={
                timestamp:value
            }
        */

        var raw_data={};
        var len=api_raw_data.length;
        for(var i=0;i<len;i++){
            var timestamp=api_raw_data[i].time;
            var value=api_raw_data[i].value;
            raw_data[timestamp]=value;
        }

        var timestamps = Object.keys(raw_data);
        // sorting the timestamps in order to represent the data on graph in order of timestamp
        timestamps.sort();
        // console.log("timestamps:",timestamps);

        var len1 = timestamps.length;
        var len2= billing_cycles.length;

        // initializing datasets.data 
        raw_data_month_chart_data.data.datasets[0].data=new Array(len2).fill(0);

        /*
            we will iterate over the raw data points in raw_data.
            for each iteration we will check what is the billing cycle that particular timestamp belongs to.
            We will include that billing cycle in X-axis label.
            Then we will store the value of consumption in datasets.data for each billing cycle
        */

        var billing_cycle_index=0;
        var i=0;
        while (i < len1 && billing_cycle_index < len2) {
            // billing cycle details
            var bill_start_timestamp=billing_cycles[billing_cycle_index].key;
            var bill_end_timestamp=billing_cycles[billing_cycle_index].value;

            var timestamp = timestamps[i];
            var start_date=getDateFromTimestamp(bill_start_timestamp);
            var end_date=getDateFromTimestamp(bill_end_timestamp);
            
            // populating the X-axis labels
            if(raw_data_month_chart_data.data.labels[billing_cycle_index]==undefined) raw_data_month_chart_data.data.labels[billing_cycle_index]=start_date+" to "+end_date;

            if(timestamp>=bill_start_timestamp && timestamp<bill_end_timestamp){
                
                // populating the Y-axis values
                raw_data_month_chart_data.data.datasets[0].data[billing_cycle_index]+=raw_data[timestamp];

                i++;
                
                // if the raw data is the last datapoint,
                // then we need to convert the consumption data for this billing cycle into kWh
                if(i==len1){
                    // convert the consumption data for the last billing cycle to kWh from Wh.
                    // otherwise the while loop exists because i will be greater than len1
                    var data=raw_data_month_chart_data.data.datasets[0].data[billing_cycle_index];
                    data=(data/1000).toFixed(2);
                    raw_data_month_chart_data.data.datasets[0].data[billing_cycle_index]=data;
                }

            }else{
                // convert the consumption data for the last billing cycle to kWh from Wh.
                var data=raw_data_month_chart_data.data.datasets[0].data[billing_cycle_index];
                data=(data/1000).toFixed(2);
                raw_data_month_chart_data.data.datasets[0].data[billing_cycle_index]=data;

                billing_cycle_index++;
            }

        }

    } catch (e) {
        console.error(e);
        throw Error(e);
    }

    // console.log("raw_data_month_chart_data:",raw_data_month_chart_data);

    return raw_data_month_chart_data;
}

function get_raw_data_day_chart_data(api_raw_data) {

    // raw_data_day_chart_data contains consumption details for each available day.

    /*
       In get_raw_data_day_chart_data , we first initialize our output data structure which is below:
       
       var raw_data_day_chart_data={
           data:{
               labels:[],
               datasets:[] // datasets={data:[],backgroundColor:""};
           }
       };

       each data.labels will hold the billing cycles (x-axis)
       data.datasets represents the data consumption corresponding to particular billing cycle.
       that means data.datasets={
           data: this will hold Y-axis data consumption for this particular day
           backgroundColor: this will contain the bar graph background color which will be same for all bar graphs.
       };

   */

    var raw_data_day_chart_data={
           data:{
               labels:[],
               datasets:[{
                    data:[],
                    backgroundColor:"#0982ba"
                }
               ] 
           }
       };

    try {
        // first store the input raw data in JSON format so as to sort the timestamps
        // data structure for JSON raw data will be:
        /*
            raw_data={
                timestamp:value
            }
        */

        var raw_data={};
        var len=api_raw_data.length;
        for(var i=0;i<len;i++){
            var timestamp=api_raw_data[i].time;
            var value=api_raw_data[i].value;
            raw_data[timestamp]=value;
        }

        var timestamps = Object.keys(raw_data);
        // sorting the timestamps in order to represent the data on graph in order of timestamp
        timestamps.sort();
        // console.log("timestamps:",timestamps);

        // day_map to store day and its index to map datasets data to correct label
        var day_map=new Map();
        var len = timestamps.length;
        for(var i=0;i<len;i++){
            var timestamp=timestamps[i];
            var date=getDateFromTimestamp(timestamp);
            // console.log("date:",date);

            // put day in day_map
            (!day_map.has(date)) ? day_map.set(date,day_map.size) : null;
            var day_index=day_map.get(date);

            // populate the labels for X-axis

            (raw_data_day_chart_data.data.labels[day_index]==undefined) ? (raw_data_day_chart_data.data.labels[day_index]=date) : null;

            // populating the day data in datasets for each label
            (raw_data_day_chart_data.data.datasets[0].data[day_index]==undefined) ? (raw_data_day_chart_data.data.datasets[0].data[day_index]=raw_data[timestamp]) : (raw_data_day_chart_data.data.datasets[0].data[day_index]+=raw_data[timestamp]); 


        }

        // console.log("day_map:",day_map);
        // console.log("raw_data_day_chart_data.data.datasets[0].data:",raw_data_day_chart_data.data.datasets[0].data);

        // converting each raw data for each data into kWh
        len=raw_data_day_chart_data.data.labels.length;
        for(var i=0;i<len;i++){
            var temp_data=raw_data_day_chart_data.data.datasets[0].data[i];
            temp_data=(temp_data/1000);
            temp_data=temp_data.toFixed(2);
            raw_data_day_chart_data.data.datasets[0].data[i]=temp_data;
        }


    } catch (e) {
        console.error(e);
        throw Error(e);
    }

    return raw_data_day_chart_data;
}

// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp) {
    var date = new Date((timestamp-19800) * 1000);
    var date_str = date.toLocaleDateString("en-US");
    // console.log(date_str)
    return date_str;
}

// function to get random color
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// END OF PROGRAM