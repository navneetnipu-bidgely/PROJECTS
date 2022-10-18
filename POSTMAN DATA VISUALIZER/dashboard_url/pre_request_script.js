var url=pm.variables.get("url");
var pilotId=pm.variables.get("pilotId");
var uuid=pm.variables.get("uuid");
var access_token=pm.variables.get("accessToken");


user_hash_url=url+"/v2.0/user-auth/cipher?pilot-id="+pilotId+"&user-id="+uuid
pm.sendRequest({
    url: user_hash_url,
    method: 'GET',
    header: {
        'content-type': 'application/json',
        'authorization': "bearer "+ access_token
    }
}, function (err, res) {
    pm.environment.set("user_hash", res.json().payload);
});