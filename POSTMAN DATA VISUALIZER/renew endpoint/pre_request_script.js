/ {{url}}/v2.0/users/{{uuid}}/endpoints

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