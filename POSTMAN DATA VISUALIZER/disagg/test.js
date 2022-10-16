// ------------
// - Template -
// ------------

// Configure the template
var template = `
<canvas id="disagg_chart" height="100"></canvas>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx = document.getElementById("disagg_chart");

    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want
    var disagg_chart = new Chart(ctx, {
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
                text: 'disagg data for appliances'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'date'
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
                        labelString: 'disagg values in kWh'
                    }
                }]
            }
        }

    });

    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        // populate disagg_chart data for plotting
        disagg_chart.data.labels=value.labels;
        disagg_chart.data.datasets=value.datasets;
        console.log(value.labels);
        console.log(value.datasets);
        disagg_chart.update();
        });
</script>`;

// -------------------------
// - Bind data to template -
// -------------------------


// get request url response
var response= pm.response.json();
// console.log(response);

var appliance_name_mapping=pm.environment.get("appliance_name_mapping");
// console.log("appliance_name_mapping:",appliance_name_mapping);
appliance_name_mapping["17"]="total";
// console.log("appliance_name_mapping:",appliance_name_mapping);

// populate the appliance properties like color,index,lable etc.
var val=get_appliance_color_lable_index();
var appliance_label=val.appliance_label;
var appliance_color=val.appliance_color;

// console.log("val:",val);

// some basic tests to check if we have proper data for ploting or not
var testpassed=true;

// test to check if itemization url response is correct or not
pm.test("response for disagg url have non empty list values!",function () {

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


// test to check if the appliance_name_mapping have valid appliance mappings or not
pm.test("appliance_name_mapping have atleast one appliance mappings !", function () {
    try {
        pm.expect(Object.keys(appliance_name_mapping).length).to.be.greaterThan(0);
    } catch (e) {
            testpassed = false;
            console.error(e);
            throw Error(e);
    }
});


// console.log("testpassed:",testpassed);
// if the data passes the test, we will now proceed to contruct the plot
if(testpassed){
    // console.log("testpassed:",testpassed);
    build_disagg_plot();
}

// disagg plot function which creates vizData variable 
// which stores the necessary data to construct the plot for disagg values
// and this variablre and template is passed to visualizer function
// like pm.visualizer.set(template, vizData) to use the data and template 
// and bind them together to create the plot

function build_disagg_plot(){

    // call function to get the disagg values in proper format to be passed to template for plotting
    var disagg_data=get_disagg_data(response);

    // storing the visualization plot data in vizData in proper format
    var vizData={
        labels:disagg_data.labels,
        datasets:disagg_data.datasets
    }

    console.log("vizData:",vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);


}

// function to get the disagg values
function get_disagg_data(response){

    // disagg data to store appliances disagg values encapsulated in the date
    var disagg_data={
        labels:[],
        datasets:[] // datasets=[{label:"",data:[],backgroundColor:""},...]
    };

    try{

        var len=response.length;
        // creating appliance dataset index map to identify
        // which appliance is associated with which appliance
        var appId_to_dataset=new Map();

        // creating date map to check if date is already present in disagg_data.labels or not.
        var date_in_labels=new Map();

        for(var i=0;i<len;i++){
            var data = response[i];
            // console.log(data);
    
            var timestamp=data.time;
            var date=getDateFromTimestamp(timestamp);

            if(!date_in_labels.has(date)) {
                disagg_data.labels[date_in_labels.size]=date;
                date_in_labels.set(date,date_in_labels.size);
            }

        }


        
        for(var i=0;i<len;i++){

            var data = response[i];
            // console.log(data);
    
            var timestamp=data.time;
    
            // converting Wh value to kWh value
            var value=(data.value/1000).toFixed(2);
    
            var appId=data.appId;
    
            var date=getDateFromTimestamp(timestamp);

            var label_index=date_in_labels.get(date);
    
            if(!appId_to_dataset.has(appId)) appId_to_dataset.set(appId,appId_to_dataset.size);
    
            var dataset_index=appId_to_dataset.get(appId);
            // console.log("appId_to_dataset:",appId_to_dataset);
            // console.log("dataset_index:",dataset_index);
            // if dataset for particular appliance is empty then assign the constants values
            // and initiliaze the data array
            
            if(disagg_data.datasets[dataset_index]==undefined) {
                // console.log("breakpoint1");
                disagg_data.datasets[dataset_index]={
                    label:appliance_label[appId],
                    data:new Array(date_in_labels.size).fill(0),
                    backgroundColor:appliance_color[appId]
                };
                disagg_data.datasets[dataset_index].data[label_index]=value;
                // console.log("disagg_data.datasets[dataset_index]:",disagg_data.datasets[dataset_index]);
            }else{
                // console.log("breakpoint2");
                disagg_data.datasets[dataset_index].data[label_index]=value;
            }
    
            // console.log("disagg_data.datasets.data:",disagg_data.datasets);
            
        }

    }catch (e){
        console.error(e);
        throw Error(e);
    }
        

    // console.log(disagg_data);

    return disagg_data;
}

// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp){
    var date=new Date(timestamp * 1000);
    var date_str=date.toLocaleDateString("en-US");
    return date_str;
}

// function to get random color
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// function to get appliance color,label,index
function get_appliance_color_lable_index(){
    var appliance_properties={  
        appliance_color:{},
        appliance_label:{}
    };
   
    var index=0;
    try{
        for(var appId in appliance_name_mapping){   
            appliance_properties.appliance_label[appId]=appliance_name_mapping[appId];
            appliance_properties.appliance_color[appId]=getRandomColor();
    
            index++;
        }
    }catch (e){
        console.error(e);
        throw Error(e);
    }

    return appliance_properties;
}

// END OF PROGRAM