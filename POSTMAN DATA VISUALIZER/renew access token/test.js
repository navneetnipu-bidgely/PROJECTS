var testpassed=false;
pm.test("response must be valid and have a body with access_token having expire time >3600 secs", function () {
    pm.response.to.be.ok;
    pm.response.to.be.withBody;
    pm.response.to.be.json;
    const response=pm.response.json();
    console.log(response);
    pm.expect(response.token_type).to.be.eqls("bearer");
    pm.expect(response.expires_in).to.be.greaterThan(3600);
    pm.expect(response.scope).to.be.eqls("all");
    testpassed=true;
});
if(testpassed){
    const response=pm.response.json();
    var access_token=response.access_token;
    console.log("accessToken",access_token);
    pm.environment.set("accessToken",access_token);
}