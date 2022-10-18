// {{url}}/billingdata/users/{{uuid}}/homes/{{hid}}/billingcycles?t0={{t0}}&t1={{t1}}

var url=pm.variables.get("url");
var uuid=pm.variables.get("uuid");
var hid=pm.variables.get("hid");
var accessToken=pm.variables.get("accessToken");

// get the user billing cycles and set the value in the environment variable
// so as to use by the test script
var billing_cycles_url=url+"/billingdata/users/"+uuid+"/homes/"+hid+"/billingcycles";

pm.sendRequest({
    url: billing_cycles_url,
    method: 'GET',
    header: {
        'content-type': 'application/json',
        'authorization': "bearer "+ accessToken
    }
}, function (err, res) {

    var response=res.json();
    //console.log(response);
    var billing_cycles=response;
    //console.log("billing_cycles:",billing_cycles);
    pm.environment.set("billing_cycles",billing_cycles);

});