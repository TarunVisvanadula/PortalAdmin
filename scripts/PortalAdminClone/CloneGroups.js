var source_groups = [];
var target_groups = [];
var duplicate_groups = [];
var source_groups_content = [];
var v_srcToken;
includeHeader();
var v_portalurl;
var selectedsourceGroups = [];
var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
var v_username = null;
var v_tarToken;
var ActionType = ""; var errcount = 0;
var alertflag = false;
var ActionType = '';
var clickflag = true; var migrateflag = true; var searchflag = false;
includeMenu('Copy Groups to Organization');
$(document).ready(function () {
    require(["esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/request",
        "dojo/_base/array",
        "esri/config",
        "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, array, esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);
        }
        //if (sesstionItem.hostName != "")
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);

        $("#personalizedPanel").css("display", "block");
        v_portalurl = Config.portalUrl = sesstionItem.portalurl;

        fetchAllGroups()
        $(".breadcrumb_Home").click(function () {

            window.location.reload();
        });
        $(".lds-ring").css("display", "block");
        function fetchAllGroups() {
            var queryParams = {
                //q: 'orgid:' + sesstionItem.portalid,
                q: 'owner:' + sesstionItem.username,
                token: sesstionItem.token,
                num: 200,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json",
                num: 100

            };
            esriRequest(Config.portalUrl + "/sharing/rest/community/groups", options)
                .then(function (response) {
                    v_srcToken = sesstionItem.token;
                    v_user = 'Current User: ' + sesstionItem.username;
                    $('#source_user').text(v_user);
                    $(".first-next").addClass("disbaleClass");
                    loadGroupsContent(response.data.results);
                }).catch(function (err) {
                    console.log(err);
                    AlertMessages("Copy Groups", err.message, "danger");
                    $(".lds-ring").css("display", "none");
                    return;
                });
        };

        $("#search").keydown(function (event) {
            searchflag = true;
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#sourceGroups").jsGrid("search", { GroupName: uname, Owner: uname, Access: uname }).done(function () { });
            }
            else {
                $("#sourceGroups").jsGrid("clearFilter").done(function () { });
            }
        });
        function loadsourceGroups(groupsData) {
            setTimeout(function () {
                $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
                $("#sign-out").click(function () {
                    signOutCredentials(esriId);
                });
            }, 2000);
            selectedsourceGroups = [];
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
                        //    $("#sourceGroups").jsGrid("loadData");
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
            $("#sourceGroups").jsGrid({
                width: "100%",
                height: "auto",
                filtering: true,
                sorting: true,
                paging: true,
                pageSize: $("#pageSize").value,
                data: groupsData,
                controller: {
                    data: groupsData,
                    loadData: function (filter) {
                        selectedsourceGroups = [];
                        $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                        $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                       // if ($('#search').val() == "") {
                        if (searchflag == false) {
                            $('#search').val("");
                            return $.grep(this.data, function (item) {
                                if (item.Description == null) {
                                    item.Description = "";
                                }
                                return ((!filter.Title || item.Title.toUpperCase().indexOf(filter.Title.toUpperCase()) >= 0)
                                  //  && (!filter.Tags || item.Tags.map(value => value.toLowerCase()).includes(filter.Tags) == true)
                                    && (!filter.Tags || item.Tags.toString().toUpperCase().indexOf(filter.Tags.toUpperCase()) >= 0)
                                    && (!filter.Owner || item.Owner.toUpperCase().indexOf(filter.Owner.toUpperCase()) >= 0)
                                    && (!filter.Description || item.Description.toUpperCase().indexOf(filter.Description.toUpperCase()) >= 0)
                                    && (!filter.CreatedOn.from || new Date(item.CreatedOn).toDateString() == filter.CreatedOn.from.toDateString())
                                    && (!filter.ModifiedOn.from || new Date(item.ModifiedOn).toDateString() == filter.ModifiedOn.from.toDateString())
                                    && (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0));
                            });
                        } else {
                            searchflag = false
                            return $.grep(this.data, function (item) {
                                return ((!filter.GroupName || item.Title.toUpperCase().indexOf(filter.GroupName.toUpperCase()) >= 0)
                                    || (!filter.Owner || item.Owner.toUpperCase().indexOf(filter.Owner.toUpperCase()) >= 0)
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

                                    selectedUsers = [];
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
                                        selectedUsers = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select)
                                .prop("checked", $.inArray(item.Title, selectedsourceGroups) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        sorting: false,
                        filtering: false,
                    },
                    {
                        name: "Title", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Title).text(item.Title)
                        }
                    },
                    { name: "Owner", type: "text" },
                    {
                        name: "Tags", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Tags).text(item.Tags)
                        }
                    },
                    {
                       // name: "Access", type: "text",
                        name: "Access", type: "select", items: [{ name: "Select", id: "" }, { name: "Public", id: "Public" }, { name: "Private", id: "Private" }, { name: "Shared", id: "Shared" }, { name: "Org", id: "Org" }], valueField: "id", textField: "name", title: "Access", align: "center", visible: true,
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
                    {
                        name: "Description", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Description).text(item.Description)
                        }
                    },
                    {
                        name: "CreatedOn", type: "date", title: "Created Date",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    },
                    {
                        name: "ModifiedOn", type: "date", title: "Modified Date",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    },
                    {
                        name: "ItemsCount", title: "No.of Items", type: "number", filtering: false, align: "center",
                        itemTemplate: function (value) {
                            for (var i = 0; i < source_groups_content.length; i++) {
                                var obj = source_groups_content[i];
                                if (value == obj.groupid)
                                    return obj.content.length;

                            }
                        }
                    },
                    {
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
            $(".first-next").addClass("disbaleClass");
            $(".page_size").css("display", "inline-block");
            $("#pageSize").on('change', function (event) {
                $("#sourceGroups").jsGrid("option", "pageSize", this.value);
            });
            var selectItem = function (item) {
                selectedsourceGroups.push(item);
                $(".first-next").removeClass("disbaleClass");
                if (selectedsourceGroups.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {

                selectedsourceGroups = $.grep(selectedsourceGroups, function (i) {
                    return i !== item;
                });
                $(".first-next").removeClass("disbaleClass");
                if (selectedsourceGroups.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if (selectedsourceGroups.length == 0) {
                    $('#selectAllCheckbox').attr('checked', false);
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            $(".lds-ring").css("display", "none");
            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
        }

        function loadGroupsContent(groups) {
            source_groups = [];
            var groupsData = [];
            var tot_groups = groups.length;
            var count = 0;
            array.forEach(groups, function (group) {
                if (group.owner == sesstionItem.username) { // filtering for login user groups
                    source_groups.push(group);
                    var groupObj = {
                        Select: group.id,
                        Title: group.title,
                        Access: group.access,
                        Tags: group.tags,
                        Description: group.description,
                        CreatedOn: group.created,
                        ModifiedOn: group.modified,
                        Owner: group.owner,
                        ItemsCount: group.id,
                    };
                    groupsData.push(groupObj);
                }
                var v_url = v_portalurl + '/sharing/rest/content/groups/' + group.id;
                var options = {
                    query: {
                        token: v_srcToken,
                        id: group.id,
                        f: "json"
                    },
                    responseType: "json",
                    method: "get"
                };
                esriRequest(v_url, options).then(function (response) {
                    count++;
                    var items = response.data.items;
                    for (var i = 0; i < items.length; i++) {
                        var type = items[i].type;
                        if (type == 'Table' || type == 'File Geodatabase' || type == 'Service Definition' || type == 'Geoprocessing Package' || type == 'Code Attachment') {
                            items.splice(i, 1);
                            i--;
                        }
                    }
                    var groupContentObj = { "groupid": response.requestOptions.query.id, "content": items };
                    source_groups_content.push(groupContentObj);
                    if (tot_groups == count)
                        loadsourceGroups(groupsData);

                }).catch(function (err) {
                    console.log(err);
                    count++;
                    if (tot_groups == count)
                        loadsourceGroups(groupsData);
                });
            });
        }

    });
});


$("#Targetarcgisonline").click(function () {
    migrateflag = true;
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
    migrateflag = true;
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
        "esri/identity/IdentityManager", "esri/request", "dojo/promise/all",
        "dojo/_base/array", "esri/config", "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, all, array, esriConfig) {

        var isDuplicateGroup = false;
        duplicate_groups = [];
        var selected_groups = [];
        var mig_count = 0;
        clickflag = true;
        $("#LoginforPortal").prop("disabled", false);
        if (Accounttype == "PortalforArcgis") {
            // $("#PortalLoginForm").modal('toggle');
        }

        if (Accounttype == "Arcgisonline") {
            v_portalurl = Config.arcGisOnline; //"https://www.arcgis.com";
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
        // document.getElementById("LoginforPortal").addEventListener("click", function () {
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
                    $("#LoginforPortal").removeClass("disbaleClass");
                    console.log(response);
                    displayTargetItems(response);

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
                // token: (Accounttype == "PortalforArcgis") ? cred.data.token : cred.token
            });
            v_tarToken = (typeof (cred.data) != "undefined") ? cred.data.token : cred.token;//(Accounttype == "PortalforArcgis") ? cred.data.token : cred.token
            portal.load().then(function (portalObj) {
                //  v_username = portalObj.user.username; //(Accounttype == "PortalforArcgis") ? $("#defaultForm-username").val() : portal.user.username;
                if (Accounttype == "PortalforArcgis") {
                    var LoginMode = $(".tabs-container .active")[0].id;
                    if (LoginMode == "LoginMode1")
                        v_username = $("#defaultForm-username").val()
                    else
                        v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;
                }
                else
                    v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;

                var queryParams = {
                    q: 'owner:' + v_username,
                    token: v_tarToken,
                    num: 200,
                    f: "json"
                };
                var options = {
                    query: queryParams,
                    responseType: "json",
                    num: 100

                };
                esriRequest(v_portalurl + "/sharing/rest/community/groups", options)
                    .then(function (response) {
                        loadtargetGroups(response.data.results);
                    }).catch(function (err) {
                        console.log(err);
                    });

                //portal.user.fetchGroups().then(loadtargetGroups);
                esriId.initialize(appIdJson);
                sessionStorage.setItem("esriJSAPIOAuth", esriJSAPIOAuth);
                AlertMessages("Signin portal", "Successfully signed target portal", "success");
                loadSelectedGroups();
                $("#login-done").click();
            });
        }
        function loadtargetGroups(groups) {
            array.forEach(groups, function (group) {
                //var title = group.title;
                target_groups.push(group);
            });

        }
        function loadSelectedGroups() {
            selected_groups = [];
            $('#groups-update').empty();
            $('#sel_groups').empty();
            var chkboxes = $('#sourceGroups').find('input[type="checkbox"]');
            for (var i = 0; i < selectedsourceGroups.length; i++) {
                // if (chkboxes[i].checked) {
                var groupid = selectedsourceGroups[i]; //chkboxes[i].value
                // loadgroupContent(groupid);
                source_groups.forEach(function (group) {
                    if (group.id == groupid) {
                        //var list = document.createElement("li");
                        //list.className = "list-group-item";
                        //list.textContent = group.title;
                        //$('#sel_groups').append(list);
                        var obj = { "groupId": groupid, "groupName": group.title }
                        selected_groups.push(obj);
                        var htmlContent = '<div class="dt-widget__item">' +
                            //'<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + group.title + '</a>'
                        $('#sel_groups').append(htmlContent);
                    }
                });
                //}
            }
            $(".itemCount")[0].innerText = selected_groups.length;
        }
        function loadgroupContent(groupid) {
            var v_url = v_portalurl + '/sharing/rest/content/groups/' + groupid;
            var options = {
                query: {
                    token: v_srcToken,
                    id: groupid,
                    f: "json"
                },
                responseType: "json",
                method: "get"
            };
            esriRequest(v_url, options).then(function (response) {
                //console.log(response);
                var items = response.data.items;
                for (var i = 0; i < items.length; i++) {
                    var type = items[i].type;
                    if (type == 'Table' || type == 'File Geodatabase' || type == 'Service Definition' || type == 'Geoprocessing Package' || type == 'Code Attachment') {
                        items.splice(i, 1);
                        i--;
                    }
                }
                var groupContentObj = { "groupid": response.requestOptions.query.id, "content": items };
                source_groups_content.push(groupContentObj);
            }).catch(function (err) {
                console.log(err);
            });
        }

        // document.getElementById("migrate-btn").addEventListener("click", function () {
        $("#migrate-btn").click(function () {
            if (migrateflag) {
                migrateflag = false;
                //document.getElementById("override-groups").addEventListener("click", function () {
                $("#override-groups").click(function () {
                    $("#migrate-complete")[0].style.display = "none";
                    $("#loader")[0].style.display = "inline-block";
                    ActionType = "UpdategroupsContent";
                    for (var i = 0; i < duplicate_groups.length; i++) {
                        var targetId = duplicate_groups[i].tar_groupid;
                        var sourceId = duplicate_groups[i].src_groupid;
                        updateGroup(targetId, sourceId)
                    }
                    var tempArray = [];
                    for (var j = 0; j < duplicate_groups.length; j++) {
                        tempArray.push(duplicate_groups[j].src_groupid)
                    }
                    for (var k = 0; k < selected_groups.length; k++) {
                        if (tempArray.indexOf(selectedsourceGroups[k]) == -1) {
                           // isGroupExists = false
                            migrateGroups(selected_groups[k]);
                        }
                    }
                });
                //  document.getElementById("merge-groups").addEventListener("click", function () {
                $("#merge-groups").click(function () {
                    $("#migrate-complete")[0].style.display = "none";
                    $("#loader")[0].style.display = "inline-block";
                    ActionType = "UpdategroupswithItems";
                    for (var i = 0; i < duplicate_groups.length; i++) {
                        var targetId = duplicate_groups[i].tar_groupid;
                        var sourceId = duplicate_groups[i].src_groupid;
                        updateGroup(targetId, sourceId)
                    }
                    var tempArray = [];
                    for (var j = 0; j < duplicate_groups.length; j++) {
                        tempArray.push(duplicate_groups[j].src_groupid)
                    }
                    for (var k = 0; k < selected_groups.length; k++) {
                        if (tempArray.indexOf(selectedsourceGroups[k]) == -1) {
                            //isGroupExists = false
                            migrateGroups(selected_groups[k]);
                        }
                    }
                });
                // document.getElementById("no-update-req").addEventListener("click", function () {
                $("#no-update-req").click(function () {
                    $("#migrate-complete")[0].style.display = "none";
                    //$("#migrate-success")[0].style.display = "block";
                    ActionType = "skipduplicates";
                    var isGroupExists = true;
                    $("#loader")[0].style.display = "inline-block";
                    var tempArray = [];
                    for (var j = 0; j < duplicate_groups.length; j++) {
                        tempArray.push(duplicate_groups[j].src_groupid)
                    }
                    for (var k = 0; k < selected_groups.length; k++) {
                        if (tempArray.indexOf(selectedsourceGroups[k]) == -1) {
                            isGroupExists = false
                            migrateGroups(selected_groups[k]);
                        }
                    }
                    if (isGroupExists) {
                        $("#migrate-fail")[0].style.display = "block";
                        $(".failure_msg")[0].innerText ="No groups are found for copying"
                        $("#loader")[0].style.display = "none";
                       // AlertMessages("Copy groups", "No groups are found", "warning");
                        return
                    }

                });
                if (selected_groups.length == 0) {
                    AlertMessages("Warning !", "Please select group", "warning");
                    //alert("Please select group");
                    return;
                }
                alertflag = false;
                isDuplicateGroup = false;
                errcount = 0; mig_count = 0;
                for (var k = 0; k < selected_groups.length; k++) {
                    //var duplicateStatus = verifyDuplicates(selected_groups[k]);
                    //if (!duplicateStatus)
                    //    migrateGroups(selected_groups[k]);
                    //else
                    //    isDuplicateGroup = true;
                    verifyDuplicates(selected_groups[k]);
                }
                if (selected_groups.length == duplicate_groups.length) {
                    $("#migrate-complete")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    isDuplicateGroup = true;
                }
                else if (selected_groups.length != duplicate_groups.length && duplicate_groups.length != 0) {
                    $("#migrate-complete")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    isDuplicateGroup = true;
                }
                else if (duplicate_groups.length == 0) {
                    isDuplicateGroup = false;
                    $("#loader")[0].style.display = "inline-block";
                    for (var k = 0; k < selected_groups.length; k++) {
                        migrateGroups(selected_groups[k]);
                    }
                }
            }


        });


        //Migrating groups from source to target portal
        function migrateGroups(selected_group) {
            var v_url = v_portalurl + '/sharing/rest/community/createGroup';
            var groupOptions = getOptionsById(selected_group.groupId);
            //var options = {
            //    query: groupOptions,
            //    responseType: "json",
            //    method: "post"
            //};
            groupOptions.responseType = "json";
           // groupOptions.method = "post";
            var LoginMode = $(".tabs-container .active")[0].id;
            $.ajax({
                url: v_url,
                type: "POST",
                crossDomain: true,
                xhrFields: {
                    withCredentials: (LoginMode == "LoginMode3") ? true : false
                },
                data: groupOptions,
                success: function (data) {
                    // mig_count++;
                    var response = data;
                    if (typeof (response) == "string")
                        response = JSON.parse(data);
                    if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                        mig_count++;
                        if (mig_count == selected_groups.length) {
                            AlertMessages("Copy groups", response.error.message, "danger");
                            $(".failure_msg")[0].innerText = response.error.message;
                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "Copy groups: " + response.error.message,
                                isSendEmail: true,
                                destUserName: v_username,
                                destPortalUrl: v_portalurl
                            };
                            LogMessages(options, logFailureMsg);
                            $("#loader")[0].style.display = "none";
                            $("#migrate-success").css("display", "none");
                            $("#migrate-fail").css("display", "block");
                            return
                        }
                    }
                    else {
                        migrateGroupItems(response.group.id, selected_groups[mig_count].groupId);
                        mig_count = mig_count + 1;
                        //if (mig_count == selected_groups.length) {
                        //    $("#migrate-success")[0].style.display = "block";
                        //    $("#loader")[0].style.display = "none";
                        //}
                        //else if (mig_count == selected_groups.length - duplicate_groups.length && isDuplicateGroup) {
                        //    $("#migrate-complete")[0].style.display = "block";
                        //    $("#loader")[0].style.display = "none";
                        //}
                    }
                },
                error: function (data, textStatus, jqXHR) {
                    console.log(textStatus);
                    var options = {
                        userName: sesstionItem.username,
                        portalUrl: sesstionItem.portalurl,
                        message: "Copy groups: " + "Failed to copy groups",
                        isSendEmail: true,
                        destUserName: v_username,
                        destPortalUrl: v_portalurl
                    };
                    LogMessages(options, logFailureMsg);
                    $("#migrate-fail")[0].style.display = "block";
                    $("#migrate-success").css("display", "none");
                    $("#loader")[0].style.display = "none";
                }
            });








            //esriRequest(v_url, options).then(function (response) {
            //    console.log("Success: ", response);
            //    alertflag = false;
            //    migrateGroupItems(response.data.group.id, selected_groups[mig_count].groupId);
            //    mig_count = mig_count + 1;
            //    //if (mig_count == selected_groups.length) {
            //    //    $("#migrate-success")[0].style.display = "block";
            //    //    $("#loader")[0].style.display = "none";
            //    //}
            //    //else if (mig_count == selected_groups.length - duplicate_groups.length && isDuplicateGroup) {
            //    //    $("#migrate-complete")[0].style.display = "block";
            //    //    $("#loader")[0].style.display = "none";
            //    //}
            //}).catch(function (err) {
            //    $("#err-msg").append('<h5>' + err.message + '</h5>');
            //    $("#migrate-fail")[0].style.display = "block";
            //    $("#loader")[0].style.display = "none";
            //});

        }


        //updating targte group with source group parameters
        function updateGroup(target_groupid, src_groupid) {
            var v_url = v_portalurl + '/sharing/rest/community/groups/' + target_groupid + '/update';
            var groupOptions = getOptionsById(src_groupid);
            var options = {
                query: groupOptions,
                responseType: "json",
                method: "post"
            };
            var LoginMode = $(".tabs-container .active")[0].id;
            var groupparams = groupOptions;
            groupparams.responseType = "json",
                groupparams.method = "post"
            $.ajax({
                url: v_url,
                type: "POST",
                crossDomain: true,
                xhrFields: {
                    withCredentials: (LoginMode == "LoginMode3") ? true : false
                },
                data: groupparams,
                success: function (data) {
                    var response = data
                    if (typeof (response) == "string")
                        var response = JSON.parse(data);
                    if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                        if (selected_groups.length == mig_count++) {
                            AlertMessages("Copy groups", response.error.message, "danger");
                            $(".failure_msg")[0].innerText = response.error.message;
                        }
                        $("#loader")[0].style.display = "none";
                        $("#migrate-success").css("display", "none");
                        $("#migrate-fail").css("display", "block");
                        return
                    }
                    else {
                        if (ActionType == "UpdategroupswithItems") {
                            alertflag = false;
                            migrateGroupItems(response.groupId, selected_groups[mig_count].groupId);
                        }
                        if (ActionType == "UpdategroupsContent" && mig_count + errcount + 1 == selected_groups.length) {
                            $("#migrate-success")[0].style.display = "block";
                            $("#loader")[0].style.display = "none";
                            AlertMessages("Copy Groups", "Successfully copied  groups", "success");
                            return;
                        }
                        mig_count = mig_count + 1;
                    }
                },
                error: function (data, textStatus, jqXHR) {
                    errcount++
                    //$("#err-msg").append('<h5>' + err.message + '</h5>');
                    $("#migrate-fail")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                    if (ActionType == "UpdategroupsContent" && errcount == selected_groups.length) {
                        $("#migrate-fail")[0].style.display = "block";
                        $("#migrate-success")[0].style.display = "none";
                        $("#loader")[0].style.display = "none";
                        AlertMessages("Copy Groups", "Failed to copy  groups", "danger");
                        $(".failure_msg")[0].innerText = "Failed to copy groups";
                        return;
                    }
                }
            });







            //esriRequest(v_url, options).then(function (response) {
            //    console.log("Success: ", response);

            //    // migrateGroupItems(response.data.groupId, selected_groups[mig_count].groupId);
            //    if (ActionType == "UpdategroupswithItems") {
            //        alertflag = false;
            //        migrateGroupItems(response.data.groupId, selected_groups[mig_count].groupId);
            //    }
            //    if (ActionType == "UpdategroupsContent" && mig_count + errcount + 1 == selected_groups.length && alertflag) {
            //        $("#migrate-success")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //        AlertMessages("Copy Groups", "Successfully copied  groups", "success");
            //        return;
            //    }
            //    mig_count = mig_count + 1;


            //}).catch(function (err) {
            //    errcount++
            //    $("#err-msg").append('<h5>' + err.message + '</h5>');
            //    $("#migrate-fail")[0].style.display = "block";
            //    $("#loader")[0].style.display = "none";
            //    if (ActionType == "UpdategroupsContent" && errcount == selected_groups.length) {
            //        $("#migrate-fail")[0].style.display = "block";
            //        $("#migrate-success")[0].style.display = "none";
            //        $("#loader")[0].style.display = "none";
            //        AlertMessages("Copy Groups", "Failed to copy  groups", "danger");
            //        return;
            //    }
            //});
        }

        function migrateGroupItems(target_groupid, src_groupid) {
            source_groups_content.forEach(function (groupItems) {
                if (groupItems.groupid == src_groupid) {
                    var items = groupItems.content;
                    var filtereditems = [];
                    if (ActionType == "ArcgisToPortal") {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].type != "Web Experience" && items[i].type != "StoryMap") {
                                filtereditems.push(items[i]);
                            }
                        }
                        items = filtereditems;
                    }
                    if (items.length > 0)
                        loadSourceItemsData(items, target_groupid);
                    else {
                        if (mig_count + 1 == selected_groups.length) {
                            $("#migrate-success")[0].style.display = "block";
                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "Copy groups: " + "Successfully copied  groups",
                                isSendEmail: false,
                                destUserName: v_username,
                                destPortalUrl: v_portalurl
                            };
                            LogMessages(options, logSuccessMsg);
                            $("#loader")[0].style.display = "none";
                            AlertMessages("Copy Groups", "Successfully copied  groups", "success");
                        }
                    }
                }
            });
        }//loading items data form source portal 
        function loadSourceItemsData(items, target_groupid) {
            var itemsList = items;
            var reqArray = [];
            for (i = 0; i < items.length; i++) {

                var dataUrl = Config.portalUrl + "/sharing/rest/content/items/" + items[i].id + '/data';
                var options = {
                    query: { token: v_srcToken, f: "json" },
                    responseType: "json",
                    method: "get"
                };
                var request = esriRequest(dataUrl, options);
                reqArray.push(request);
                // }

            }
            all(reqArray).then(function (results) {
                itemOptionsAll = [];
                var grpname = [];
                for (j = 0; j < results.length; j++) {
                    var itemOptions = getItemOptionsById(itemsList[j], results[j].data);
                    itemOptionsAll.push(itemOptions);
                   // grpname.push(results[j].data.title);
                }

                addItemsToDestination(itemOptionsAll, target_groupid);
            }).catch(function (err) {
                console.log(err);
                // $("#err-msg").append('<h5>' + err.message + '</h5>');
                $("#migrate-fail")[0].style.display = "block";
                $("#loader")[0].style.display = "none";
            });
        }//adding items to destination portal with data.
        function addItemsToDestination(itemOptionsAll, target_groupid) {
            var itemsArry = [];
            var esriReqArray = [];
            for (k = 0; k < itemOptionsAll.length; k++) {
                var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/addItem';
                var options = {
                    query: itemOptionsAll[k],
                    responseType: "json",
                    method: "post"
                };
                var request = esriRequest(v_url, options)
                esriReqArray.push(request);
            }
            all(esriReqArray).then(function (results) {
                console.log(results);
                for (i = 0; i < results.length; i++) {
                    itemsArry.push(results[i].data.id);
                }
                shareItemstoGroup(itemsArry, target_groupid);
            }).catch(function (err) {
                console.log(err);
                // $("#err-msg").append('<h5>' + err.message + '</h5>');

                var options = {
                    userName: sesstionItem.username,
                    portalUrl: sesstionItem.portalurl,
                    message: "Copy groups: Failed to addItem in target portal ",
                    isSendEmail: true,
                    destUserName: v_username,
                    destPortalUrl: v_portalurl
                };
                LogMessages(options, logFailureMsg);

                $("#migrate-fail")[0].style.display = "block";
                $("#loader")[0].style.display = "none";
            });
        }
        function shareItemstoGroup(itemsArry, groupid) {
            var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/shareItems';

            var options = {

                items: itemsArry.join(','),
                groups: groupid,
                f: "json",
                token: v_tarToken,
                responseType: "json",
                method: "post"
            };
            var LoginMode = $(".tabs-container .active")[0].id;

            $.ajax({
                url: v_url,
                type: "POST",
                crossDomain: true,
                data: options,
                xhrFields: {
                    withCredentials: (LoginMode == "LoginMode3") ? true : false
                },
                success: function (data, textStatus, jqXHR) {
                    // mig_count++;
                    var response = data;//JSON.parse(data);
                    if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                        //if (selected_Users.length == mig_count) {
                        AlertMessages("Share item to groups(Target portal)", response.error.message, "danger");
                        $(".failure_msg")[0].innerText = response.error.message;

                        var options = {
                            userName: sesstionItem.username,
                            portalUrl: sesstionItem.portalurl,
                            message: "Copy groups: " + response.error.message,
                            isSendEmail: true,
                            destUserName: v_username,
                            destPortalUrl: v_portalurl
                        };
                        LogMessages(options, logFailureMsg);
                        $("#loader")[0].style.display = "none";
                        $("#migrate-success").css("display", "none");
                        $("#migrate-fail").css("display", "block");
                        return
                    }
                    else {
                        console.log(response);
                        if (mig_count == selected_groups.length) {
                            $("#migrate-success")[0].style.display = "block";
                            $("#loader")[0].style.display = "none";
                            AlertMessages("Copy Groups", "Successfully copied  groups", "success");
                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "Copy groups: Successfully copied groups in target portal ",
                                isSendEmail: false,
                                destUserName: v_username,
                                destPortalUrl: v_portalurl
                            };
                            LogMessages(options, logSuccessMsg);
                        }
                        else if (mig_count == selected_groups.length - duplicate_groups.length && isDuplicateGroup) {
                            $("#migrate-success")[0].style.display = "block";
                            $("#loader")[0].style.display = "none";
                            var options = {
                                userName: sesstionItem.username,
                                portalUrl: sesstionItem.portalurl,
                                message: "Copy groups: Copied groups with errors in target portal ",
                                isSendEmail: true,
                                destUserName: v_username,
                                destPortalUrl: v_portalurl
                            };
                            LogMessages(options, logFailureMsg);
                            AlertMessages("Copy Groups", "Successfully copied  groups with errors", "success");
                        }

                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    // $("#err-msg").append('<h5>' + "share error" + '</h5>');
                    $("#migrate-fail")[0].style.display = "block";
                    $("#loader")[0].style.display = "none";
                }
            });


            //esriRequest(v_url, options).then(function (response) {
            //    console.log(response);
            //    if (mig_count == selected_groups.length) {
            //        $("#migrate-success")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //    }
            //    else if (mig_count == selected_groups.length - duplicate_groups.length && isDuplicateGroup) {
            //        $("#migrate-complete")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //    }
            //}).catch(function (err) {
            //    console.log(err);
            //    $("#err-msg").append('<h5>' + err.message + '</h5>');
            //    $("#migrate-fail")[0].style.display = "block";
            //    $("#loader")[0].style.display = "none";
            //});
        }
    });
}
function verifyDuplicates(src_group) {
    var status = false;
    target_groups.forEach(function (group) {
        if (group.title == src_group.groupName && group.owner == v_username) {
            var markup = '<div class="alert alert-info"><strong>' + group.title + '</strong> Group Already Exists.</div>';
            $("#groups-update").append(markup);
            var obj = { "tar_groupid": group.id, "src_groupid": src_group.groupId, "groupname": group.title };
            duplicate_groups.push(obj);
            status = true;
            //return true;
        }
    });
    // return status;
}
function getOptionsById(Id) {
    var groupOptions = {};
    source_groups.forEach(function (group) {
        if (group.id == Id)
            groupOptions = {
                title: group.title,
                access: group.access,
                description: group.description,
                sortField: group.sortField,
                sortOrder: group.sortOrder,
                protected: group.protected,
                isFav: group.isFav,
                isInvitationOnly: group.isInvitationOnly,
                isReadOnly: group.isReadOnly,
                isViewOnly: group.isViewOnly,
                isFav: group.isFav,
                snippet: group.snippet,
                phone: group.phone,
                tags: group.tags.join(','),
                autoJoin: group.autoJoin,
                thumbnail: group.url + '/info/' + group.thumbnail + '?token=' + v_srcToken,
                // thumbnailUrl: group.url + '/info/' + group.thumbnail + '?token=' + v_srcToken,
                f: "json",
                token: v_tarToken
            }
    });
    return groupOptions;
}
function getItemOptionsById(item, data) {
    var itemOptions = {};
    //  var commonutils = new CommonUtils();
    var v_portalurl = Config.portalUrl;
    if (data)
        textData = JSON.stringify(data);
    else
        textData = null;
    itemOptions = {
        title: item.title,
        access: item.access,
        description: item.description,
        type: item.type,
        culture: item.culture,
        languages: item.languages,
        industries: item.industries,
        snippet: item.snippet,
        metadata: v_portalurl + '/sharing/rest/content/items/' + item.id + '/info/metadata/metadata.xml',
        commentsEnabled: item.commentsEnabled,
        tags: item.tags.join(','),
        url: item.url,
        accessInformation: item.accessInformation,
        extent: item.extent,
        spatialReference: item.spatialReference,
        name: item.name,
        typeKeywords: item.typeKeywords.join(','),
        categories: item.categories.join(','),
        serviceUsername: item.serviceUsername,
        serviceProxyFilter: item.serviceProxyFilter,
        servicePassword: item.servicePassword,
        largeThumbnail: item.largeThumbnail,
        thumbnail: item.thumbnail,
        thumbnailurl: v_portalurl + '/sharing/rest/content/items/' + item.id + '/info/' + item.thumbnail + '?token=' + v_srcToken,
        text: textData,
        f: "json",
        token: v_tarToken
    };
    return itemOptions;
}

