/*

    chart1=>stacked count of notificationTypes vs deliveryMode
    chart2=>stacked notificationType vs timeline for each deliveryMode if available (one chart for each deliveryMode)

*/

// ------------
// - Template -
// ------------

// Configure the template
var template = `
<div style="width: 100%; height: 700px">
    <canvas id="notification_BC_chart" height="125"></canvas>
</div>
<div style="width: 100%; height: 700px">
    <canvas id="notification_date_chart" height="125"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script> 

<script>
    // Get DOM element to render the chart in
    var ctx1 = document.getElementById("notification_BC_chart");
    var ctx2 = document.getElementById("notification_date_chart");


    // Configure Chart JS here.
    // You can customize the options passed to this constructor to
    // make the chart look and behave the way you want

    // chart configuration for temizationDetails
    var notification_BC_chart = new Chart(ctx1, {
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
                text: 'different notifications generated on each billing cycle'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'billing cycle date'
                    },
                    stacked: true,
                    barThickness: 30
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
                        labelString: 'generated notifications count'
                    }
                }]
            }
        }

    });

    var notification_date_chart = new Chart(ctx2, {
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
                text: 'different notifications generation timeline'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'date of notification generation'
                    },
                    stacked: true,
                    barThickness: 30
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
                        labelString: 'generated notifications count'
                    }
                }]
            }
        }

    });

    
    // Access the data passed to pm.visualizer.set() from the JavaScript
    // code of the Visualizer template
    pm.getData(function (err, value) {
        // populate itemizationChart and aggregated_itemizationChart data for plotting
        
        notification_BC_chart.data.labels=value.utilityNotification_per_BC_plot_data.data.labels;
        notification_BC_chart.data.datasets=value.utilityNotification_per_BC_plot_data.data.datasets;

        notification_date_chart.data.labels=value.utilityNotification_timeline_plot_data.data.labels;
        notification_date_chart.data.datasets=value.utilityNotification_timeline_plot_data.data.datasets;
        
        notification_BC_chart.update();
        notification_date_chart.update();
    });

    
</script>`;

// -------------------------
// - Bind data to template -
// -------------------------


// get request url response
var response= pm.response.json();
response=response.payload;

// get the billing cycles
var billing_cycles=pm.environment.get("billing_cycles");

// get the delivery mode to process the plot
var deliveryMode=pm.environment.get("deliveryMode");

var testpassed=true;

// some basic tests to check if we have proper data for ploting or not

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

// test to check if atleast one billing cycle exists or not.
pm.test("billing cycles have atleast one datapoint!",function () {

    try {
        pm.expect(billing_cycles.length).to.be.greaterThan(0);
    } catch (e) {
            testpassed = false;
            console.error(e);
            throw Error(e);
    }
    
});

// test to check if deliveryMode is properly set or not.
pm.test("delivery mode is correctly set!",function () {

    try {
        pm.expect(deliveryMode).to.be.oneOf(['SMS','Email','Http','Push','Paper','Default']);
    } catch (e) {
            testpassed = false;
            console.error(e);
            throw Error(e);
    }
    
});

console.log("testpassed:",testpassed);
// if the data passes the test, we will now proceed to contruct the plot
if(testpassed){
    build_utility_notification_plot();
}

function build_utility_notification_plot(){

    var utilityNotification_per_BC_plot_data=get_utilityNotification_per_BC_plot_data();
    var utilityNotification_timeline_plot_data=get_utilityNotification_timeline_plot_data();

    var vizData={
        utilityNotification_per_BC_plot_data:utilityNotification_per_BC_plot_data,
        utilityNotification_timeline_plot_data:utilityNotification_timeline_plot_data
    }

    console.log("vizData:",vizData);

    // Set the visualizer template
    pm.visualizer.set(template, vizData);

}

// function to provide data for utilityNotification vs billing cycles stacked plot for particular delivery mode
function get_utilityNotification_per_BC_plot_data(){

    /*
        utilityNotification_per_BC_plot_data={
            data:{
                labels:[], // billing cycles for the utility will be the X-axis lables
                datasets:[
                    // datasets={label:[],data:[],backgroundColor:""};
                    // datasets will contain different notification types data for particular delivery modes and for each X-axis label
                    // the length of datasets.data will be equal to X-axis labels length
                    // length of datasets will be equal to distinct number of utility notification types * 2 ;
                    {
                        lable:"", // name of the notification type
                        data:[], // count of notification types for particular delivery modes for each X-axis labels i.e for each BC
                        backgroundColor:"" // bar graph color for each notification type
                    }
                ] 
            }
        };


    */

    var utilityNotification_per_BC_plot_data={
        data:{
            labels:[],
            datasets:[]
        }
    };

    try{
        // json to identify status of notification type.
        var status_type={"GENERATED":"success","SCHEDULED":"success","RECEIVED":"success","QUEUED":"success","PRINTED":"success","SENT":"success","MAILED":"success","DELIVERED":"success","UNDELIVERED":"failed","FAILED":"failed","SOFT_BOUNCED":"failed","BOUNCED":"failed","REJECTED":"failed","SPAM":"failed","BLOCKED":"failed","REVOKED":"failed","STALE":"failed"};

        var BC_len=billing_cycles.length;
        var BC_index=0;
        var notificationType_dataset_map=new Map();
        var notification_list=response.notificationsList;
        var len=notification_list.length;

        //fill the labels for the plot
        while(BC_index<BC_len){
            // taking out BC start and date from billing_cycle list
            var BC_start_date=getDateFromTimestamp(billing_cycles[BC_index].key,false);
            var BC_end_date=getDateFromTimestamp(billing_cycles[BC_index].value,false);

            // populating data.labels if already not populated
            (utilityNotification_per_BC_plot_data.data.labels[BC_index]==undefined)?(utilityNotification_per_BC_plot_data.data.labels[BC_index]=BC_start_date+" to "+BC_end_date) : null;
            BC_index++;
        }

        var i=0;
        BC_index=BC_len-1;
        while(i<len && BC_index>=0){
            var data=notification_list[i];

            // if delivery mode == given delivery mode then we take the notification type into account
            if(data.deliveryMode!=deliveryMode){
                i++;
                continue;
            } 

            var notificationType=data.notificationType;
            var status=data.status;
            notificationType+=(" "+status_type[status]);

            // inserting notificationType into map so as to indentify the data.datasets for particular notification type.
            (!notificationType_dataset_map.has(notificationType)) ? (notificationType_dataset_map.set(notificationType,notificationType_dataset_map.size)) : null;

            (utilityNotification_per_BC_plot_data.data.datasets[notificationType_dataset_map.get(notificationType)]==undefined) ? (utilityNotification_per_BC_plot_data.data.datasets[notificationType_dataset_map.get(notificationType)]={label:notificationType,data:new Array(BC_len).fill(0),backgroundColor:getRandomColor()}) : null ;

            var generationTimestamp=data.generationTimestamp/1000;

            // console.log("i:",i);
            // console.log("BC_index:",BC_index);
            // console.log("notificationType:",notificationType);

            // if generationTimestamp falls in current BC timestamp range then insert data into output
            // else increament BC_index to get next BC ranges
            if(generationTimestamp>=billing_cycles[BC_index].key && generationTimestamp<billing_cycles[BC_index].value){
                utilityNotification_per_BC_plot_data.data.datasets[notificationType_dataset_map.get(notificationType)].data[BC_index]++;

                // increament i to get next set of notifications from the list.
                // console.log("increamented");
                i++;
            }else{
                if(billing_cycles[BC_len-1].value<=generationTimestamp && data.notificationType=="USER_WELCOME") i++;
                else BC_index--;
            }
                
        }


    }catch (e) {
        console.error(e);
        throw Error(e);
    }
    // console.log("utilityNotification_per_BC_plot_data:",utilityNotification_per_BC_plot_data);
    return utilityNotification_per_BC_plot_data;

}

// function to provide data for utilityNotification vs timeline stacked plot for particular delivery Modes
function get_utilityNotification_timeline_plot_data(){

    /*
        utilityNotification_timeline_plot_data={
            data:{
                labels:[], // contains different dates for which notification types have been sent or failed for the utility for particular delivery mode
                datasets:[
                    {
                        label:"", // label for each notification type for the utility
                        data:[], // data for the notification type for each X-axis dates for particular delivery modes
                        backgroundColor:"" // background color for each notification type
                    }
                ] // data.datasets length will be equal to types of notification types for delivery mode * 2 (sent + failed)
            }
        }

    */

    var utilityNotification_timeline_plot_data={
        data:{
            labels:[],
            datasets:[]
        }
    };

    try{
        // notification status types and their status as failed or success
        var status_type={"GENERATED":"success","SCHEDULED":"success","RECEIVED":"success","QUEUED":"success","PRINTED":"success","SENT":"success","MAILED":"success","DELIVERED":"success","UNDELIVERED":"failed","FAILED":"failed","SOFT_BOUNCED":"failed","BOUNCED":"failed","REJECTED":"failed","SPAM":"failed","BLOCKED":"failed","REVOKED":"failed","STALE":"failed"};

        // populate X-axis lables that is data.labels

        var notification_list=response.notificationsList;
        var notifications_len=notification_list.length;
        var date_index_map=new Map();
        for(var i=notifications_len-1;i>=0;i--){
            var timestamp=notification_list[i].generationTimestamp;
            var date=getDateFromTimestamp(timestamp,true);

            // put distinct date into map
            if(!date_index_map.has(date)){
                date_index_map.set(date,date_index_map.size);
                // put dictinct date into labels
                (utilityNotification_timeline_plot_data.data.labels[date_index_map.get(date)]=date);
            }
        }
        // populate datasets
        var labels_len=utilityNotification_timeline_plot_data.data.labels.length;
        var datasets_index_map=new Map();
        for(var i=0;i<notifications_len;i++){
            var data=notification_list[i];
            var date=getDateFromTimestamp(data.generationTimestamp,true);
            var notification_type=data.notificationType;
            var status=data.status;
            var datasets_index_key=notification_type+" "+status_type[status];

            if(!datasets_index_map.has(datasets_index_key)){
                datasets_index_map.set(datasets_index_key,datasets_index_map.size);
                // initialize datasets for the newly inserted datasets_index_key
                utilityNotification_timeline_plot_data.data.datasets[datasets_index_map.get(datasets_index_key)]={
                    label:datasets_index_key,
                    data:new Array(labels_len).fill(0),
                    backgroundColor:getRandomColor()
                }
            }

            // populate datasets
            utilityNotification_timeline_plot_data.data.datasets[datasets_index_map.get(datasets_index_key)].data[date_index_map.get(date)]++;

        }
        
    }catch (e) {
        console.error(e);
        throw Error(e);
    }
    
    return utilityNotification_timeline_plot_data;

}




// function to get date string from timestamp in secs
function getDateFromTimestamp(timestamp,isMilliSecs){
    try{
        var date=(isMilliSecs)? new Date((timestamp-19800)) : new Date((timestamp-19800)* 1000);
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
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// END OF PROGRAM