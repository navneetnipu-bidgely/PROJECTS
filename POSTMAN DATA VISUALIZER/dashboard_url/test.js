var template = `
    <table bgcolor="#FFFFFF" border="2" >
        <tr >
            <th>UUID</th>
            <th>DASHBOARD URL</th>
        </tr>
        <tr>
            <td>{{uuid}}</td>
            <td><a href={{url}}>{{url}}</a></td>
        </tr>
    </table>
`;

var FE_url=pm.variables.get("FE_url");
var user_hash=pm.variables.get("user_hash");
var uuid=pm.variables.get("uuid");

var dashboard_url=FE_url+"/dashboard?user-hash="+user_hash;

var testpassed = true;

// test to check the basic required inputs.
pm.test("uuid persent!", function () {

    try {
        pm.expect(uuid.length).to.be.equal(36);
    } catch (e) {
        testpassed = false;
        console.error(e);
        throw Error(e);
    }

});

pm.test("FE_url persent and have correct regex!", function () {

    try {
        pm.expect(FE_url).to.be.a('string').and.not.be.empty;
        pm.expect(FE_url).to.include("https://");
        pm.expect(FE_url).to.include(".bidgely.com");
    } catch (e) {
        testpassed = false;
        console.error(e);
        throw Error(e);
    }

});

pm.test("user_hash persent!", function () {

    try {
        pm.expect(user_hash).to.be.a('string').and.not.be.empty;
    } catch (e) {
        testpassed = false;
        console.error(e);
        throw Error(e);
    }

});

if(testpassed){
    var response={
        "uuid": uuid,
        "url": dashboard_url
    };

    pm.visualizer.set(template,response);
}

// END OF PROGRAM