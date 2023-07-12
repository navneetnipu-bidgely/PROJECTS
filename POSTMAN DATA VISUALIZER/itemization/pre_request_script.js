// {{url}}/v2.0/users/{{uuid}}/endpoints

var url=pm.variables.get("url");
var uuid=pm.variables.get("uuid");
var locale=pm.variables.get("locale");
var accessToken=pm.variables.get("accessToken");

// get the user endpoint and set the value in the environment variable
// so as to use by the test script
var endpoint_url=url+"/v2.0/users/"+uuid+"/endpoints";

pm.sendRequest({
    url: endpoint_url,
    method: 'GET',
    header: {
        'content-type': 'application/json',
        'authorization': "bearer "+ accessToken
    }
}, function (err, res) {

    var response=res.json();
    //console.log(response);
    var endpointId=response.payload[0].endpointId;
    //console.log("endpointId:",endpointId);
    pm.environment.set("endpointId",endpointId);

});

// get the appliance name mapping and set it in environment variables 
// so as to use by the test script
var appliance_name_mapping=url+"/v2.0/dashboard/users/"+uuid+"/appliance-name-mapping?locale="+locale;

pm.sendRequest({
    url: appliance_name_mapping,
    method: 'GET',
    header: {   
        'content-type': 'application/json',
        'authorization': "bearer "+ accessToken
    }
}, function (err, res) {
    var response=res.json();
    var appliance_name_mapping=response["payload"];
    //console.log("appliance_name_mapping:",appliance_name_mapping);
    pm.environment.set("appliance_name_mapping",appliance_name_mapping);
});