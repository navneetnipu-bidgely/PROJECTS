// ------------
// - Template -
// ------------

// Configure the template
var template = `
<div style="width: 100%; height: 500px">
<canvas id="billing_cost_consumption_data_chart" height="150"></canvas>
</div>
<div style="width: 100%; height: 500px">
<canvas id="charge_type_data_chart" height="150"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx1 = document.getElementById("billing_cost_consumption_data_chart");
    var ctx2 = document.getElementById("charge_type_data_chart");

    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want
    var billing_cost_consumption_data_chart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // we will make datasets list of 99 values where each json value will represent an appliance data
            // datasets: [{
            //     label: [], // label for appliances
            //     data: [], // We will update this later in pm.getData()
            //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // }]

            datasets: [] // will be updated in the pm.getData()
        },
        options: {
            legend: { display: false,position: 'bottom'},
            title: {
                display: true,
                text: 'billing data for each BC'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'billing cycle dates'
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
                        labelString: 'billing data in consumption(kWh)/cost'
                    }
                }]
            }
        }

    });

    var charge_type_data_chart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // we will make datasets list of 99 values where each json value will represent an appliance data
            // datasets: [{
            //     label: [], // label for appliances
            //     data: [], // We will update this later in pm.getData()
            //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // }]

            datasets: [] // will be updated in the pm.getData()
        },
        options: {
            legend: { display: true,position: 'bottom'},
            title: {
                display: true,
                text: 'charge types data in billing data for each BC'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'billing cycle dates'
                    },
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        fontColor: this.tickColor,
                        min: 0
                        },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'charge types in billing data consumption(kWh)/cost'
                    }
                }]
            }
        }

    });

    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        // populate billing_cost_consumption_data_chart and charge_type_data_chart data for plotting

        billing_cost_consumption_data_chart.data.labels=value.billing_cost_consumption_data.data.labels;
        billing_cost_consumption_data_chart.data.datasets=value.billing_cost_consumption_data.data.datasets;

        charge_type_data_chart.data.labels=value.billing_charge_types_data.data.labels;
        charge_type_data_chart.data.datasets=value.billing_charge_types_data.data.datasets;
        
        
        // console.log(value.labels);
        // console.log(value.datasets);

        charge_type_data_chart.update();
        billing_cost_consumption_data_chart.update();

        });
</script>`;

// -------------------------
// - Bind data to template -
// -------------------------


// get request url response
var response = pm.response.json();
// console.log(response);

var costORconsumption = pm.environment.get("costORconsumption");

// some basic tests to check if we have proper data for ploting or not
var testpassed = true;

// test to check if itemization url response is correct or not
pm.test("response for billing data url have non empty list values!", function () {

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

pm.test("costORconsumption variable is set correctly in environment variables!", function () {

    try {
        pm.expect(costORconsumption).to.be.oneOf(['consumption', 'cost']);
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
    build_billing_data_plot();
}

// build_billing_data_plot plot function which creates vizData variable 
// which stores the necessary data to construct the plot for billing data values
// and this variable and template is passed to visualizer function
// like pm.visualizer.set(template, vizData) to use the data and template 
// and bind them together to create the plot

function build_billing_data_plot() {

    // call function to get the billing data values in proper format to be passed to template for plotting
    var billing_cost_consumption_data = get_billing_cost_consumption_data(response);

    var billing_charge_types_data = get_billing_charge_types_data(response);

    // storing the visualization plot data in vizData in proper format
    var vizData = {
        billing_cost_consumption_data: billing_cost_consumption_data,
        billing_charge_types_data: billing_charge_types_data
    }

    console.log("vizData:", vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);


}

// function to get the disagg values
function get_billing_cost_consumption_data(api_billing_data) {

    // billing data contains cost and usage details for each available billing cycle

    /*
       In get_billing_cost_consumption_data , we first initialize our output data structure which is below:
       
       var billing_cost_consumption_data={
           data:{
               labels:[],
               datasets:[] // datasets={data:[],backgroundColor:""};
           }
       };

       each data.labels will hold the billing cycles (x-axis)
       data.datasets represents the data (cost/consumption) corresponding to particular billing cycle.
       that means data.datasets={
           data: this will hold Y-axis data (cost/consumption) for this particular billing cycle
           backgroundColor: this will contain the bar graph background color which will be same for all bar graphs.
       };

   */

    var billing_cost_consumption_data = {
        data: {
            labels: [],
            datasets: [
                {
                    data:[],
                    backgroundColor:"#348c29"
                }
            ] // datasets={data:[],backgroundColor:"#348c29"};
        }
    };

    try {

        var timestamps = Object.keys(api_billing_data);
        // sorting the timestamps in order to represent the data on graph in order of timestamp
        timestamps.sort();
        // console.log("timestamps:",timestamps);

        var len = timestamps.length;
        for (var i = 0; i < len; i++) {
            var timestamp = timestamps[i];
            var data=api_billing_data[timestamp];
            // console.log("data:",data);

            var start_date = getDateFromTimestamp(timestamp);
            var end_date = getDateFromTimestamp(data.billingEndTs);

            // adding date to X-axis lable
            billing_cost_consumption_data.data.labels[i] = start_date + " to " + end_date;

            // extracting cost and values information from billing api data for particular timestamp
            var value = data.value;
            var cost = data.cost;
            billing_cost_consumption_data.data.datasets[0].data[i]=(costORconsumption=="cost") ? cost : value ;

            // if bidgelyGeneratedInvoice is there then we acn attach BGI=true in X-axis lable itself
            var bidgelyGeneratedInvoice=data.bidgelyGeneratedInvoice;
            (bidgelyGeneratedInvoice==true) ? billing_cost_consumption_data.data.labels[i]+=("\n"+"BGI=true") : null ;

        }


    } catch (e) {
        console.error(e);
        throw Error(e);
    }

    // console.log("billing_cost_consumption_data:",billing_cost_consumption_data);

    return billing_cost_consumption_data;
}

function get_billing_charge_types_data(api_billing_data) {
    // billing data contains cost and usage details for each available billing cycle

    /*
        In get_billing_charge_types_data , we first initialize our output data structure which is below:
        
        var billing_charge_types_data={
            data:{
                labels:[],
                datasets:[] // datasets={data:[],backgroundColor:""};
            }
        };

        each data.labels will hold the billing cycles (x-axis)
        data.datasets represents the data (cost/consumption) corresponding to particular billing cycle.
        that means data.datasets={
            data: this will hold Y-axis data (cost/consumption) for this particular billing cycle
            backgroundColor: this will contain the bar graph background color which will be same for all bar graphs.
        };

    */

    var billing_charge_types_data = {
        data: {
            labels: [],
            datasets: [] // datasets=[{label:"",data:[],backgroundColor:"#348c29"},...];
        }
    };

    try {
        var timestamps = Object.keys(api_billing_data);
        // sorting the timestamps in order to represent the data on graph in order of timestamp
        timestamps.sort();
        // console.log("timestamps:",timestamps);

        //charge_type_index maps charge type with the dataset index 
        // this will hepl while putting values in datasets for proper charge type
        var charge_type_index= new Map();

        var len1 = timestamps.length;

        for(var i=0;i<len1;i++){
            var timestamp=timestamps[i];
            var start_date=getDateFromTimestamp(timestamp);
            var data=api_billing_data[timestamp];
            var end_date=getDateFromTimestamp(data.billingEndTs);
            var bidgelyGeneratedInvoice=data.bidgelyGeneratedInvoice;

            // setting X-axis label as date for the plot
            billing_charge_types_data.data.labels[i]=start_date+" to "+end_date;

            if(!bidgelyGeneratedInvoice){
                console.log("data:",data);
                var charge_types_data=data.invoiceDataList;
                console.log("charge_types_data:",charge_types_data);

                var len2=Object.keys(charge_types_data).length;
                
                for(var j=0;j<len2;j++){
                    var charge_type_data=charge_types_data[j];
                    var charge_type=charge_type_data.chargeType;
                    var cost=charge_type_data.cost;
                    var consumption=charge_type_data.consumption;

                    (!charge_type_index.has(charge_type)) ? charge_type_index.set(charge_type,charge_type_index.size) : null;

                    var dataset_index=charge_type_index.get(charge_type);
                    if(billing_charge_types_data.data.datasets[dataset_index]==undefined){
                        console.log("initializing the datasets for charge type:",charge_type);
                        billing_charge_types_data.data.datasets[dataset_index]={
                            label:charge_type,
                            data:new Array(len1).fill(0),
                            backgroundColor:getRandomColor()
                        }
                    }
                    billing_charge_types_data.data.datasets[dataset_index].data[i]=(costORconsumption=="cost") ? cost : consumption;
                }

            }
        }


    } catch (e) {
        console.error(e);
        throw Error(e);
    }

    return billing_charge_types_data;
}

// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp,locale){
    try{
        var date=new Date((timestamp-19800) * 1000);
        var date_str=date.toLocaleDateString("en-US");
    }catch (e){
        console.error(e);
        throw Error(e);
    }
    
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