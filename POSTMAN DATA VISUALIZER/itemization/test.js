// ------------
// - Template -
// ------------

// Configure the template
var template = `
<canvas id="itemizationChart" height="125"></canvas>
<canvas id="aggregated_itemizationChart" height="125"></canvas>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx1 = document.getElementById("itemizationChart");
    var ctx2 = document.getElementById("aggregated_itemizationChart");

    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want

    // chart configuration for temizationDetails
    var itemizationChart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // // we will make datasets list of n values where each json value will represent an appliance data
            // // datasets: [{
            // //     label: [], // label for appliances
            // //     data: [], // We will update this later in pm.getData()
            // //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // // }]

            datasets: [] // will be updated in the pm.getData()
        },
        options: {
            legend: { display: true,position: 'bottom'},
            title: {
                display: true,
                text: 'appliance itemization data for each billing cycle'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'BC start date'
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
                        labelString: 'cost/consumption values'
                    }
                }]
            }
        }

    });

    // chart configuration for aggregated itemizationDetails
    var aggregated_itemizationChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: [], // We will update this x axis label later in pm.getData()

            // // we will make datasets list of 99 values where each json value will represent an appliance data
            // // datasets: [{
            // //     label: [], // label for appliances
            // //     data: [], // We will update this later in pm.getData()
            // //     backgroundColor: "#348c29" // Change these colours to customize the chart
            // // }]

            datasets: [] // will be updated in the pm.getData()
        },
        options: {
            legend: { display: false,position: 'bottom'},
            title: {
                display: true,
                text: 'appliance itemization data for all billing cycle'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Appliances'
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
                        labelString: 'cost/consumption values'
                    }
                }]
            }
        }

    });

    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        // populate itemizationChart and aggregated_itemizationChart data for plotting
        itemizationChart.data.labels=value.itemizationChart_data.data.labels;
        itemizationChart.data.datasets=value.itemizationChart_data.data.datasets;
        aggregated_itemizationChart.data.labels=value.aggregated_itemizationChart_data.data.labels;
        aggregated_itemizationChart.data.datasets=value.aggregated_itemizationChart_data.data.datasets;
        
        itemizationChart.update();
        aggregated_itemizationChart.update();
    });

    
</script>`;

// -------------------------
// - Bind data to template -
// -------------------------


// get request url response
var response= pm.response.json();
// console.log(response);
response=response.payload;
// console.log("response:",response);

// measurement type for fetching correct itemization details
var measurementType=pm.environment.get("measurementType").toLowerCase();

var appliance_name_mapping=pm.environment.get("appliance_name_mapping");
appliance_name_mapping["17"]="total";
// console.log("appliance_name_mapping:",appliance_name_mapping);

// populate the appliance properties like color,index,lable etc.
var val=get_appliance_color_lable_index();
var appliance_label=val.appliance_label;
var appliance_color=val.appliance_color;

// console.log("val:",val);

var fuel_type={
    "electric":"electricity",
    "gas":"gas"
}


// costORconsumption = "cost" or "consumption"
var costORusage=pm.environment.get("costORusage").toLowerCase();

// some basic tests to check if we have proper data for ploting or not
var testpassed=true;

// test to check if itemization url response is correct or not
pm.test("response for itemization url have non empty list values!",function () {

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

// test to check if measurementType variable is correctly set in the environment variables or not
pm.test("measurementType variable is set correctly in environment variables!", function () {

    try {
        pm.expect(measurementType).to.be.oneOf(['gas','electric']);
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

// test to check if costORusage variable is correctly set in the environment variables or not
pm.test("costORusage variable is set correctly in environment variables!",function () {

    try {
        pm.expect(costORusage).to.be.oneOf(['usage','cost']);
    } catch (e) {
            testpassed = false;
            console.error(e);
            throw Error(e);
    }
    
});

console.log("testpassed:",testpassed);
// if the data passes the test, we will now proceed to contruct the plot
if(testpassed){
    // console.log("testpassed:",testpassed);
    build_appliance_itemization_plot();
}

// build_appliance_itemization_plot function which creates vizData variable 
// which stores the necessary data to construct the plot for appliance itemization 
// and this variable and template is passed to visualizer function
// like pm.visualizer.set(template, vizData) to use the data and template 
// and bind them together to create the plot
function build_appliance_itemization_plot(){

    var itemization_details=response.itemizationDetails;
    // console.log("input itemization_details:",itemization_details);
    var aggregated_itemization_details=response.aggregatedItemization.itemizationDetails;
    // console.log("input aggregated_itemization_details:",aggregated_itemization_details);


    // storing the visualization plot data in vizData in proper format
    var vizData={
        itemizationChart_data:get_itemizationChart_data(itemization_details),
        aggregated_itemizationChart_data:get_aggregated_itemizationChart_data(aggregated_itemization_details)
    }

    console.log("vizData:",vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);

}

// get  itemizationChart_data in required JSON form
function get_itemizationChart_data(itemization_details){

    /*
        In get_itemizationChart_data , we first initialize our output data structure which is below:
        
        var itemizationChart_data={
            data:{
                labels:[],
                datasets:[] // datasets={label:[],data:[],backgroundColor:""};
            }
        };

        each data.labels will hold the bill cycle start and end date (x-axis)
        each data.datasets represents the data correcponding to particular appliance id.
        that means data.datasets[0]={
            label: this will hold appliance name to identify the appliance category on the plot
            data: this will hold Y-axis data for this particular appliance having no of data = no of X-axis labels that is data for each bill cycle.
            backgroundColor: this will contain the bar graph background color for this particular appliance (randomly generated).
        };

    */


    // data structure for itemizationChart_data

    var itemizationChart_data={
        data:{
            labels:[],
            datasets:[] // datasets={label:[],data:[],backgroundColor:""};
        }
    };

    /*
        function get_itemizationChart_data(itemization_details){

    */

    // console.log("itemizationChart_data:",itemizationChart_data);

    // to store the dataset index associated with particular app id
    var datasets_app_index=new Map();

    try{
        var len1=itemization_details.length;
        // console.log("len1:",len1);
        for(var i=0;i<len1;i++){
            // console.log(itemization_details[i]);
            var details=itemization_details[i];
            // console.log("details:",details);
            
            var errorCode=itemization_details[i].context[fuel_type[measurementType]].errorCode;
            // console.log("errorCode:",errorCode);
    
            itemizationChart_data.data.labels[i]=details.startDate + "\n" + details.endDate;
    
            if (errorCode==1){
                var len2=details[measurementType].length;
                // console.log("len2:",len2);
    
                for(var j=0;j<len2;j++){
                    // useful values from details json data
                    var app_id=details[measurementType][j].id;
                    var usage=details[measurementType][j].usage;
                    var cost=details[measurementType][j].cost;
                    var category=details[measurementType][j].category;
                    // console.log("cost:",cost,",usage:",usage,",app_id:",app_id,",category:",category);
    
                    var datasets_app_index_len=datasets_app_index.size;
                    // console.log("datasets_app_index_len",datasets_app_index_len);
    
                    // assigning app index in datasets_app_index
                    (!datasets_app_index.has(app_id)) ? (datasets_app_index.set(app_id,datasets_app_index_len) ) : null;
                    // console.log("datasets_app_index",datasets_app_index);
                    // console.log("datasets_app_index.get(app_id):",datasets_app_index.get(app_id));
                    // console.log(itemizationChart_data.data.datasets[datasets_app_index.get(app_id)]);
                    if(itemizationChart_data.data.datasets[datasets_app_index.get(app_id)]==undefined){
                        itemizationChart_data.data.datasets[datasets_app_index.get(app_id)]={
                            label:category,
                            data:new Array(len1).fill(0),
                            backgroundColor:appliance_color[app_id]
                        }
                        // console.log("itemizationChart_data.data.datasets:",itemizationChart_data.data.datasets);
                    }
                    // console.log("itemizationChart_data.data:",itemizationChart_data.data);
                    // console.log("cost/consumption:",(costORusage=="usage") ? usage : cost);
                    // console.log("datasets_app_index.get(app_id):",datasets_app_index.get(app_id));
                    itemizationChart_data.data.datasets[datasets_app_index.get(app_id)].data[i] = (costORusage=="usage") ? usage : cost ;
                    // console.log("itemizationChart_data.data:",itemizationChart_data.data);
                    // console.log("breakpoint2");
                }
                
            } 
            else{
                // attaching the error code in the X-axis label itself
                itemizationChart_data.data.labels[i]+=("\n"+"errorCode:"+errorCode);
            }
            // console.log("datasets_app_index:",datasets_app_index);
            // console.log(itemizationChart_data.data.labels);
        }
    
        // console.log("itemizationChart_data:",itemizationChart_data);
    }catch (e) {
        console.error(e);
        throw Error(e);
    }
    
    return itemizationChart_data;

}

// get  aggregated_itemizationChart_data in required JSON form
function get_aggregated_itemizationChart_data(aggregated_itemization_details){
    // aggregated itemization data shows aggregate appliance itemization
    // for all the BCs having error free itemization data

     /*
        In get_aggregated_itemizationChart_data , we first initialize our output data structure which is below:
        
        var aggregated_itemizationChart_data={
            data:{
                labels:[],
                datasets:[] // datasets={data:[],backgroundColor:""};
            }
        };

        each data.labels will hold the appliance category (x-axis)
        data.datasets represents the data correcponding to particular appliance id.
        that means data.datasets={
            data: this will hold Y-axis data for this particular appliance.data length=labels length.
            backgroundColor: this will contain the bar graph background color (randomly generated) which will be same for all bar graphs.
        };

    */

    var aggregated_itemizationChart_data={
        data:{
            labels:[],
            datasets:[] // datasets={data:[],backgroundColor:""};
        }
    };

    try{
        var len=aggregated_itemization_details[measurementType].length;
        // initializing the datasets data and making background color for bar graphs fixed ="#348c29" .
        aggregated_itemizationChart_data.data.datasets[0]={
            backgroundColor:"#348c29",
            data:new Array(len).fill(0)
        };
        for(var i=0;i<len;i++){
            var data=aggregated_itemization_details[measurementType][i];
            // console.log("data:",data);
            aggregated_itemizationChart_data.data.labels[i]=appliance_label[data.id];
            aggregated_itemizationChart_data.data.datasets[0].data[i]= (costORusage=="usage") ?data.usage : data.cost ;       
        }
    
        // console.log("aggregated_itemizationChart_data:",aggregated_itemizationChart_data);
    }catch (e){
        console.error(e);
        throw Error(e);
    }
    
    return aggregated_itemizationChart_data;
}

// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp,locale){
    try{
        var date=new Date(timestamp * 1000);
        var date_str=date.toLocaleDateString(locale);
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