var url=pm.variables.get("url");
var uuid=pm.variables.get("uuid");
var locale=pm.variables.get("locale");
var accessToken=pm.variables.get("accessToken");

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
    console.log(appliance_name_mapping);
    pm.environment.set("appliance_name_mapping",appliance_name_mapping);
});