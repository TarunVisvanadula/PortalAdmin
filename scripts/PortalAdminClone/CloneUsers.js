var source_Users = [];
var target_Users = [];
var selectedusers = [];
//var commonutils = new CommonUtils();
includeHeader();
includeMenu("Copy Users to Organization");
var clickflag = true;
var migrateflag = true; var searchflag = false;
var migrateAdminUsers = []
var duplicateusers = []; var rolesData = []; var ActionType = ''; var AccountType = '';
if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
    window.location.href = "../views/PortalAdmin.html";
}
var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));

$(document).ready(function () {
    require(["esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/request",
        "dojo/_base/array",
        "esri/config",
        "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, array, esriConfig) {
        $("#personalizedPanel").css("display", "block");
        var v_portalurl = Config.portalUrl = sesstionItem.portalurl;
        // if (sesstionItem.hostName != "")
        //if (sesstionItem.PKIandIWFLogin || sesstionItem.PKIandIWFLogin == "true")
        esriConfig.request.trustedServers.push("http://localhost:2015");

        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        fetchAllRoles();
        var url = Config.portalUrl + "/sharing/rest/portals/self/users";
        var queryParams = {
            excludeSystemUsers: true,
            f: "json",
            token: sesstionItem.token
        };
        $(".lds-ring").css("display", "block");
        // $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
        var options = {
            query: queryParams,
            responseType: "json"
        };
        esriRequest(url, options).then(loadsourceUsers);

        // document.getElementById("sign-out").addEventListener("click", function () {
        setTimeout(function () {
            $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
            $("#sign-out").click(function () {
                signOutCredentials(esriId);
            });
        }, 2000);
        //$("#sign-out").click(function () {
        //    signOutCredentials(esriId);
        //});
        $(".breadcrumb_Home").click(function () {

            window.location.reload();
        });
        function fetchAllRoles() { // fetch all roles
            var url = Config.portalUrl + "/sharing/rest/portals/self/roles";
            var queryParams = {
                returnPrivileges: true,
                token: sesstionItem.token,
                f: "json"
            };

            rolesData = [
                {
                    name: "Administrator",
                    id: "org_admin"
                },
                {
                    name: "Publisher",
                    id: "org_publisher"
                },
                {
                    name: "User",
                    id: "org_user"
                }
            ];


            var options = {
                query: queryParams,
                responseType: "json"

            };
            esriRequest(url, options)
                .then(function (response) {
                    rolesData = response.data.roles.concat(rolesData);


                }).catch(function (err) {
                    console.log(err);
                });
        };
        $("#search").keydown(function (event) {
            searchflag = true;
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#sourceUsers").jsGrid("search", { UserName: uname, UserType: uname, Role: uname, Access: uname }).done(function () { });
            }
            else {
                $("#sourceUsers").jsGrid("clearFilter").done(function () { });
            }
        });
        function loadsourceUsers(users) {
            source_Users = [];
            var UsersData = [];
            var rolesinfo = [{ name: "Select", id: "" }]
            for (var i = 0; i < rolesData.length; i++) {
                rolesinfo.push({ name: rolesData[i].name, id: rolesData[i].name });
            }
            var DateField = function (config) {
                jsGrid.Field.call(this, config);
            };
            DateField.prototype = new jsGrid.Field({
                filterTemplate: function () {
                    var now = new Date();
                    this._fromPicker = $("<input>").datepicker({
                        dateFormat: "dd/mm/yy",
                        changeMonth: true,
                        changeYear: true, 
                        defaultDate: now,
                        //onSelect: function () {
                        //    $("#sourceItems").jsGrid("loadData");
                        //}
                    }).attr('placeholder', 'Select Date');
                    return $("<div>").append(this._fromPicker);
                },
                filterValue: function () {
                    return {
                        from: this._fromPicker.datepicker("getDate")
                    };
                }
            });
            jsGrid.fields.date = DateField;

            array.forEach(users.data.users, function (user) {
                source_Users.push(user);
                // console.log(user);
                var createddate = user.created;
                var modifieddate = user.modified;
                var rolename = '';
                for (var i = 0; i < rolesData.length; i++) {
                    if (rolesData[i].id == user.role) {
                        rolename = rolesData[i].name;
                    }
                }
                var UserObj = {
                    Select: user.username,
                    Username: user.username,
                    Access: user.access,
                    UserType: user.userType,
                    Level: user.level,
                    Role: rolename, //user.role,
                    // Description: user.description,
                    CreatedOn: user.created,
                    ModifiedOn: user.modified,
                };
                UsersData.push(UserObj);
            });

            $("#sourceUsers").jsGrid({
                width: "100%",
                height: "auto",
                filtering: true,
                sorting: true,
                paging: true,
                pageSize: $("#pageSize").value,
                data: UsersData,
                controller: {
                    data: UsersData,
                    loadData: function (filter) {
                        selected_Users = [];
                        $(".first-next").addClass("disbaleClass");
                      
                        if (searchflag == false) {
                            return $.grep(this.data, function (item) {

                                return ((!filter.Username || item.Username.toUpperCase().indexOf(filter.Username.toUpperCase()) >= 0)
                                    && (!filter.UserType || item.UserType.toUpperCase().indexOf(filter.UserType.toUpperCase()) >= 0)
                                    && (!filter.Role || item.Role.toUpperCase().indexOf(filter.Role.toUpperCase()) >= 0)
                                    && (!filter.Level || item.Level.toUpperCase().indexOf(filter.Level.toUpperCase()) >= 0)
                                    && (!filter.CreatedOn.from || new Date(item.CreatedOn).toDateString() == filter.CreatedOn.from.toDateString())
                                    && (!filter.ModifiedOn.from || new Date(item.ModifiedOn).toDateString() == filter.ModifiedOn.from.toDateString())
                                    && (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0));
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return ((!filter.UserName || item.Username.toUpperCase().indexOf(filter.UserName.toUpperCase()) >= 0)
                                    || (!filter.UserType || item.UserType.toUpperCase().indexOf(filter.UserType.toUpperCase()) >= 0)
                                    || (!filter.Role || item.Role.toUpperCase().indexOf(filter.Role.toUpperCase()) >= 0)
                                    || (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0));
                            });
                        }
                    },
                },
                onPageChanged: function (args) {
                    $('#selectAllCheckbox').prop('checked', false);
                    $(".first-next").addClass("disbaleClass");
                },
                fields: [
                    {
                        name: "Select",
                        width: 30,

                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllCheckbox")
                                .on("change", function () {

                                    selectedusers = [];
                                    if (this.checked) { // check select status
                                        $('.singleCheckbox').each(function () {
                                            this.checked = true;
                                            selectItem($(this)[0].id);
                                        });
                                    } else {


                                        $('.singleCheckbox').each(function () {
                                            this.checked = false;
                                            unselectItem($(this)[0].id);
                                        });
                                        selectedusers = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select)
                                .prop("checked", $.inArray(item.Username, selectedusers) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });

                        },
                        sorting: false,
                        filtering: false,
                    },
                    {
                        name: "Username", title: "User Name", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Username).text(item.Username)
                        }
                    },
                    {
                        // name: "UserType", title: "User Type", align: "center"
                        name: "UserType", type: "select", items: [{ name: "Select", id: "" }, { name: "arcgisonly", id: "arcgisonly" }, { name: "both", id: "both" }], valueField: "id", textField: "name", title: "User Type", align: "left", visible: true

                    },
                    {
                        name: "Access", type: "select", items: [{ name: "Select", id: "" }, { name: "Public", id: "Public" }, { name: "Private", id: "Private" }, { name: "Shared", id: "Shared" }, { name: "Org", id: "Org" }], valueField: "id", textField: "name", title: "Access", align: "left", visible: true,
                        itemTemplate: function (_, item) {
                            var itemclassName = "badge-success";
                            if (item.Access == "private")
                                itemclassName = "badge-secondary";
                            if (item.Access == "shared")
                                itemclassName = "badge-warning";
                            if (item.Access == "org")
                                itemclassName = "badge-primary";
                            return '<span class="badge ' + itemclassName + ' p - 1 mb - 3">' + item.Access + '</span>';

                        }
                    },
                    { name: "Level", title: "Level", type: "text", align: "left", visible: true },
                    {
                        name: "Role", type: "select", items: rolesinfo, valueField: "id", textField: "name", title: "Role", align: "left", visible: true
                    },

                    {
                        name: "CreatedOn", type: "date", title: "Created Date",align:"center",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    },
                    {
                        name: "ModifiedOn", type: "date", title: "Modified Date", align: "center",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    }, {
                        type: "control", width: 60, visible: true,
                        editButton: false, deleteButton: false,
                        headerTemplate: function (e) {
                            return $("<span>")
                        },
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", "").text("-")
                        }
                    }
                ]
            });

            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");

            v_user = 'Current User: ' + sesstionItem.username;
            //$('#source_user').text(v_user);
            $(".page_size").css("display", "inline-block");
            $(".first-next").addClass("disbaleClass");
            $("#pageSize").on('change', function (event) {
                $("#sourceUsers").jsGrid("option", "pageSize", this.value);
            });
            var selectItem = function (item) {
                selectedusers.push(item);
                $(".first-next").removeClass("disbaleClass");
                if (selectedusers.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {

                selectedusers = $.grep(selectedusers, function (i) {
                    return i !== item;
                });
                $(".first-next").removeClass("disbaleClass");
                if (selectedusers.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if (selectedusers.length == 0) {
                    $('#selectAllCheckbox').attr('checked', false);
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            $(".lds-ring").css("display", "none");
        }

    });

    $("#Targetarcgisonline").click(function () {
        migrateflag = true;
        AccountType = "Arcgisonline";
        loadTargetPortal();
        if (AccountType == "Arcgisonline") {
            ActionType = "ArcgisToArcgisonline"
        }
        else {
            // ActionType="ArcgisToPortal";
            ActionType = "PortalToArcgis";
        }
    })
    $("#Targetportal").click(function () {
        migrateflag = true;
        AccountType = "PortalforArcgis"
        loadTargetPortal();
        if (sesstionItem.type == "PortalforArcgis") {
            ActionType = "PortalToPortal"
        }
        else {
            //ActionType = "PortalToArcgis";
            ActionType = "ArcgisToPortal"
        }
    })

    function loadTargetPortal() {
        var TargetToken;
        var v_tarToken;
        var v_tarusername;
        require(["esri/portal/Portal", "esri/identity/OAuthInfo",
            "esri/identity/IdentityManager", "esri/request", "dojo/promise/all",
            "dojo/_base/array", "esri/config", "dojo/domReady!"
        ], function (Portal, OAuthInfo, esriId, esriRequest, all, array, esriConfig) {
            // var v_portalurl = Config.portalUrl;
            $("#LoginforPortal").prop("disabled", false);
            clickflag = true;

            if (AccountType == "PortalforArcgis") {
            }
            if (AccountType == "Arcgisonline") {
                v_portalurl = Config.arcGisOnline; // "https://www.arcgis.com";
                var appIdJson = esriId;
                var esriJSAPIOAuth = sessionStorage.esriJSAPIOAuth;
                sessionStorage.setItem("esriJSAPIOAuthBackup", esriJSAPIOAuth);
                sessionStorage.setItem("esriIdBackup", JSON.stringify(appIdJson));
                esriId.destroyCredentials();
                localStorage.removeItem("esriJSAPIOAuth");// when user selects remember me option preventing auto login for destination portal
                sessionStorage.removeItem("esriJSAPIOAuth");
                var info2 = new OAuthInfo({
                    appId: Config.appId,
                    popup: true
                });
                esriId.registerOAuthInfos([info2]);
                esriId.getCredential(info2.portalUrl + "/sharing", {
                    oAuthPopupConfirmation: false
                }).then(
                    function (cred) {
                        TargetToken = cred.token;
                        displayTargetItems(cred);
                    })
                    .catch(function (e) {
                        console.log(e);
                        if (e.message != "ABORTED") {
                            AlertMessages("Signin Arcgis Online", "Failed to login target portal", "danger");
                            return
                        }
                    });
            }
            //document.getElementById("LoginforPortal").addEventListener("click", function () {
            $("#LoginforPortal").click(function () {
                if (clickflag) {
                    clickflag = false;
                    var LoginMode = $(".tabs-container .active")[0].id;
                    var portalurl = $("#portalurl").val();
                    v_portalurl = portalurl;
                    $("#LoginforPortal").prop("disabled", true);
                    //  GenerateTokenForPortal();
                    if (LoginMode == "LoginMode2")
                        LoginWithAppID(portalurl);
                    else {
                        GenerateTokenForPortal();
                    }
                }
            });
            $("#ReturnHome").click(function () {
                window.location.reload();
            })
            function LoginWithAppID(portalurl) {
                var url = portalurl + "/sharing";
                esriId.destroyCredentials();
                var AppId = $("#appid")[0].value;
                if (AppId == "") {
                    AlertMessages("Signin Portal for ArcGIS", "Please enter AppId ", "danger");
                    return;
                }
                require([
                    "esri/portal/Portal", "esri/identity/OAuthInfo", "esri/identity/IdentityManager"
                ], function (Portal, OAuthInfo, esriId
                ) {
                    $(".close_modal").click();
                    var info1 = new OAuthInfo({
                        appId: AppId,
                        portalUrl: portalurl,
                        popup: true
                        //popupCallbackUrl:"oauth-callback.html"
                    });
                    var portalInfo = {
                        appId: AppId,
                        portalUrl: portalurl
                    };
                    sessionStorage.setItem("DestinationportalInfo", JSON.stringify(portalInfo));
                    esriId.registerOAuthInfos([info1]);
                    esriId.checkSignInStatus(info1.portalUrl + "/sharing").then(
                        function (cred) {
                            displayTargetItems(cred);
                        }
                    ).catch(
                        function (ee) {
                            esriId.getCredential(info1.portalUrl + "/sharing", {
                                oAuthPopupConfirmation: !1
                            }).then(
                                function (cred) {

                                    displayTargetItems(cred);
                                })
                                .catch(function (e) {
                                    console.log(e);
                                    if (e.message != "ABORTED") {
                                        AlertMessages("Signin Arcgis Online", "Failed to login target portal", "danger");
                                        return
                                    }
                                });

                        }
                    );
                });


            };
            function GenerateTokenForPortal() {
                var username = $("#defaultForm-username").val();
                var password = $("#defaultForm-password").val();
                var portalurl = $("#portalurl").val();
                var LoginMode = $(".tabs-container .active")[0].id;
                if (LoginMode == "LoginMode1") {
                    if (username == "" || password == "" || portalurl == "") {
                        AlertMessagesinclone("signIn Portal for Arcgis", "Please enter login details", 'danger');
                        clickflag = true;
                        return;
                    }
                }
                else {
                    if (portalurl == "") {
                        AlertMessagesinclone("signIn Portal for Arcgis", "Please enter portal url", 'danger');
                        clickflag = true;
                        return;
                    }
                    var hostname = portalurl.split('/');
                    var domain = "";
                    if (hostname.length > 0) {
                        domain = hostname[0] + "//" + hostname[2];
                        esriConfig.request.trustedServers.push(domain);
                    }
                }
                var options = {
                    query: {
                        f: 'json',
                        client: 'referer',
                        referer: Config.referer,
                        expiration: '360',
                        username: (LoginMode == "LoginMode1") ? username : '',
                        password: (LoginMode == "LoginMode1") ? password : ''
                    },
                    responseType: "json",
                    method: "post"

                };
                esriRequest(portalurl + "/sharing/rest/generateToken", options)
                    .then(function (response) {
                        if (LoginMode != "LoginMode1") {
                            var response = (typeof (response) == "string") ? JSON.parse(response) : response;
                            if (typeof (response.error) != "undefined") {
                                AlertMessages("PKI or IWA Login", response.error.message + "(portal is not configured for PKI or IWA login)", "danger");
                                return;
                            }
                        }
                        v_portalurl = portalurl;
                        $(".close_modal").click();
                        console.log(response);
                        displayTargetItems(response)

                    }).catch(function (err) {
                        if (err.message != "Failed to fetch") {
                            var msg = err.message + err.details.messages
                        }
                        else {
                            var msg = err.message;
                        }
                        AlertMessages("Signin Portal for Arcgis", msg, "danger");
                        $("#LoginforPortal").removeClass("disbaleClass");
                        $("#LoginforPortal").prop("disabled", false);
                        clickflag = true;
                        console.log(err);
                        return;
                    });
            };
            function displayTargetItems(cred) {
                let portal = new Portal({
                    url: v_portalurl,
                    token: (typeof (cred.data) != "undefined") ? cred.data.token : cred.token
                    //token: (AccountType == "PortalforArcgis") ? cred.data.token : cred.token
                });
                $('#sel_Users').empty();
                v_tarToken = (typeof (cred.data) != "undefined") ? cred.data.token : cred.token;
                //v_tarToken = (AccountType == "PortalforArcgis") ? cred.data.token : cred.token;
                portal.load().then(function (portalObj) {
                    v_portal = portalObj;
                    esriId.initialize(appIdJson);
                    AlertMessages("Signin portal", "Successfully signed target portal", "success");
                    sessionStorage.setItem("esriJSAPIOAuth", esriJSAPIOAuth);
                    //v_tarusername = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;
                    // v_tarusername = (AccountType == "PortalforArcgis") ? $("#defaultForm-username").val() : portal.user.username;
                    if (AccountType == "PortalforArcgis") {
                        var LoginMode = $(".tabs-container .active")[0].id;
                        if (LoginMode == "LoginMode1")
                            v_tarusername = $("#defaultForm-username").val()
                        else
                            v_tarusername = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;
                    }
                    else
                        v_tarusername = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;



                    loadSelectedUsers();
                    $("#login-done").click();
                });
            }
            function loadSelectedUsers() {

                for (var i = 0; i < selectedusers.length; i++) {
                    var username = selectedusers[i];

                    source_Users.forEach(function (user) {
                        if (user.username == username) {

                            var htmlContent = '<div class="dt-widget__item">' +
                                '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                                '<div class="dt-widget__info text-truncate">' +
                                '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + user.username + '</a>'
                            $('#sel_Users').append(htmlContent);
                        }
                    });
                }
                $(".itemCount")[0].innerText = selectedusers.length;
            }

            $('#migrate-btn').click(function (evt) {
                if (migrateflag) {
                    migrateflag = false;
                    // document.getElementById("update-users").addEventListener("click", function () {
                    $("#update-users").click(function () {
                        $("#migrate-complete")[0].style.display = "none";
                        $("#migrate-success")[0].style.display = "none";
                        $("#migrate-success").css("display", "none");
                        $("#loader")[0].style.display = "";
                        // MigtateusersToportal(selectedusers)
                        completeUser_migration(selectedusers);
                    });

                    // document.getElementById("no-update-req").addEventListener("click", function () {
                    $("#no-update-req").click(function () {
                        $("#migrate-complete")[0].style.display = "block";
                        $("#migrate-success")[0].style.display = "none";
                        $("#migrate-success").css("display", "none");
                        duplicateusers = [];//requested
                        completeUser_migration(selectedusers);
                    });
                    migrateUsers(selectedusers);
                    evt.preventDefault();

                }
            });




            function ValidateduplicateUsername(selected_Users) {
                $("#groups-update").empty();
                $("#migrate-success")[0].style.display = "none";
                $("#migrate-success").css("display", "none");
                duplicateusers = [];
                var v_url = v_portalurl + "/sharing/rest/community/checkUsernames";
                var queryParams = {
                    token: v_tarToken,
                    usernames: selected_Users.join(","),
                    f: "json"
                };
                var options = {
                    query: queryParams,
                    responseType: "json"
                };
                esriRequest(v_url, options)
                    .then(function (response) {
                        $("#groups-update").empty();
                        var usernames = response.data.usernames;
                        for (var i = 0; i < usernames.length; i++) {
                            if (usernames[i].requested != usernames[i].suggested) {
                                duplicateusers.push(usernames[i]);
                                var markup = '<div class="alert alert-info"><strong>' + usernames[i].requested + '</strong> user Already Exists.Do you want to create user with <strong>' + usernames[i].suggested + '</strong></div>';
                                $("#groups-update").append(markup);
                            }
                        }

                        if (duplicateusers.length > 0) {
                            $("#migrate-complete")[0].style.display = "block";
                            $("#loader")[0].style.display = "none";
                        }
                        else {
                            duplicateusers = [];
                           completeUser_migration(selectedusers);
                           // MigtateusersToportal(selectedusers);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        AlertMessages("Validate username", err.message, "danger");
                        return;
                    });
            };


            function migrateUsers(selected_Users) {
                //var v_url = v_portalurl + "/sharing/rest/portals/self/invite";
                if (selected_Users.length == 0) {
                    alert("Please select user");
                    return;
                }
                // completeUser_migration(v_url, selected_Users);
                ValidateduplicateUsername(selectedusers);

            }
            function MigtateusersToportal(selected_Users) {

                // var v_url = v_portalurl + "/" + v_tarusername + "/security/users/createUser";
                var v_url = v_portalurl + "/portaladmin/security/users/createUser";
                var d = new Date();
                var n = d.getTime();
                var useroptions = {
                    username: selected_Users[0] + n,
                    password: "Test@2020",
                    firstname: "test",
                    lastname: "123",
                    email: "tarun.vis@ispatialtec.com",
                    role: 'org_user',//account_admin,
                    // level: '2',
                    provider: 'arcgis',
                    userLicenseType: "creatorUT",
                    f: 'json',
                    token: v_tarToken
                }

                $.ajax({
                    url: v_url,
                    type: "POST",
                    crossDomain: true,
                    cors: true,
                    secure: true,
                    crossDomain: true,
                    data: useroptions,
                    success: function (response) {
                        // mig_count++;
                        $("#migrate-success").css("display", "none");
                        $("#migrate-fail").css("display", "none");
                        $("#migrate-complete").css("display", "none");
                        var response = response;//JSON.parse(data);
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            //if (selected_Users.length == mig_count) {
                            AlertMessages("Copy users", response.error.message, "danger");
                            $(".failure_msg")[0].innerText = response.error.message;
                            //}
                            $("#loader")[0].style.display = "none";
                            $("#migrate-success").css("display", "none");
                            $("#migrate-fail").css("display", "block");
                            return
                        }
                        else {
                            if (response.notInvited.length == 0) {
                                AlertMessages("Migrate Users", "Users has been successfully migrated", "success");
                                $("#migrate-success")[0].style.display = "block";
                                $("#loader")[0].style.display = "none";
                            }
                            if (response.notInvited.length != 0) {
                                // AlertMessages("Migrate Users", response.notInvited.join(",") + " has been failed to migrate", "danger");
                                if (selected_Users.length == data.notInvited.length) {
                                    $("#migrate-fail")[0].style.display = "block";
                                    $("#loader")[0].style.display = "none";
                                    $(".failure_msg")[0].innerText = response.notInvited.join(",") + " has been failed to migrate";
                                }
                                if (selectedusers.length != response.notInvited.length) {
                                    $("#migrate-success")[0].style.display = "block";
                                    $("#migrate-fail")[0].style.display = "none";
                                    $("#loader")[0].style.display = "none";
                                    AlertMessages("Migrate Users", "Users has been  migrated to target portal with errors", "success");
                                }
                            }

                        }
                    },
                    error: function (data, textStatus, jqXHR) {
                        console.log(textStatus);
                        alert("Error in ajax call");
                    }
                });

            }

            function completeUser_migration(selected_Users) {
                var v_url = v_portalurl + "/sharing/rest/portals/self/invite";
                //var v_url = v_portalurl + "/portaladmin/security/users/createUser";//https://gistest.cityofpaloalto.org/arcgiswa/portaladmin/security/users/createUser
                var UserOptions = getOptionsById(selected_Users);
                var LoginMode = $(".tabs-container .active")[0].id;

                mig_count = 0;
                var usroptions = {
                    invitationList: JSON.stringify(UserOptions),
                    f: "json",
                    token: v_tarToken,
                    responseType: "json",
                    method: "post"
                };

                var hostname = v_portalurl.split('/');
                var domain = "";
                if (hostname.length > 0) {
                    domain = hostname[0] + "//" + hostname[2];
                    esriConfig.request.trustedServers.push(domain);
                }
                var myHeaders = new Headers();
                myHeaders.append("Access-Control-Allow-Origin", "*");
                $.ajax({
                    url: v_url,
                    type: "POST",
                    // headers: myHeaders,
                    // dataType: 'json',
                    // crossOrigin: true,
                    crossDomain: true,
                    // headers: { "Access-Control-Allow-Origin": "*" },
                    //cors: true,
                    //secure: true,
                    xhrFields: {
                        withCredentials: (LoginMode == "LoginMode3") ? true : false
                    },
                    data: usroptions,
                    success: function (data, textStatus, jqXHR) {
                        $("#migrate-success").css("display", "none");
                        $("#migrate-fail").css("display", "none");
                        $("#migrate-complete").css("display", "none");
                        mig_count++;
                        // $('.mgr-action').click();
                        var response = data;
                        if (typeof (response) == "string")
                            response = JSON.parse(data);
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            //if (selected_Users.length == mig_count) {
                            //AlertMessages("Copy users", response.error.message, "danger");

                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "Copy Users: " + response.error.message,
                                isSendEmail: true,
                                destUserName: v_tarusername,
                                destPortalUrl: v_portalurl
                            };
                            LogMessages(options, logFailureMsg);

                            //}
                            $(".failure_msg")[0].innerText = response.error.message;
                            $("#loader")[0].style.display = "none";
                            $("#migrate-success").css("display", "none");
                            $("#migrate-fail").css("display", "block");
                            return
                        }
                        else {
                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "",
                                isSendEmail: true,
                                destUserName: v_tarusername,
                                destPortalUrl: v_portalurl
                            };
                            if (response.notInvited.length == 0) {
                                AlertMessages("Migrate Users", "Users has been successfully migrated", "success");
                                $("#migrate-success")[0].style.display = "block";
                                $("#loader")[0].style.display = "none";
                                options.message = "Copy Users: Users has been successfully migrated";
                                options.isSendEmail = false;
                                LogMessages(options, logSuccessMsg);


                                if (migrateAdminUsers.length != 0 && AccountType == "Arcgisonline") { // if any admin exists update role of user
                                    var defrequest = [];
                                    for (var m = 0; m < migrateAdminUsers.length; m++) {
                                        var url = v_portalurl + "/sharing/rest/portals/self/updateUserRole";
                                        //https://ispatialtec.maps.arcgis.com/sharing/rest/portals/self/updateUserRole
                                        var options = {
                                            user: migrateAdminUsers[m],
                                            role: 'org_admin',
                                            f: 'json',
                                            token: v_tarToken
                                        }
                                        var request = $.ajax({
                                            url: url,
                                            type: "POST",
                                            crossDomain: true,
                                            xhrFields: {
                                                withCredentials: (LoginMode == "LoginMode3") ? true : false
                                            },
                                            data: options
                                        })
                                        defrequest.push(request);
                                    }

                                    all(defrequest).then(function (response) {

                                        console.log(response);

                                    }, function (err) {
                                        console.log(err);

                                    });
                                }


                                // LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy Users: Users has been successfully migrated", logSuccessMsg, false);
                            }
                            if (response.notInvited.length != 0) {
                                //AlertMessages("Migrate Users", response.notInvited.join(",") + " has been failed to migrate", "danger");
                                if (selected_Users.length == response.notInvited.length) {
                                    $("#migrate-fail")[0].style.display = "block";
                                    $("#loader")[0].style.display = "none";
                                    $(".failure_msg")[0].innerText = response.notInvited.join(",") + " has been failed to migrate";
                                    options.message = "Copy Users: " + response.notInvited.join(",") + " has been failed to migrate";
                                    LogMessages(options, logFailureMsg);
                                    // LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy Users: " + response.notInvited.join(",") + " has been failed to migrate", logFailureMsg, true);
                                }
                                if (selectedusers.length != response.notInvited.length) {
                                    $("#migrate-success")[0].style.display = "block";
                                    $("#migrate-fail")[0].style.display = "none";
                                    $("#loader")[0].style.display = "none";
                                    //LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy Users:Users has been  migrated to target portal with errors", logSuccessMsg, true);
                                    options.message = "Copy Users:Users has been  migrated to target portal with errors";
                                    LogMessages(options, logFailureMsg);

                                    AlertMessages("Migrate Users", "Users has been  migrated to target portal with errors", "success");
                                }
                            }

                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        alert("Error in ajax call");
                    }
                });
            }

        });
    }



    function getOptionsById(Id) {
        migrateAdminUsers = [];
        var UserOptions = {};
        var Userlist = {
            "invitations": []
        };
        for (var j = 0; j < selectedusers.length; j++) {
            source_Users.forEach(function (user) {
                if (user.username == selectedusers[j]) {
                    var newusername = user.username;
                    if (duplicateusers.length > 0) {
                        for (var m = 0; m < duplicateusers.length; m++) {
                            if (duplicateusers[m].requested == newusername) {
                                newusername = duplicateusers[m].suggested
                            }
                        }
                    }


                    UserOptions = {
                        email: user.email,
                        firstname: user.firstName,
                        lastname: user.lastName,
                        username: newusername,
                        password: "Test@1994",
                        // role: user.role,
                        access: user.access,
                        fullname: user.firstName + "" + user.lastName,
                        userCreditAssignment: -1,
                        applyActUserDefaults: false
                    }
                    if (AccountType == "Arcgisonline") {
                        UserOptions.userLicenseType = user.userLicenseType;
                        UserOptions.userType = user.userType;

                        if (user.role.indexOf("admin") != -1) { // handling admin users migration
                            UserOptions.role = 'org_user';
                            migrateAdminUsers.push(newusername);
                        }
                        else {
                            UserOptions.role = user.role;
                        }


                    }
                    else {
                        UserOptions.level = (typeof (user.level) != "undefined") ? user.level : "2";
                        UserOptions.provider = "enterprise";
                    }
                    Userlist.invitations.push(UserOptions)
                }
            });
        }
        return Userlist;
    }


});