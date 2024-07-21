var source_roles = [];
var v_srcToken;
//var commonutils = new CommonUtils();
includeHeader();
var selectedRoles = [];
var v_username;
var v_tarToken;
var Targetroles = [];
var duplicateroles = [];
var Target_portalid;
var clickflag = true; var migrateflag = true; var searchflag = false;
if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
    window.location.href = "../views/PortalAdmin.html";
}
var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
includeMenu('Copy Roles to Organization');
$(document).ready(function () {
    require(["esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/request",
        "dojo/_base/array",
        "esri/config",
        "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, array,esriConfig) {
        var personalPanelElement = document.getElementById("personalizedPanel");
        var anonPanelElement = document.getElementById("anonymousPanel");
        var v_portalurl = Config.portalUrl = sesstionItem.portalurl;
        v_srcToken = sesstionItem.token;
        //if (sesstionItem.hostName != "")
        //    esriConfig.request.trustedServers.push(sesstionItem.hostName);
            if (sesstionItem.PKIandIWFLogin)
                esriConfig.request.trustedServers.push(sesstionItem.hostName);
       
        var queryParams = {
            returnPrivileges: true,
            token: v_srcToken,
            f: "json",
            start: 1,
            num: 100
        };
        fetchAllRoles();
        $(".lds-ring").css("display", "block");
        // $("#source_user")[0].innerText = 'Current User: ' + sesstionItem.username;
        function fetchAllRoles() { //fetching all available roles
            var url = v_portalurl + '/sharing/rest/portals/self/roles';
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options).then(function (response) {
                if (response.data.roles.length != 0) {
                    queryParams.start = response.data.roles.length + 1;
                    source_roles = source_roles.concat(response.data.roles);
                    fetchAllRoles();
                }
                else {
                    loadsourceRoles(source_roles);
                }
            });
        }
        $(".breadcrumb_Home").click(function () {
            window.location.reload();
        });
        $("#search").keydown(function (event) {
            searchflag = true;
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#sourceRoles").jsGrid("search", { Name: uname }).done(function () { });
            }
            else {
                $("#sourceRoles").jsGrid("clearFilter").done(function () { });
            }
        });
        function loadsourceRoles(roles) {
            setTimeout(function () {
                $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
                $("#sign-out").click(function () {
                    signOutCredentials(esriId);
                });
            }, 2000);
            var rolesData = [];
            array.forEach(roles, function (role) {
                if (role.name != "Viewer" && role.name != "Data Editor") {
                    var roleObj = {
                        Select: role.id,
                        Name: role.name,
                        Description: role.description,
                        CreatedOn: role.created,
                        ModifiedOn: role.modified,
                    };
                    rolesData.push(roleObj);
                }
            });
            if (rolesData.length == 0)
                AlertMessages("Roles", "No custom roles are found", "warning");
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
                        //    $("#sourceRoles").jsGrid("loadData");
                        //}
                    }).attr('placeholder', 'Select Date');
                    return $("<div>").append(this._fromPicker);
                },
                filterValue: function () {
                    return {from: this._fromPicker.datepicker("getDate")};
                }
            });
            jsGrid.fields.date = DateField;
            $("#sourceRoles").jsGrid({
                width: "100%",
                height: "auto",
                filtering: true,
                sorting: true,
                paging: true,
                pageSize: $("#pageSize").value,
                data: rolesData,
                controller: {
                    data: rolesData,
                    loadData: function (filter) {
                        selectedRoles = [];
                        $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                        $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                        if (searchflag==false) {
                            $('#search').val("");
                            return $.grep(this.data, function (item) {
                                return ((!filter.Name || item.Name.toLowerCase().indexOf(filter.Name.toLowerCase()) >= 0)
                                    && (!filter.Description || item.Description.toLowerCase().indexOf(filter.Description.toLowerCase()) >= 0)
                                    && (!filter.CreatedOn.from || new Date(item.CreatedOn).toDateString() == filter.CreatedOn.from.toDateString())
                                    && (!filter.ModifiedOn.from || new Date(item.ModifiedOn).toDateString() == filter.ModifiedOn.from.toDateString()));
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return (!filter.Name || item.Name.toLowerCase().indexOf(filter.Name.toLowerCase()) >= 0)
                                //&& (!filter.Description || item.Description.toLowerCase().indexOf(filter.Description.toLowerCase()) >= 0)
                                //&& (!filter.CreatedOn || new Date(item.CreatedOn).toLocaleDateString() == filter.CreatedOn.toLocaleDateString())
                                //&& (!filter.ModifiedOn || new Date(item.ModifiedOn).toLocaleDateString() == filter.ModifiedOn.toLocaleDateString());
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
                                    selectedRoles = [];
                                    $(".first-next").addClass("disbaleClass");
                                    if ($(this)) {
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
                                            selectedRoles = [];
                                        }
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            var roleType = item.Name;
                            if (roleType != 'Viewer' || roleType != 'Data Editor' || roleType != 'Publisher' || roleType != 'User') {
                                //    return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select).attr("disabled", true)
                                //        .prop("checked", $.inArray(item.Name, selectedRoles) > -1)
                                //        .on("change", function () {
                                //            $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                //        });
                                //}
                                //else {
                                return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select)
                                    .prop("checked", $.inArray(item.Name, selectedRoles) > -1)
                                    .on("change", function () {
                                        $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                    });
                            }


                        },
                        sorting: false,
                        filtering: false,
                    },
                    {
                        name: "Name", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Name).text(item.Name)
                        }
                    },
                    {
                        name: "Description", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Description).text(item.Description)
                        }
                    },
                    {
                        name: "CreatedOn", type: "date", title: "Created Date",
                        itemTemplate: function (value) {
                            var date = new Date(value);
                            return date.toLocaleDateString();
                        }
                    },
                    {
                        name: "ModifiedOn", type: "date", title: "Modified Date",
                        itemTemplate: function (value) {
                            var date = new Date(value);
                            return date.toLocaleDateString();
                        }
                    },
                    {
                        type: "control", width: 50, visible: true,
                        editButton: false, deleteButton: false,
                        headerTemplate: function (e) {
                            return $("<span>")
                        },
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", "").text("-")
                        }
                    }

                ],
                rowClick: function (args) {
                    sel_role = args.item.Name;
                    if (sel_role == 'Viewer' || sel_role == 'Data Editor' || sel_role == 'Publisher' || sel_role == 'User') {
                        AlertMessages("Warning !", "Default Role of Organization", "warning");
                    }
                },
                rowClass: function (item) {
                    sel_role = item.Name;
                    if (sel_role == 'Viewer' || sel_role == 'Data Editor' || sel_role == 'Publisher' || sel_role == 'User') {
                        return 'disableRow';
                    }
                }
            });
            $(".page_size").css("display", "block");
            $(".first-next").addClass("disbaleClass");
            $("#pageSize").on('change', function (event) {
                $("#sourceRoles").jsGrid("option", "pageSize", this.value);
            });
            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
            var selectItem = function (item) {
                selectedRoles.push(item);
                $(".first-next").removeClass("disbaleClass");
                if (selectedRoles.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {

                selectedRoles = $.grep(selectedRoles, function (i) {
                    return i !== item;
                });
                $(".first-next").removeClass("disbaleClass");
                if (selectedRoles.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if (selectedRoles.length == 0) {
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
});

$("#Targetarcgisonline").click(function () {
    migrateflag = true
    loadTargetPortal("Arcgisonline");
    if (sesstionItem.type == "Arcgisonline") {
        ActionType = "ArcgisToArcgisonline"
    }
    else {
        // ActionType="ArcgisToPortal";
        ActionType = "PortalToArcgis";
    }
})
$("#Targetportal").click(function () {
    migrateflag = true
    loadTargetPortal("PortalforArcgis");
    if (sesstionItem.type == "PortalforArcgis") {
        ActionType = "PortalToPortal"
    }
    else {
        //ActionType = "PortalToArcgis";
        ActionType = "ArcgisToPortal"
    }
})

function loadTargetPortal(Accounttype) {
    require(["esri/portal/Portal", "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager", "esri/request",
        "dojo/_base/array", "esri/config", "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, array, esriConfig) {
        var v_portal = null;
        // var selected_roles = [];
        Targetroles = [];
        var mig_count = 0;
        var err_count = 0;
        $("#LoginforPortal").prop("disabled", false);
        clickflag = true;


        if (Accounttype == "PortalforArcgis") {
            //$("#PortalLoginForm").modal('toggle');
        }
        else {
            v_portalurl = Config.arcGisOnline; // "https://www.arcgis.com";
            var appIdJson = esriId;
            var esriJSAPIOAuth = sessionStorage.esriJSAPIOAuth;
            sessionStorage.setItem("esriJSAPIOAuthBackup", esriJSAPIOAuth);
            sessionStorage.setItem("esriIdBackup", JSON.stringify(appIdJson));
            esriId.destroyCredentials();
            sessionStorage.removeItem("esriJSAPIOAuth");
            localStorage.removeItem("esriJSAPIOAuth");// when user selects remember me option preventing auto login for destination portal
            var info2 = new OAuthInfo({
                appId: Config.appId, //'q244Lb8gDRgWQ8hM',//"iV4CzRAJ6Gdc9WmL",
                popup: true  //false
            });
            esriId.registerOAuthInfos([info2]);
            esriId.getCredential(info2.portalUrl + "/sharing", {
                oAuthPopupConfirmation: false
            }).then(
                function (cred) {
                    displayTargetData(cred);
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
        })
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
                            displayTargetData(cred);
                        }
                    ).catch(
                        function (ee) {
                            esriId.getCredential(info1.portalUrl + "/sharing", {
                                oAuthPopupConfirmation: !1
                            }).then(
                                function (cred) {

                                    displayTargetData(cred);
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
            var LoginMode = $(".tabs-container .active")[0].id;
            var portalurl = $("#portalurl").val();
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
                    v_portalurl = portalurl;
                    $(".close_modal").click();
                    console.log(response);
                    displayTargetData(response)

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
        function displayTargetData(cred) {

            let portal = new Portal({
                url: v_portalurl,
                token: (typeof (cred.data) != "undefined") ? cred.data.token : cred.token
               // token: (Accounttype == "PortalforArcgis") ? cred.data.token : cred.token
            });
            v_tarToken = (typeof (cred.data) != "undefined") ? cred.data.token : cred.token; //(Accounttype == "PortalforArcgis") ? cred.data.token : cred.token
            portal.load().then(function (portalObj) {
                v_portal = portalObj;
                esriId.initialize(appIdJson);
                if (Accounttype == "PortalforArcgis") {
                    var LoginMode = $(".tabs-container .active")[0].id;
                    if (LoginMode == "LoginMode1")
                        v_username = $("#defaultForm-username").val()
                    else
                        v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;
                }
                else
                    v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;

                //v_username = portalObj.user.username;
                //v_tarToken = (Accounttype == "PortalforArcgis") ? portalObj.token : portalObj.credential.token;
                //v_username = (Accounttype == "PortalforArcgis") ? $("#defaultForm-username").val() : portal.user.username;
                //  v_tarToken = (Accounttype == "PortalforArcgis") ? cred.data.token : cred.token;
                // v_username = (Accounttype == "PortalforArcgis") ? $("#defaultForm-username").val() : cred.userId;
                // $("#Target_user")[0].innerText = 'Current User: ' + v_username;
               AlertMessages("Signin portal", "Successfully signed target portal", "success");
                Target_portalid = (sesstionItem.type == "PortalforArcgis") ? portal.id : portal.id;
                sessionStorage.setItem("esriJSAPIOAuth", esriJSAPIOAuth);
                var queryParams = {
                    returnPrivileges: true,
                    token: v_tarToken,
                    f: "json",
                    start: 1,
                    num: 100
                };
                var url = v_portalurl + '/sharing/rest/portals/self/roles';
                var options = {
                    query: queryParams,
                    responseType: "json"
                };
                var tempdata = []
                esriRequest(url, options).then(function (response) {
                    //if (response.data.roles.length != 0) {
                    //    queryParams.start = response.data.roles.length + 1;
                    tempdata = tempdata.concat(response.data.roles);
                    //}
                    //else {
                    Targetroles = [];
                    for (var i = 0; i < tempdata.length; i++) {
                        Targetroles.push(tempdata[i].name);
                        // }
                    }
                });

                loadSelectedRoles();
                $("#login-done").click();
            });
        }

        function loadSelectedRoles() {
            $('#sel_roles').empty();
            for (var i = 0; i < selectedRoles.length; i++) {
                var roleid = selectedRoles[i];
                source_roles.forEach(function (role) {
                    if (role.id == roleid) {
                        //var list = document.createElement("li");
                        //list.className = "list-group-item";
                        //list.textContent = role.name;
                        //$('#sel_roles').append(list);
                        var htmlContent = '<div class="dt-widget__item">' +
                            //'<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + role.name + '</a>'
                        $('#sel_roles').append(htmlContent);
                        //selected_roles.push(role);
                    }
                });
            }
            $(".itemCount")[0].innerText = selectedRoles.length;
        }

        // document.getElementById("migrate-btn").addEventListener("click", function () {
        $("#migrate-btn").click(function () {
            if (migrateflag) {
                migrateflag = false;
                selected_roles = selectedRoles;
                if (selected_roles.length == 0) {
                   AlertMessages("Warning !", "Please select role", "warning");
                    return;
                }
                var uniqueroles = [];
                for (var i = 0; i < selected_roles.length; i++) {
                    for (var j = 0; j < source_roles.length; j++) {
                        if (selected_roles[i] == source_roles[j].id) {
                            if (Targetroles.indexOf(source_roles[j].name) != -1) {
                                duplicateroles.push(source_roles[j].name);
                            }
                            else {
                                uniqueroles.push(source_roles[j]);
                            }
                        }
                    }

                }
                if (selected_roles.length == duplicateroles.length) {
                    // commonutils.AlertMessages("Duplicate roles", "Selected roles are existing in Target portal", "danger");
                    $(".failure_msg")[0].innerText = "Selected roles are already existing in target portal";
                    $("#migrate-fail")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    return
                }
                selected_roles = uniqueroles;

                for (var i = 0; i < selected_roles.length; i++) {

                    migrateRoles(selected_roles[i]);
                }
            }
        });

            function migrateRoles(src_role) {
                var LoginMode = $(".tabs-container .active")[0].id;
            var v_url = v_portalurl + '/sharing/rest/portals/self/createRole';
            var options = {
                //query: {
                //    name: src_role.name,
                //    description: src_role.description,
                //    token: v_tarToken,
                //    f: "json"
                //},
                name: src_role.name,
                description: src_role.description,
                token: v_tarToken,
                f: "json",
                responseType: "json",
                method: "post"
            };

            $.ajax({
                url: v_url,
                type: "POST",
                crossDomain: true,
                data: options,
                xhrFields: {
                    withCredentials: (LoginMode == "LoginMode3") ? true : false
                },
                success: function (data, textStatus, jqXHR) {
                    var response = data;//JSON.parse(data);
                    if (typeof (data) == "string")
                        var response = JSON.parse(data);
                    if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                        //  commonutils.AlertMessages("Copy Roles(Target portal) ", response.error.message, "danger");
                        //commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles: " + response.error.message, commonutils.logFailureMsg, true);

                        var options = {
                            userName: sesstionItem.username,
                            portalUrl: sesstionItem.portalurl,
                            message: "Copy roles: " + response.error.message,
                            isSendEmail: true,
                            destUserName: v_username,
                            destPortalUrl: v_portalurl
                        };
                        LogMessages(options, logFailureMsg);

                        $(".failure_msg")[0].innerText = response.error.message;
                        $("#loader")[0].style.display = "none";
                        $("#migrate-success").css("display", "none");
                        $("#migrate-fail").css("display", "block");
                        return
                    }
                    else {
                        setRolePrivileges(response.id, src_role.privileges);
                        //commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles:Successfully copied roles " + response.name, commonutils.logSuccessMsg, false);
                        //if (response.data.notInvited.length != selected_Users.length) {
                        //    commonutils.AlertMessages("Migrate Users", "Users has been successfully migrated with suffix <b>_1</b>", "success");
                        //    $("#migrate-success")[0].style.display = "block";
                        //    $("#loader")[0].style.display = "none";
                        //}
                        //if (response.data.notInvited.length != 0) {
                        //    commonutils.AlertMessages("Migrate Users", response.data.notInvited.join(",") + " has been failed to migrate", "danger");
                        //    if (selected_Users.length == response.data.notInvited.length) {
                        //        $("#migrate-fail")[0].style.display = "block";
                        //        $("#loader")[0].style.display = "none";
                        //    }
                        //}

                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // commonutils.AlertMessages("Copy roles to Organization", textStatus, "danger");
                    // commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles: Failed to copy roles ", commonutils.logFailureMsg, true);
                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copy roles: Failed to copy roles ",
                        isSendEmail: true,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logFailureMsg);

                    $(".failure_msg")[0].innerText = "Failed to copy roles";
                    $("#migrate-fail")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    return;
                }
            });


            //esriRequest(v_url, options).then(function (response) {
            //    setRolePrivileges(response.data.id, src_role.privileges);
            //}).catch(function (err) {
            //    console.log(err);
            //    commonutils.AlertMessages("Copy roles to Organization", err.message, "danger");
            //    $("#migrate-fail")[0].style.display = "block";
            //    $("#loader")[0].style.display = "none";
            //    return;
            //});
        }
        function setRolePrivileges(roleid, privileges) {
            var v_url = v_portalurl + '/sharing/rest/portals/self/roles/' + roleid + '/setPrivileges';
            var previlegesObj = { "privileges": privileges };
            var options = {
                query: {
                    privileges: JSON.stringify(previlegesObj),
                    token: v_tarToken,
                    f: "json"
                },
                responseType: "json",
                method: "post"
            };
            esriRequest(v_url, options).then(function (response) {
                mig_count = mig_count + 1;
                console.log("Success: ", response);
                if (mig_count == selected_roles.length && err_count == 0) {
                    $("#migrate-success")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    AlertMessages("Copy roles", "Successfully copied roles to target portal", "success");
                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copy roles:Successfully copied roles ",
                        isSendEmail: false,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logSuccessMsg);
                    //commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles:Successfully copied roles ", commonutils.logSuccessMsg, false);
                }
                else if (mig_count == selected_roles.length && err_count > 0) {
                    $("#migrate-complete")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    AlertMessages("Copy roles", "Copied roles to target portal with errors", "warning");

                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copied roles to target portal with errors",
                        isSendEmail: true,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logFailureMsg);


                    // commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles:Copied roles to target portal with errors", commonutils.logSuccessMsg, false);
                }
                if (mig_count == selected_roles.length && duplicateroles.length > 0) {
                    // commonutils.LogMessages(sesstionItem.username, sesstionItem.portalurl, "Copy roles: " + duplicateroles.join(",") + " are existing in target portal", commonutils.logFailureMsg, true);
                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copy roles: " + duplicateroles.join(",") + " are existing in target portal",
                        isSendEmail: true,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logFailureMsg);
                    AlertMessages("Copy roles", duplicateroles.join(",") + " are existing in target portal", "warning")
                }
            }).catch(function (err) {
                err_count++;
                mig_count = mig_count + 1;
                if (mig_count == selected_roles.length && err_count == selected_roles.length) {
                    $("#migrate-fail")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copy roles: Failed to copy roles to target portal",
                        isSendEmail: true,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logFailureMsg);
                }
                else if (mig_count == selected_roles.length && err_count < selected_roles.length) {
                    $("#migrate-complete")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                }
            });
        }
    });
}



