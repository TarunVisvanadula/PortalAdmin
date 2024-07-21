includeHeader();
includeMenu("Dashboard");
LoadDashBoard();
function LoadDashBoard() {
    require([
        "esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/portal/PortalQueryParams",
        "esri/request",
        //"dojox/grid/DataGrid",
        //"dojo/store/Memory", "dojo/_base/array",
        //"dojo/data/ObjectStore",
        "esri/config"
    ], function (Portal, OAuthInfo, esriId, PortalQueryParams, esriRequest,
        //DataGrid, Memory, array, ObjectStore
        esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);
            return;
        }
        var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
        if (sesstionItem.hostName != "")
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        var portalToken = sesstionItem.token;
        var UserList = [];
        var itemList = [];
        $(".lds-ring").css("display", "block");
        Config.portalUrl = sesstionItem.portalurl;
        var ItemqueryParams = {
            q: "orgid:" + sesstionItem.portalid,
            token: portalToken,
            f: "json",
            start: 1,
            num: 100
        };



        fetchAllItems();
        fetchAllfolders();

        var UserList = [];
        var UserParams = {
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            excludeSystemUsers: true
        };
        fetchAllUsers();
        function fetchAllUsers() { // fetch all users
            var url = Config.portalUrl + "/sharing/rest/portals/self/users";

            var options = {
                query: UserParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    var userlist = [];
                    $(".lds-ring").css("display", "none");
                    var users = response.data.users;
                    if (users.length != 0) {

                        for (var i = 0; i < users.length; i++) {

                            UserList.push(users[i]);
                        }
                        UserParams.start = UserList.length + 1;
                        fetchAllUsers()
                    }
                    else {
                        $(".user-count")[0].innerText = UserList.length;
                    }



                }).catch(function (err) {
                    console.log(err);
                });











            //var url = Config.portalUrl + "/sharing/rest/portals/self/users";
            //var queryParams = {
            //    token: portalToken,
            //    f: "json",
            //    t: "groups",
            //    excludeSystemUsers: true
            //};
            //var options = {
            //    query: queryParams,
            //    responseType: "json"
            //};
            //esriRequest(url, options)
            //    .then(function (response) {
            //        UserList = response.data.users;
            //        $(".user-count")[0].innerText = UserList.length;
            //    }).catch(function (err) {
            //        console.log(err);
            //    });
        };

        var groupscount = 0;
        var groupParams = {
            q: 'orgid:' + sesstionItem.portalid,
            token: portalToken,
            start: 1,
            num: 100,
            f: "json"
        };
        fetchAllGroups();
        function fetchAllGroups() {

            var options = {
                query: groupParams,
                responseType: "json",


            };
            esriRequest(Config.portalUrl + "/sharing/rest/community/groups", options)
                .then(function (response) {
                    if (response.data.results.length != 0) {
                        groupscount = groupscount + response.data.results.length;
                        groupParams.start = groupscount + 1;
                        fetchAllGroups();
                    }
                    else {
                        $(".Groups_count")[0].innerText = groupscount;
                    }

                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllItems() {
            var queryParams = {
                q: "orgid:" + sesstionItem.portalid,
                token: portalToken,
                f: "json",
                start: 1,
                num: 100
            };
            var options = {
                query: ItemqueryParams,
                responseType: "json",
                sortField: "numViews",
                sortOrder: "desc"
            };
            esriRequest(Config.portalUrl + "/sharing/rest/search", options)
                .then(function (response) {
                    itemList = response.data.results.concat(itemList)
                    if (response.data.results == 0) {
                        $(".Items_count")[0].innerText = itemList.length;
                        itemList = [];
                        $(".lds-ring").css("display", "none");
                    }
                    else {
                        ItemqueryParams.start = itemList.length + 1;
                        fetchAllItems();
                    }

                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllfolders() { // fetch all folders
            var url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username;
            var queryParams = {
                token: portalToken,
                f: "json",
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    $(".folder_count")[0].innerText = response.data.folders.length;
                }).catch(function (err) {
                    console.log(err);
                });
        };
        $(document).ready(function () {
            //$("#user_name")[0].innerText = sesstionItem.username;
            //$(".user_name1")[0].innerText = sesstionItem.username;
            setTimeout(function () {
                $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
                $("#sign-out").click(function () {
                    signOutCredentials(esriId);
                });
            }, 2000);
            var searchData = [];
            searchData = [
                //user search strings
                { label: "Create User", value: "../views/Users.html" },
                { label: "Edit User", value: "../views/Users.html" },
                { label: "Export Users to CSV", value: "../views/Users.html" },
                { label: "Export Users to JSON", value: "../views/Users.html" },
                { label: "Delete User", value: "../views/Users.html" },
                { label: "Import Users from CSV", value: "../views/Users.html" },
                { label: "Import Users from JSON", value: "../views/Users.html" },
                { label: "Update Users", value: "../views/Users.html" },
                { label: "Add tags to users", value: "../views/Users.html" },
                { label: "Remove tags from users", value: "../views/Users.html" },
                { label: "Delete pending Users", value: "../views/Users.html" },
                { label: "Delete User invitations", value: "../views/Users.html" },
                { label: "Add users to groups", value: "../views/Users.html" },
                { label: "Remove users from group", value: "../views/Users.html" },
                { label: "Bulk Update users", value: "../views/Users.html" },
                //item search strings
                { label: "Export items to CSV", value: "../views/Items.html" },
                { label: "Export items to JSON", value: "../views/Items.html" },
                { label: "Export Webmap services", value: "../views/Items.html" },
                { label: "Import Items from CSV", value: "../views/Items.html" },
                { label: "Import Items from JSON", value: "../views/Items.html" },
                { label: "Assign item owner", value: "../views/Items.html" },
                { label: "Add tags to items", value: "../views/Items.html" },
                { label: "Remove tags from items", value: "../views/Items.html" },
                { label: "Share items to groups", value: "../views/Items.html" },
                { label: "Unshare items from groups", value: "../views/Items.html" },
                { label: "Delete Items", value: "../views/Items.html" },
                { label: "Update Webmap Services", value: "../views/Items.html" },
                { label: "Enable/Disable Webmap popups", value: "../views/Items.html" },
                { label: "Update Item Sharing properties", value: "../views/Items.html" },
                { label: "Bulk Update Items", value: "../views/Items.html" },
                { label: "Update Items sync capabilities", value: "../views/Items.html" },
                //Groups Search string
                { label: "Create Group", value: "../views/Groups.html" },
                { label: "Edit Group", value: "../views/Groups.html" },
                { label: "Export Group to CSV", value: "../views/Groups.html" },
                { label: "Export Group to JSON", value: "../views/Groups.html" },
                { label: "Delete Group", value: "../views/Groups.html" },
                { label: "Import group from CSV", value: "../views/Groups.html" },
                { label: "Import group from JSON", value: "../views/Groups.html" },
                { label: "Update group", value: "../views/Groups.html" },
                { label: "Add tags to group", value: "../views/Groups.html" },
                { label: "Remove tags from group", value: "../views/Groups.html" },
                { label: "Delete pending Users", value: "../views/Groups.html" },
                { label: "Delete User invitations", value: "../views/Groups.html" },
                { label: "invite users to groups", value: "../views/Groups.html" },
                { label: "Uninvite users from group", value: "../views/Groups.html" },
                { label: "Add items to groups", value: "../views/Groups.html" },
                { label: "Remove items from group", value: "../views/Groups.html" },
                { label: "Bulk Update groups", value: "../views/Groups.html" },
                { label: "Assign group owner", value: "../views/Groups.html" },
                //folder search strings
                { label: "Create folder", value: "../views/Folders.html" },
                { label: "Edit folder", value: "../views/Folders.html" },
                { label: "Delete folder", value: "../views/Folders.html" },
                //migrate search strings
                { label: "Copy items to organization", value: "../views/CloneItems.html" },
                { label: "Copy users to  organization", value: "../views/CloneUsers.html" },
                { label: "Copy groups to organization", value: "../views/CloneGroups.html" },
                { label: "Copy roles to organization", value: "../views/CloneRoles.html" }
            ];
            $("#searchtags").autocomplete({
                source: searchData,
                minChars: 1,
                select: Navigate,
                change: Navigate
            });
            function Navigate(event, ui) {
                event.preventDefault();
                if (ui.item != null) {
                    console.log(ui.item.label);
                    localStorage.setItem("Pagenavigation", ui.item.label);
                    window.location.href = ui.item.value;
                }
            }
        });
        // document.getElementById("sign-out").addEventListener("click", function () {
        //$("#sign-out").click(function () {
        //    sessionStorage.setItem("Accesskey", 'Invalid token');
        //    signOutCredentials(esriId);
        //});


    });
}