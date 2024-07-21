
require([
    "esri/portal/Portal",
    //"esri/arcgis/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/portal/PortalQueryParams",
    "esri/request", "dojox/grid/DataGrid",
    "dojo/store/Memory", "dojo/_base/array",
    "dojo/data/ObjectStore"
], function (Portal, OAuthInfo, esriId, PortalQueryParams, esriRequest, DataGrid, Memory, array, ObjectStore) {
    var personalPanelElement = document.getElementById("personalizedPanel");
    var anonPanelElement = document.getElementById("anonymousPanel");
    //var userIdElement = document.getElementById("userId");
    var v_portalurl = "https://spatial1090.maps.arcgis.com/"; /*"https://gis3.smartgeoapps.com/portal";*/
    var v_usersSearch_url = "/sharing/rest/portals/self/users";
    var v_itemsSearch_url = "/sharing/rest/search";
    var v_foldersSearch_url = "/sharing/rest/portals/self/folders";
    var v_portalAppID = "c6Ot4U42gORrjnHj"; /*SGhJthgfQbolHscw*/
    var v_credObj = null;
    var v_portal = null;
    var v_portalUser = null;

    var info = new OAuthInfo({
        // Swap this ID out with registered application ID
        appId: v_portalAppID,
        // Uncomment the next line and update if using your own portal
        portalUrl: v_portalurl,
        // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
        // authNamespace: "portal_oauth_inline",
        popup: false
    });
    esriId.registerOAuthInfos([info]);
    esriId.checkSignInStatus(info.portalUrl + "/sharing")
        .then(function (cred) {
            v_credObj = cred;
            //var portal = new Portal(); // Optionally, specify the url instead of the default www.arcgis.com
            let portal = new Portal({
                url: v_portalurl // First instance
            });
            // Setting authMode to immediate signs the user in once loaded
            portal.authMode = "immediate";
            console.log("User Signed in");
            //once the portal loads update the global variables
            portal.load().then(function (portalObj) {
                //userIdElement.innerHTML = portal.user.username;
                anonPanelElement.style.display = "none";
                personalPanelElement.style.display = "block";
                v_portal = portalObj;
            });

            displayItems();
        })
        .catch(function () {
            // Anonymous view
            anonPanelElement.style.display = "block";
            personalPanelElement.style.display = "none";
        });

    document.getElementById("sign-in").addEventListener("click", function () {
            // user will be redirected to OAuth Sign In page
            esriId.getCredential(info.portalUrl + "/sharing");
        });

    document.getElementById("sign-out").addEventListener("click", function () {
            esriId.destroyCredentials();
            window.location.reload();
        });

    function displayItems() {

        //var portal = new Portal(); // Optionally, specify the url instead of the default www.arcgis.com
        let portal = new Portal({
            url: v_portalurl // First instance
        });
        //var portalUser = portal.user;
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = "immediate";
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            var queryParams = new PortalQueryParams({
                query: "owner:" + portal.user.username,
                sortField: "numViews",
                sortOrder: "desc",
                num: 20
            });
            // Query the items based on the queryParams created from portal above
            //portal.user.fetchFolders().then(loadFolders);
            portal.user.fetchGroups().then(loadGroups);
            portal.queryItems(queryParams).then(createGallery);
            var url = v_portalurl + v_usersSearch_url;
            var queryParams = {
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options).then(loadUsers);          
                   // console.log("response: ", response);
            //var url = v_portalurl + v_foldersSearch_url;
            //var queryParams = {
            //    f: "json"
            //};
            //var options = {
            //    query: queryParams,
            //    responseType: "json"
            //};
            //esriRequest(url, options).then(loadUsers);    
        });
    }
    function loadGroups(groups) {
        var markup1 = "";
        //console.log(groups);
        array.forEach(groups, function (group) {
            var title = group.title;
            var id = "collapse_" + group.title;
            //var child = document.createElement('div');
            //child.id = group.id;
            //child.innerHTML = "<span><h2>" + title + "</h2></span>";
            //dom.byId("groupGallery").appendChild(child);
            markup1 += '<div class="card"> <div class="card-header">' +
                '<a class="collapsed card-link" data-toggle="collapse" href =#' + id +
                '>' + title + ' </a> </div >';
            markup1 += '<div id=' + id + ' class="collapse" data-parent="#groupsaccordion" >'
                      + '</div ></div >';

            var queryParams = {
                q: "owner:" + group.owner,
                sortField: "numViews",
                sortOrder: "desc",
                id: id,
                num: 20
            };
            //group.getItems().then(loadGroupItems);
            group.queryItems(queryParams).then(loadGroupItems);          
            //var linebreak = document.createElement("br");
            //dom.byId("groupGallery").appendChild(linebreak);
        });
        $("#groupsaccordion").append(markup1);
    }
    function loadGroupItems(items) {
        var htmlStr = "";
        var groupid = items.queryParams.id;
       // var child = document.createElement('div');
        array.forEach(items.results, function (item) {
         //   groupItems.push(item);
            htmlStr += (
                "<div class=\"esri-item-container  card-body\">" +
                (
                    item.thumbnailUrl ?
                        "<div class=\"esri-image\" style=\"background-image:url(" + item.thumbnailUrl + ");\"></div>" :
                        "<div class=\"esri-image esri-null-image\">Thumbnail not available</div>"
                ) +
                (
                    item.title ?
                        "<div class=\"esri-title\">" + (item.title || "") + "</div>" :
                        "<div class=\"esri-title esri-null-title\">Title not available</div>"
                ) +
                "</div>"
            );
        });
       // child.innerHTML = htmlStr;
        $("#" + groupid).append(htmlStr);
    }
    function loadFolders(folders) {
        // console.log(folders);
        var markup = "";
        array.forEach(folders, function (folder) {
            var title = folder.title;
            // var id = folder.id;
            var id = "collapse_" + folder.title;
            markup += '<div class="card"> <div class="card-header">' +
                    '<a class="collapsed card-link" data-toggle="collapse" href =#' + id +
                    '>' + title + ' </a> </div >';
            markup += '<div id=' + id + ' class="collapse" data-parent="#foldersaccordion" >'
                + '<div class="card-body">.....</div></div ></div >';
            //folder.fetchItems().then(loadFolderItems);
            var queryParams = {
                q: "owner:" + folder.username,
                sortField: "numViews",
                sortOrder: "desc",
                id: folder.id,
                num: 20
            };
            //folder.getItems().then(loadGroupItems);
            //folder.portal.queryItems(queryParams).then(loadFolderItems);
           });
        $("#foldersaccordion").append(markup);
    }
    function loadFolderItems(items) {
        // folderItems.push(items);
        var htmlStr = "";
        var folderid = items[0].folderId;
        var child = document.createElement('div');
        array.forEach(items, function (item) {
            //folderItems.push(item);
            htmlStr += (
                "<div class=\"esri-item-container\">" +
                (
                    item.thumbnailUrl ?
                        "<div class=\"esri-image\" style=\"background-image:url(" + item.thumbnailUrl + ");\"></div>" :
                        "<div class=\"esri-image esri-null-image\">Thumbnail not available</div>"
                ) +
                (
                    item.title ?
                        "<div class=\"esri-title\">" + (item.title || "") + "</div>" :
                        "<div class=\"esri-title esri-null-title\">Title not available</div>"
                ) +
                "</div>"
            );
        });

        child.innerHTML = htmlStr;
        dom.byId(folderid).appendChild(child);
    }

   
    function createGallery(items) {
        var htmlFragment = "";
        var markup = "";
        var tableBody = $("#itemTable tbody"); 
        tableBody.empty();   // clear content in table
        //console.log(items);
        items.results.forEach(function (item) {
            htmlFragment += '<div class="esri-item-container">' + (item.thumbnailUrl ? '<div class="esri-image" style="background-image:url('
                             + item.thumbnailUrl +');"></div>' : '<div class="esri-image esri-null-image">Thumbnail not available</div>') +
                (item.title ? '<div class="esri-title">' + (item.title || "") + "</div>" : '<div class="esri-title esri-null-title">Title not available</div>') + "</div>";
            markup = "<tr><td>" + item.title + "</td><td>" + item.type + "</td><td>"
                + item.access + "</td> <td>"+ item.owner +"</td><td>" + item.created.toLocaleDateString() + "</td><td>"+item.modified.toLocaleDateString() +"</td></tr > ";

            tableBody.append(markup);
        });
        document.getElementById("itemGallery").innerHTML = htmlFragment;
      //  $("#itemGallery").DataTable();
        var table = $('#itemTable').DataTable({
            lengthChange: false,
            buttons: ['copy', 'excel', 'pdf', 'colvis']
        });
        table.buttons().container().appendTo('#itemTable_wrapper .col-md-6:eq(0)');
    }
    function loadUsers(results) {
        var markup = "";
        var tableBody = $("#usersTable tbody");
        tableBody.empty();   // clear content in table
        results.data.users.forEach(function (user) {
            markup = "<tr><td>" + user.username + "</td><td>" + user.firstName + "</td><td>" + user.lastName + "</td> <td>"
                + user.fullName + "</td> <td>" + user.email + "</td><td>" + new Date(user.created).toLocaleDateString() + "</td><td>"
                + user.access + "</td> <td>" + user.level + "</td><td>" + user.role + "</td><td>"
                + new Date(user.lastLogin).toLocaleDateString() + "</td></tr > ";
            tableBody.append(markup);
        });
        var table2 = $('#usersTable').DataTable({
            lengthChange: true,
            buttons: ['copy', 'excel', 'pdf', 'colvis']
        });
        table2.buttons().container().appendTo('#usersTable_wrapper .col-md-6:eq(0)');
    }
    
});



