var source_items = [];
var target_items = [];
var selectedItemsList = [];
var temparray = [];
var v_srcToken;
var portalToken;
var v_portalurl;
var itemsList = [];
var selected_items = [];
var ErrList = []; var searchflag = false;
var alloveride = false;
var duplicateItem = []; var migrateflag = true;
var count1 = 0; var count2 = 0; var count3 = 0; var count4 = 0; var itemscount = 0; var err_count = 0; var current = 1;
//var commonutils = new CommonUtils();
var clickflag = true;
var FeatureItem = [];
var nonFeatureItems = []; var tar_portalid;
var featur_succ = 0; var feature_err = 0;
var selectedItemID = null; var success_Flag = false;
var currentItemIndex = 0; var folderList = []; var ALLItems = []; var TargetFoldersList = [];
var CopiedItems = false; var messagesList = []
if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
    window.location.href = "../views/PortalAdmin.html";
}
var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
$(document).ready(function () {
    require(["esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/portal/PortalQueryParams",
        "esri/request",
        "dojo/_base/array",
        "dojo/Deferred",
        "esri/config",
        "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, PortalQueryParams, esriRequest, array, Deferred, esriConfig) {

        includeHeader();
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        //if (typeof (sessionStorage.getItem("DestinationPortalAuth")) != "undefined" || sessionStorage.getItem("DestinationPortalAuth") != null) {
        //    if (sessionStorage.getItem("DestinationPortalAuth") == "OAuth Login") {

        //    }
        //}

        v_portalurl = Config.portalUrl = sesstionItem.portalurl;
        includeMenu('Copy Items to Organization');
        var personalPanelElement = document.getElementById("personalizedPanel");
        $("#personalizedPanel").css("display", "block");
        var anonPanelElement = document.getElementById("anonymousPanel");
        portalToken = sesstionItem.token;
        $(".lds-ring").css("display", "block");
        var queryParams = {
            //q: "owner:" + sesstionItem.username + " AND " + " orgid:" + sesstionItem.portalid,
            q: "owner:" + sesstionItem.username,
            token: portalToken,
            f: "json",
            sortField: "numViews",
            sortOrder: "desc",
            start: 1,
            num: 100
        };
        var FolderParams = {
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            sortField: 'title',
            sortOrder: 'asc'
        };
        fetchAllFolders();
        function fetchAllFolders() {
            folderList = [];
            var url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username;

            var options = {
                query: FolderParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {

                    folderList = response.data.folders;
                    $("#folderdiv").append('<option value="ALL">All Items</span>');
                    for (var m = 0; m < folderList.length; m++) {
                        var option = document.createElement('option');
                        option.text = folderList[m].title;
                        option.value = folderList[m].id;
                        $("#folderdiv").append(option);
                    }

                }).catch(function (err) {
                    console.log(err);
                });


        }
        //$(document).ready(function () {

        $(".breadcrumb_Home").click(function () {

            window.location.reload();
        });
        v_srcToken = portalToken;
        var current_fs, next_fs, previous_fs; //fieldsets
        var opacity;


        setProgressBar(current);

        $(".next").click(function () {

            current_fs = $(this).parent();
            next_fs = $(this).parent().next();

            //Add Class Active
            $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

            //show the next fieldset
            next_fs.show();
            //hide the current fieldset with style
            current_fs.animate({ opacity: 0 }, {
                step: function (now) {
                    // for making fielset appear animation
                    opacity = 1 - now;

                    current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                    });
                    next_fs.css({ 'opacity': opacity });
                },
                duration: 500
            });
            setProgressBar(++current);
        });

        $(".previous").click(function () {

            current_fs = $(this).parent();
            previous_fs = $(this).parent().prev();

            //Remove class active
            $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

            //show the previous fieldset
            previous_fs.show();

            //hide the current fieldset with style
            current_fs.animate({ opacity: 0 }, {
                step: function (now) {
                    // for making fielset appear animation
                    opacity = 1 - now;

                    current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                    });
                    previous_fs.css({ 'opacity': opacity });
                },
                duration: 500
            });
            setProgressBar(--current);
        });
        //});

        function setProgressBar(curStep) {
            var steps = $("fieldset").length;
            var percent = parseFloat(100 / steps) * curStep;
            percent = percent.toFixed();
            $(".progress-bar")
                .css("width", percent + "%")
        }
        var queryParams_folder = {
            f: "json",
            token: portalToken
        };


        $("#folderdiv").change(function () {
            source_items = [];
            var folderid = $(this).val();
            if (folderid == "ALL") {
                source_items = ALLItems;
                $("#sourceItems").empty();
                loadsourceItems(source_items);
            }
            else {

                url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/" + folderid;
                var options = {
                    query: queryParams_folder,
                    responseType: "json"
                };
                esriRequest(url, options)
                    .then(function (response) {
                        source_items = response.data.items;
                        $("#sourceItems").empty();
                        loadsourceItems(source_items);
                    })
            }
        });
        fetchAll_SourceItems(portalToken);
        setTimeout(function () {
            $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
            $("#sign-out").click(function () {
                signOutCredentials(esriId);
            });
        }, 2000);
        function fetchAll_SourceItems() {// get all items list
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(Config.portalUrl + "/sharing/rest/search", options)
                .then(function (response) {


                    if (response.data.results.length != 0) {
                        source_items = response.data.results.concat(source_items);
                        queryParams.start = source_items.length + 1;
                        fetchAll_SourceItems();
                    }
                    else {
                        v_user = 'Current User: ' + sesstionItem.username;
                        $('#source_user').text(v_user);
                        ALLItems = source_items;
                        loadsourceItems(source_items);
                        $(".page_size").css("display", "inline-block");
                        $("#pageSize").on('change', function (event) {
                            $("#sourceItems").jsGrid("option", "pageSize", this.value);
                        });
                    }


                }).catch(function (err) {
                    console.log(err);
                    AlertMessagesinclone("Copy Items", err.message, "danger");
                    $(".lds-ring").css("display", "none");
                    return;
                });
        };

        //$("#sign-out").click(function () {
        //    Config.portalUrlsignOutCredentials(esriId);
        //    sessionStorage.setItem("Accesskey", 'Invalid token');
        //});
        function displaySourceItems() {
            let portal = new Portal({
                url: v_portalurl
            });
            portal.load().then(function (portalObj) {
                anonPanelElement.style.display = "none";
                personalPanelElement.style.display = "block";
                v_user = 'Current User: ' + sesstionItem.username;
                $('#source_user').text(v_user);
                var queryParams = new PortalQueryParams({
                    query: "owner:" + portal.user.username,
                    sortField: "numViews",
                    sortOrder: "desc",
                    num: 100
                });
                portal.queryItems(queryParams).then(loadsourceItems);
            });
        }
        $("#search").keydown(function (event) {
            searchflag = true;
            event.preventDefault();
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#sourceItems").jsGrid("search", { ItemName: uname, ItemType: uname, Owner: uname, Access: uname }).done(function () { });
            }
            else {
                $("#sourceItems").jsGrid("clearFilter").done(function () { });
            }
        });
        function loadsourceItems(items) {
            source_items = [];
            var itemsData = [];
            var validateditems = ["Web Map", "Feature Service", "Dashboard1", "StoryMap1", "Web Mapping Application", "Route Layer", "Web Experience", "Application"]
            array.forEach(items, function (item) {
                if (validateditems.indexOf(item.type) != -1) {
                    source_items.push(item);
                    var itemObj = {
                        Select: item.id,
                        ItemName: item.title,
                        ItemType: item.type,
                        Access: item.access,
                        Owner: item.owner,
                        CreatedOn: item.created,
                        ModifiedOn: item.modified
                    };
                    itemsData.push(itemObj);
                }
            });
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
                    return { from: this._fromPicker.datepicker("getDate") };
                }
            });
            jsGrid.fields.date = DateField;
            $("#sourceItems").jsGrid({
                width: "100%",
                height: "auto",
                filtering: true,
                sorting: true,
                paging: true,
                pageSize: $("#pageSize").value,
                data: itemsData,
                controller: {
                    data: itemsData,
                    loadData: function (filter) {
                        selectedItemsList = [];

                        if (searchflag == false) {
                            return $.grep(this.data, function (item) {
                                return ((!filter.ItemName || item.ItemName.toLowerCase().indexOf(filter.ItemName.toLowerCase()) >= 0)
                                    && (!filter.ItemType || item.ItemType.toLowerCase().indexOf(filter.ItemType.toLowerCase()) >= 0)
                                    && (!filter.Access || item.Access.toLowerCase().indexOf(filter.Access.toLowerCase()) >= 0)
                                    && (!filter.Owner || item.Owner.toLowerCase().indexOf(filter.Owner.toLowerCase()) >= 0)
                                    && (!filter.CreatedOn.from || new Date(item.CreatedOn).toDateString() == filter.CreatedOn.from.toDateString())
                                    && (!filter.ModifiedOn.from || new Date(item.ModifiedOn).toDateString() == filter.ModifiedOn.from.toDateString())
                                );
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return (!filter.ItemName || item.ItemName.toLowerCase().indexOf(filter.ItemName.toLowerCase()) >= 0)
                                    || (!filter.ItemType || item.ItemType.toLowerCase().indexOf(filter.ItemType.toLowerCase()) >= 0)
                                    || (!filter.Access || item.Access.toLowerCase().indexOf(filter.Access.toLowerCase()) >= 0)
                                    || (!filter.Owner || item.Owner.toLowerCase().indexOf(filter.Owner.toLowerCase()) >= 0)
                            });
                        }
                    },
                },
                onPageChanged: function (args) {
                    $('#selectAllCheckbox').prop('checked', false);
                    $(".first-next").addClass("disbaleClass");
                    selected_items = [];
                },
                fields: [
                    {
                        name: "Select", width: 20,
                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllCheckbox")
                                .on("change", function () {

                                    selectedItemsList = [];
                                    if (this.checked) { // check select status
                                        $('.singleCheckbox').each(function () {
                                            this.checked = true;
                                            selectItem($(this)[0].id, $(this)[0], name);
                                        });
                                    } else {


                                        $('.singleCheckbox').each(function () {
                                            this.checked = false;
                                            unselectItem($(this)[0].id);
                                        });
                                        selectedItemsList = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            var itemType = item.ItemType;
                            if (itemType == 'Table' || itemType == 'File Geodatabase' || itemType == 'Service Definition' || itemType == 'Geoprocessing Package' || itemType == 'Code Attachment') {
                                return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select).attr("disabled", true).attr("name", item.ItemName)
                                    .prop("checked", $.inArray(item.ItemName, selectedItemsList) > -1)
                                    .on("change", function () {
                                        $(this).is(":checked") ? selectItem($(this)[0].id, $(this)[0], name) : unselectItem($(this)[0].id);
                                    });
                            }
                            else {
                                return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Select).attr("name", item.ItemName)
                                    .prop("checked", $.inArray(item.ItemName, selectedItemsList) > -1)
                                    .on("change", function () {
                                        $(this).is(":checked") ? selectItem($(this)[0].id, $(this)[0], name) : unselectItem($(this)[0].id);
                                    });
                            }

                        },
                        sorting: false, filtering: false,
                    },
                    {
                        name: "ItemName", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.ItemName).text(item.ItemName)
                        }
                    },
                    {
                        name: "ItemType", type: "select", items: [{ name: "Select", id: "" }, { name: "Application", id: "Application" }, { name: "Feature Service", id: "Feature Service" }, { name: "	Web Mapping Application", id: "Web Mapping Application" }, { name: "Web Map", id: "Web Map" }], valueField: "id", textField: "name", align: "left",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.ItemType).text(item.ItemType)
                        }
                    },
                    {
                        //name: "Access", type: "text", width: 70,
                        name: "Access", type: "select", items: [{ name: "Select", id: "" }, { name: "Public", id: "Public" }, { name: "Private", id: "Private" }, { name: "Shared", id: "Shared" }, { name: "Org", id: "Org" }], valueField: "id", textField: "name", title: "Access", align: "left", visible: true,
                        itemTemplate: function (_, item) {
                            var itemclassName = "badge-success";
                            if (item.Access == "private")
                                itemclassName = "badge-secondary";
                            if (item.Access == "shared")
                                itemclassName = "badge-warning";
                            if (item.Access == "org")
                                itemclassName = "badge-primary";
                            return '<span class="attrClass badge ' + itemclassName + ' p - 1 mb - 3">' + item.Access + '</span>';

                        }
                    },
                    {
                        name: "Owner", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Owner).text(item.Owner)
                        }
                    },
                    {
                        name: "CreatedOn", type: "date", title: "Created Date", align: "center",
                        itemTemplate: function (value) {
                            return new Date(value).toLocaleDateString()
                        }
                    },
                    {
                        name: "ModifiedOn", type: "date", title: "Modified Date", align: "center",
                        itemTemplate: function (value) {
                            return new Date(value).toLocaleDateString()
                        }
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

                ],
                rowClick: function (args) {
                    sel_type = args.item.ItemType;
                    if (sel_type == 'Table' || sel_type == 'File Geodatabase' || sel_type == 'Service Definition' || sel_type == 'Geoprocessing Package' || sel_type == 'Code Attachment') {

                        AlertMessagesinclone("Warning !", "Unsupported Type For Cloning", "warning");
                    }
                },
                rowClass: function (item) {
                    sel_type = item.ItemType;
                    if (sel_type == 'Table' || sel_type == 'File Geodatabase' || sel_type == 'Service Definition' || sel_type == 'Geoprocessing Package' || sel_type == 'Code Attachment') {
                        return 'disableRow';
                    }
                }
            });

            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");

            $(".first-next").addClass("disbaleClass");

            var selectItem = function (item, name) {
                selected_items.push(item);
                $(".first-next").removeClass("disbaleClass");
                if (selected_items.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
                e = name.name;


            };
            var unselectItem = function (item) {

                selected_items = $.grep(selected_items, function (i) {
                    return i !== item;
                });
                $(".first-next").removeClass("disbaleClass");
                if (selected_items.length == 0) {
                    $(".first-next").addClass("disbaleClass");
                }
                if (selected_items.length == 0) {
                    $('#selectAllCheckbox').attr('checked', false);
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };

            $(".lds-ring").css("display", "none");
            // setTimeout(function () { // for fetching items data
            for (var i = 0; i < source_items.length; i++) {
                loadItemsData(source_items, i)
            }
            // }, 3000);

        }
        function loadItemsData(source_items, i) {
            var dataUrl = Config.portalUrl + '/sharing/rest/content/items/' + source_items[i].id + '/data';
            var options = {
                query: { token: portalToken, f: "json" },
                responseType: "json",
                method: "get"
            };
            esriRequest(dataUrl, options).then(function (response) {
                var itemArray = response.url.split("/");
                var itemid = itemArray[itemArray.length - 2];
                for (var i = 0; i < source_items.length; i++) {
                    if (source_items[i].id == itemid) {
                        source_items[i].Iteminfo = response.data
                        //ItemsData.push({ id: ItemList[i].id, data: response.data });
                        break
                    }
                }
            }).catch(function (err) {
                source_items[i].Iteminfo = null
                //ItemsData.push({ id: ItemList[i].id, data: null })
                console.log(err);
            });
        }
        //$(".allowContentupdation").click(function () {

        //    if ($(".allowContentupdation")[0].checked) {
        //        $("#ServiceUpdation").css("display", "block");
        //        $("#progressbar").addClass("CloneItemsBar")
        //    }
        //    else {
        //        $("#ServiceUpdation").css("display", "none");
        //        $("#progressbar").removeClass("CloneItemsBar")
        //    }
        //})

    });
});

$("#Targetarcgisonline").click(function () {
    migrateflag = true;
    loadTargetPortal("Arcgisonline");
    if (sesstionItem.type == "Arcgisonline") {
        ActionType = "ArcgisToArcgisonline"
    }
    else {
        ActionType = "PortalToArcgis";
    }
})
$("#Targetportal").click(function () {
    migrateflag = true;

    if (sesstionItem.type == "PortalforArcgis") {
        ActionType = "PortalToPortal"
    }
    else {
        ActionType = "ArcgisToPortal"
    }
    $("#PortalLoginForm").hide();


    for (var i = 0; i < selected_items.length; i++) {
        for (var j = 0; j < source_items.length; j++) {
            if (selected_items[i] == source_items[j].id) {
                var Itemname = source_items[j].title;
                if (source_items[j].type == "Feature Service") {
                    if (/^[a-zA-Z0-9_]*$/.test(Itemname)) {

                    }
                    else {
                        AlertMessagesinclone("Copy Items", Itemname + " The title of a service may only contain alphanumeric characters or underscores. ", "warning");
                        return;
                    }
                }
                else {
                    if (Itemname.indexOf(">") != -1 || Itemname.indexOf("<") != -1) {
                        AlertMessagesinclone("Copy Items", Itemname + " The title cannot contain any of these characters: < or >. ", "warning");
                        return;
                    }
                }
                break;
            }

        }
    }
    $('#Targetportal').attr('data-target', '#PortalLoginForm');
    loadTargetPortal("PortalforArcgis");

})

function loadTargetPortal(AccountType) {
    require(["esri/portal/Portal", "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager", "esri/request", "esri/portal/PortalQueryParams",
        "dojo/_base/array", "dojo/promise/all", "dojo/request", "esri/config", "dojo/domReady!"
    ], function (Portal, OAuthInfo, esriId, esriRequest, PortalQueryParams, array, all, request, esriConfig) {
        var v_username = null;
        var v_tarToken;
        var mig_count = 0;
        clickflag = true;
        var v_featServUrl;
        var new_servcieUrl;
        var queryParams = {};
        var targetfeatServices = [];
        var targetServices = [];
        $("#LoginforPortal").prop("disabled", false);
        $('input[name="Layerdepedency"]').click(function () {
            var $radio = $(this);
            $radio.siblings('input[name="Layerdepedency"]').data('waschecked', false);
        });
        if (AccountType == "PortalforArcgis") {
        }

        if (AccountType == "Arcgisonline") {
            v_portalurl = Config.arcGisOnline; // "https://www.arcgis.com"
            var appIdJson = esriId;
            var esriJSAPIOAuth = sessionStorage.esriJSAPIOAuth;
            sessionStorage.setItem("esriJSAPIOAuthBackup", esriJSAPIOAuth);
            sessionStorage.setItem("esriIdBackup", JSON.stringify(appIdJson));
            esriId.destroyCredentials();
            sessionStorage.removeItem("esriJSAPIOAuth");
            localStorage.removeItem("esriJSAPIOAuth");// when user selects remember me option preventing auto login for destination portal
            var info2 = new OAuthInfo({
                appId: Config.appId,
                popup: true
            });
            esriId.registerOAuthInfos([info2]);
            esriId.getCredential(info2.portalUrl + "/sharing", {
                oAuthPopupConfirmation: false
            }).then(
                function (cred) {
                    displayTargetItems(cred);
                    AlertMessagesinclone("Signin Arcgis Online", "Successfully signed target portal", "success");
                })
                .catch(function (e) {
                    console.log(e);
                    if (e.message != "ABORTED") {
                        AlertMessagesinclone("Signin Arcgis Online", "Failed to login target portal", "danger");
                        return
                    }
                });
        }
        $("#LoginforPortal").click(function () {
            // validating portal url
            if (clickflag) {
                clickflag = false;
                $("#LoginforPortal").prop("disabled", true);
                var LoginMode = $(".tabs-container .active")[0].id;

                var portalurl = $("#portalurl").val();
                v_portalurl = portalurl;
                //sessionStorage.addItem("DestinationPortalAuth", "LoginMode");
                if (LoginMode == "LoginMode2")
                    LoginWithAppID(portalurl);
                else {
                    GenerateTokenForPortal();
                }
                // GenerateTokenForPortal();
            }
        });
        $("#ReturnHome").click(function () {
            window.location.reload();
        });
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
                    AlertMessagesinclone("Signin portal for Arcgis", "Successfully signed target portal", "success");
                    displayTargetItems(response);

                }).catch(function (err) {
                    if (err.message != "Failed to fetch") {
                        var msg = err.message + err.details.messages
                    }
                    else {
                        var msg = err.message;
                    }
                    AlertMessagesinclone("Signin Portal for Arcgis", msg, "danger");
                    $("#LoginforPortal").removeClass("disbaleClass");
                    $("#LoginforPortal").prop("disabled", false);
                    clickflag = true;
                    console.log(err);
                    return;
                });
        };
        function displayTargetItems(cred) {

            var portal = new Portal({
                url: v_portalurl,
                token: (typeof (cred.data) != "undefined") ? cred.data.token : cred.token
                //token: (AccountType == "PortalforArcgis") ? cred.data.token : cred.token
            });
            v_tarToken = (typeof (cred.data) != "undefined") ? cred.data.token : cred.token; //(AccountType == "PortalforArcgis") ? cred.data.token : cred.token;
            portal.load().then(function (portalObj) {
                destinationPortal = portalObj;
                // v_username = (AccountType == "PortalforArcgis") ? $("#defaultForm-username").val() : portal.user.username
                //  v_username = portalObj.user.username;
                if (AccountType == "PortalforArcgis") {
                    var LoginMode = $(".tabs-container .active")[0].id;
                    if (LoginMode == "LoginMode1")
                        v_username = $("#defaultForm-username").val()
                    else
                        v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;
                }
                else
                    v_username = (portalObj.user != null && portalObj.user != undefined) ? portalObj.user.username : portal.user.username;


                sessionStorage.setItem("esriJSAPIOAuth", esriJSAPIOAuth);
                esriId.initialize(appIdJson);
                tar_portalid = (sesstionItem.type == "PortalforArcgis") ? portal.id : portal.id;
                queryParams = {
                    q: "owner:" + v_username,
                    token: v_tarToken,
                    f: "json",
                    start: 1,
                    num: 100
                };
                fetchAllfolders1()//TargetFoldersList
                //var ItemParams = {
                //    q: "owner:" + sesstionItem.username + " AND " + " orgid:" + sesstionItem.portalid,
                //    //q:  " orgid:" + sesstionItem.portalid,
                //    token: portalToken,
                //    f: "json",
                //    start: 1,
                //    num: 100,
                //    sortField: 'title',
                //    sortOrder: 'asc'
                //};
                loadtargetItems();

                var uniqueItems = [];
                for (var m = 0; m < selected_items.length; m++) { // filter items if any duplicate exists
                    if (uniqueItems.indexOf(selected_items[m]) == -1) {
                        uniqueItems.push(selected_items[m]);
                    }
                }

                selected_items = uniqueItems;


                var selectedWebMaps = [];
                var chkboxes = $('#sourceItems').find('input[type="checkbox"]');
                for (var i = 0; i < selected_items.length; i++) {
                    //if (chkboxes[i].checked) {
                    var itemid = selected_items[i];
                    source_items.forEach(function (item) {
                        if (item.id == itemid) {
                            if (item.type == "Web Map" && item.Iteminfo != null & item.Iteminfo != undefined) {
                                var OprDataExists = false; var TableDataExists = false;
                                if (typeof (item.Iteminfo.operationalLayers) != "undefined" && typeof (item.Iteminfo.operationalLayers) != "null")
                                    OprDataExists = true;
                                if (typeof (item.Iteminfo.tables) != "undefined" && typeof (item.Iteminfo.tables) != "null")
                                    TableDataExists = true;

                                if (OprDataExists) {
                                    if (item.Iteminfo.operationalLayers.length != 0) {
                                        selectedWebMaps.push(item);
                                        OprDataExists = false; TableDataExists = false;
                                    }

                                }
                                if (TableDataExists) {
                                    if (item.Iteminfo.operationalLayers.length != 0) {
                                        selectedWebMaps.push(item);
                                        OprDataExists = false; TableDataExists = false;
                                    }

                                }


                            }
                        }
                    });
                }
                $(".allowContentupdation")[0].checked = true;
                if (selectedWebMaps.length == 0) {
                    $(".allowContentupdation")[0].checked = false
                }
                $(".Updated_content").css("display", "none");
                if ($(".allowContentupdation")[0].checked && selectedWebMaps.length != 0) {
                    $("#login-done").click();
                    //loadWebMapinfo();
                    $(".Updated_content").css("display", "block");
                }
                else {
                    loadSelectedItems();
                    $(".allowContentupdation")[0].checked = false;
                    $("#login-done").click();
                    $("#manage-service").click();
                }

                $(".createFolder_target").click(function (e) {
                    e.preventDefault();
                })
                $(".saveFolder").click(function (evt) {
                    evt.preventDefault();
                    var LoginMode = $(".tabs-container .active")[0].id;
                    var folderName = $("#foldername")[0].value;
                    if (folderName == '') {
                        AlertMessages("Folder", "Please enter folder name", "warning");
                        return;
                    }
                    if (folderName.indexOf("<") != -1 || folderName.indexOf(">") != -1) {
                        AlertMessages("Folder Name", "Name cannot contain any of these characters:< or >.", "warning");
                        return;
                    }
                    for (var m = 0; m < folderList.length; m++) {
                        if (folderName == folderList[m].title) {
                            AlertMessagesinclone("Create folder", folderName + " already exits,enter different name", "warning");
                            return;
                        }
                    }
                    url = v_portalurl + "/sharing/rest/content/users/" + v_username + "/createFolder";
                    var folderopt = {
                        folderName: folderName,
                        title: folderName,
                        f: "json",
                        token: v_tarToken,
                        responseType: "json",
                        method: "post"
                    };
                    try {
                        $.ajax({
                            url: url,
                            type: "POST",
                            xhrFields: {
                                withCredentials: (LoginMode == "LoginMode3") ? true : false
                            },
                            crossDomain: true,
                            data: folderopt,
                            success: function (data, textStatus, jqXHR) {
                                var response = data;
                                if (typeof (data) == "string") {
                                    response = JSON.parse(data);
                                }
                                if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

                                    AlertMessages("Create folder", response.error.message + response.error.details[0], "danger");
                                    return


                                }
                                else {
                                    $("#foldername")[0].value = "";
                                    $("#Folder-modal").hide();
                                    var option = document.createElement('option');
                                    option.text = response.folder.title;
                                    option.value = response.folder.id;
                                    $(".folder_target").append(option);
                                    var optionValues = [];
                                    $('.folder_target option').each(function () {
                                        if ($.inArray(this.value, optionValues) > -1) {
                                            $(this).remove()
                                        } else {
                                            optionValues.push(this.value);
                                        }
                                    });
                                    AlertMessages("Create Folder", "Successfully created folder in destination folder", "success");
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(errorThrown);
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }


                })
            });
        }
        function fetchAllfolders1() { // fetch all folders
            var url = v_portalurl + "/sharing/rest/content/users/" + v_username;
            var FolderParams = {
                token: v_tarToken,
                f: "json",
                start: 1,
                num: 100,
                sortField: 'title',
                sortOrder: 'asc'
            };

            var options = {
                query: FolderParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    folderList = response.data.folders;
                    TargetFoldersList = folderList;
                    for (var m = 0; m < folderList.length; m++) {
                        var option = document.createElement('option');
                        option.text = folderList[m].title;
                        option.value = folderList[m].id;
                        $(".folder_target").append(option);
                    }
                    var optionValues = [];
                    $('.folder_target option').each(function () {
                        if ($.inArray(this.value, optionValues) > -1) {
                            $(this).remove()
                        } else {
                            optionValues.push(this.value);
                        }
                    });
                }).catch(function (err) {
                    console.log(err);
                });
        };

        function loadtargetItems() {

            var options = {
                query: queryParams,
                responseType: "json",
                sortField: "title",
                sortOrder: "desc",
                num: 100

            };
            //`${Config.portalUrl}/sharing/rest/search`
            esriRequest(v_portalurl + "/sharing/rest/content/users/" + v_username, options)
                // esriRequest(v_portalurl + "/sharing/rest/search", options)
                .then(function (response) {
                    console.log(response);
                    if (response.data.items.length != 0) {
                        itemsList = response.data.items.concat(itemsList);
                        queryParams.start = itemsList.length + 1;
                        loadtargetItems();
                    }
                    else {

                        var queryParams_Targetfolder = {
                            f: "json",
                            token: v_tarToken
                        };

                        var folder_count = 0;
                        for (var i = 0; i < TargetFoldersList.length; i++) {

                            var folderurl = v_portalurl + "/sharing/rest/content/users/" + v_username + "/" + TargetFoldersList[i].id;
                            var options = {
                                query: queryParams_Targetfolder,
                                responseType: "json"
                            };
                            esriRequest(folderurl, options)
                                .then(function (response) {
                                    //source_items = response.data.items;
                                    itemsList = itemsList.concat(response.data.items);
                                    folder_count = folder_count + 1;
                                    if (folder_count == TargetFoldersList.length) {
                                        LoadServiceInfo(itemsList);
                                    }
                                }).catch(function (err) {
                                    console.log(err);
                                    folder_count = folder_count + 1;
                                    if (folder_count == TargetFoldersList.length) {
                                        LoadServiceInfo(itemsList);
                                    }
                                });
                        }


                    }


                }).catch(function (err) {
                    console.log(err);
                });
        }

        function LoadServiceInfo(itemsList) {
            array.forEach(itemsList, function (item) {

                if (item.type == "VectorTileLayer") {

                    if (item.styleUrl != null && item.styleUrl != "null") {

                        targetServices.push({ "name": item.title, "url": item.styleUrl, itemid: item.id, "type": item.type });
                    }

                }
                else if (typeof (item.url) != "undefined") {
                    if (item.url != null && item.url != "null") {

                        targetServices.push({ "name": item.title, "url": item.url, itemid: item.id, "type": item.type });
                    }

                }
                if (item.type == 'Feature Service')
                    targetfeatServices.push({ "name": item.title, "url": item.url, itemid: item.id, "type": item.type });
            });
            loadWebMapinfo();

        };
        function loadWebMapinfo() {

            //selected_items = [];
            var selectedWebMaps = [];
            var Urldomains = [];
            $('#sel_items').empty();
            var chkboxes = $('#sourceItems').find('input[type="checkbox"]');
            for (var i = 0; i < selected_items.length; i++) {
                // if (chkboxes[i].checked) {
                var itemid = selected_items[i];
                // selected_items.push(selectedItemsList[i]);
                source_items.forEach(function (item) {
                    if (item.id == itemid) {
                        if (item.type == "Web Map") {
                            selectedWebMaps.push(item);
                        }

                        var list = document.createElement("li");
                        list.className = "list-group-item";
                        list.textContent = item.title;
                        $('#sel_items').append(list);
                    }
                });
                //  }
            }
            $("#items-control").empty();
            var node1 = "<div class='update_Webmap'>" +
                "<div class='form-group row'><label class='col-sm-4'>Find Text</label><div class='col-sm-8'><input type='text' list='origServiceUrlList' class='form-control SearchContent' required /></div>" +
                "<datalist id='origServiceUrlList'><option value='https://mafpgisdev.maf.ae'>https://mafpgisdev.maf.ae</option><option value='https://cdn.arcgis.com'>https://cdn.arcgis.com</option></datalist>" +
                "</div > " +
                "<div class='form-group row'><label class='col-sm-4'>Replace Text</label><div class='col-sm-8'><input type='text' class='form-control ReplaceContent' required /></div></div>" +
                "<div style='display:none;' class='form-group row'><label class='col-sm-12'>Found <span class='Matchedtext'></span> matches in webmap service urls</label></div>" +
                "<div class='text-center'><button type='button' class='btn btn-sm btn-primary findtext mr-1'>Find</button><button type='button' class='btn btn-sm btn-primary replaceall mr-1'>Replace</button><button type='button' class='btn btn-sm btn-secondary clearall'>Clear</button></div>"
                + "</div><div class='clearfix'></div>"

            var itemnode = '';
            for (var i = 0; i < selectedWebMaps.length; i++) {
                var contentNode = "";
                var oprLayers = selectedWebMaps[i].Iteminfo;
                if (oprLayers != null) {
                    contentNode = contentNode + "<hr/><div class='contentlist'><div  id= " + selectedWebMaps[i].id + "> <h4 class=''>" + selectedWebMaps[i].title + " </h4> </div><div>"

                    itemnode = itemnode + contentNode;

                    if (typeof (oprLayers.operationalLayers) != "undefined") {
                        if (oprLayers.operationalLayers.length != 0) {
                            if (oprLayers.operationalLayers[0].layerType != "ArcGISFeatureLayer") {


                                var oprContent = "<div class='operationlayers'><h6 class='badge bg-primary text-white text-uppercase mb-5'>Operation Layers</h6>";
                                for (var j = 0; j < oprLayers.operationalLayers.length; j++) {
                                    if (oprLayers.operationalLayers[j].layerType == "VectorTileLayer") {

                                        var domainurl = oprLayers.operationalLayers[j].styleUrl.split("/");
                                        if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                            Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                        oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.operationalLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title =" + oprLayers.operationalLayers[j].styleUrl + "  id= " + selectedWebMaps[i].id + "_" + oprLayers.operationalLayers[j].id + " value=" + oprLayers.operationalLayers[j].styleUrl + " name=" + oprLayers.operationalLayers[j].title.replace(/\s/g, '') + " WebmapId=" + selectedWebMaps[i].id + " webmapname=" + selectedWebMaps[i].title + " disabled readonly ></div></div>"

                                    }
                                    else {
                                        if (typeof (oprLayers.operationalLayers[j].url) != "undefined") {
                                            var domainurl = oprLayers.operationalLayers[j].url.split("/");
                                            if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                                Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                            oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.operationalLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title =" + oprLayers.operationalLayers[j].url + "  id= " + selectedWebMaps[i].id + "_" + oprLayers.operationalLayers[j].id + " value=" + oprLayers.operationalLayers[j].url + " name=" + oprLayers.operationalLayers[j].title.replace(/\s/g, '') + " WebmapId=" + selectedWebMaps[i].id + " webmapname=" + selectedWebMaps[i].title + " disabled readonly ></div></div>"
                                        }

                                    }

                                }
                                oprContent = oprContent + "</div>";
                                itemnode = itemnode + oprContent;
                            }
                        }
                    }

                    if (typeof (oprLayers.baseMap) != "undefined") {
                        var basemapContent = "<div class='basemapLayers'><h6>BaseMap Layers</h6>";
                        for (var j = 0; j < oprLayers.baseMap.baseMapLayers.length; j++) {

                            if (oprLayers.baseMap.baseMapLayers[j].layerType == "VectorTileLayer") {
                                var domainurl = oprLayers.baseMap.baseMapLayers[j].styleUrl.split("/");
                                if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                    Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + oprLayers.baseMap.baseMapLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' id= " + selectedWebMaps[i].id + "_" + oprLayers.baseMap.baseMapLayers[j].id + " value=" + oprLayers.baseMap.baseMapLayers[j].styleUrl + " name=" + oprLayers.baseMap.baseMapLayers[j].title.replace(/\s/g, '') + " WebmapId=" + selectedWebMaps[i].id + " webmapname=" + selectedWebMaps[i].title + " disabled readonly ></div></div>"
                            }
                            else {
                                if (typeof (oprLayers.baseMap.baseMapLayers[j].url) != "undefined") {
                                    var domainurl = oprLayers.baseMap.baseMapLayers[j].url.split("/");
                                    if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                        Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                    basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + oprLayers.baseMap.baseMapLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' id= " + selectedWebMaps[i].id + "_" + oprLayers.baseMap.baseMapLayers[j].id + " value=" + oprLayers.baseMap.baseMapLayers[j].url + " name=" + oprLayers.baseMap.baseMapLayers[j].title.replace(/\s/g, '') + " WebmapId=" + selectedWebMaps[i].id + " webmapname=" + selectedWebMaps[i].title + " disabled readonly ></div></div>"
                                }

                            }
                        }
                        basemapContent = basemapContent + "</div>";
                        itemnode = itemnode + basemapContent;
                    }

                    if (typeof (oprLayers.tables) != "undefined") {
                        if (oprLayers.tables.length != 0) {
                            var TableContent = "<div class='TableLayers'><div><h6 class='badge bg-primary text-white text-uppercase mb-5'>Tables</h6></div>";
                            for (var j = 0; j < oprLayers.tables.length; j++) {
                                var domainurl = oprLayers.tables[j].url.split("/");
                                if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                    Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                TableContent = TableContent + "<div class='form-group row'><label class='col-sm-4'>" + oprLayers.tables[j].title + "</label ><div class='col-sm-8'><input type='url' class='form-control' title=" + oprLayers.tables[j].url + " id= " + selectedWebMaps[i].id + "_" + oprLayers.tables[j].id + " value=" + oprLayers.tables[j].url + " name=" + oprLayers.tables[j].title.replace(/\s/g, '') + " WebmapId=" + selectedWebMaps[i].id + " webmapname=" + selectedWebMaps[i].title + " disabled readonly ></div></div>"
                            }
                            TableContent = TableContent + "</div>";
                            itemnode = itemnode + TableContent;
                        }
                    }

                    itemnode = itemnode + "</div>";
                }
            }
            $("#items-control").append(node1).append(itemnode);
            $(".update_Webmap button").prop("disabled", false);
            var opt = '';
            for (var i = 0; i < Urldomains.length; i++) {
                opt = opt + "<option value=" + Urldomains[i] + ">" + Urldomains[i] + "</option>";
            }
            // $(".getselectedItem").addClass("disbaleClass");
            if (Urldomains.length == 0) {
                $("#items-control").append("<span>No Layers found for replacing</span>");
                $(".getselectedItem").removeClass("disbaleClass");
                $(".Updated_content").css("display", "none");
                $(".update_Webmap button").prop("disabled", true);
            }
            //else {
            //    $("#items-control").append(itemnode);
            //}
            $("#origServiceUrlList").empty().append(opt);
            $(".Matchedtext")[0].innerText = 0;

            $(".findtext").click(function () {
                $("#items-control .form-control").removeClass("searchedText");
                var searchstring = $(".SearchContent")[0].value;
                var count = 0;
                $(".contentlist input[type=url]").each(function (item) {
                    if ($(this).val().indexOf(searchstring) != -1) {
                        count++
                        $(this).css("background", '#cae6ca');
                    }
                })
                $(".Matchedtext")[0].innerText = count;
            });
            $(".replaceall").click(function () {
                //temparray = [];
                //selectedItemsList = [];
                var searchstring = $(".SearchContent")[0].value;
                var replacedstring = $(".ReplaceContent")[0].value;
                if (replacedstring == "") {
                    AlertMessagesinclone("Replace text", "Please enter text for replacing", "warning");
                    return;
                }
                $(".contentlist input[type=url]").each(function (item) {
                    if ($(this).val().indexOf(searchstring) != -1) {
                        $(this).css("background", '#cae6ca');
                        $(".getselectedItem").removeClass("disbaleClass");
                        var replacedcontent = $(this).val().replace(searchstring, replacedstring);



                        //temparray.push({ "id": this.id, "url": $("#" + this.id)[0].value, "name": this.name, webmapId: $(this).attr("webmapid") })
                        var oldUrl = $("#" + this.id)[0].value;
                        $("#" + this.id)[0].value = replacedcontent;
                        var textmatchFound = false;
                        for (var i = 0; i < selectedItemsList.length; i++) {
                            if (selectedItemsList[i].id == this.id.replace(($(this).attr("webmapid") + "_"), '')) {
                                selectedItemsList[i].newUrl = replacedcontent;
                                textmatchFound = true;
                                break;
                            }
                        }
                        if (textmatchFound == false)
                            selectedItemsList.push({ "id": this.id.replace(($(this).attr("webmapid") + "_"), ''), "url": oldUrl, "newUrl": replacedcontent, "name": this.name, "webmapId": $(this).attr("webmapid"), "webmapname": $(this).attr("webmapname") });


                    }
                })
                if (selectedItemsList.length != 0)
                    AlertMessagesinclone("Replace text", "Successfully replaced text", "success");

            });
            $(".clearall").click(function () {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    $("#" + selectedItemsList[i].webmapId + "_" + selectedItemsList[i].id)[0].value = selectedItemsList[i].url;
                    $("#" + selectedItemsList[i].webmapId + "_" + selectedItemsList[i].id).css("background", '');
                }
                $(".getselectedItem").addClass("disbaleClass");
                selectedItemsList = [];
                if (selectedItemsList.length == 0) {
                    $(".Updated_content").css("display", "none");
                }
            })
        }
        $(".mig-previous").click(function () {
            if ($(".allowContentupdation")[0].checked == false) {
                $(".manage-previous").click();
            }
        });
        $("#manage-service").click(function () {
            if ($(".allowContentupdation")[0].checked) {
                loadSelectedItems();
                $("#source_webmap").empty();
                $("#Modified-webmaps").empty();
                for (var i = 0; i < selectedItemsList.length; i++) {


                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate" title=' + selectedItemsList[i].url + ' >' + selectedItemsList[i].name + ":<br/>" + selectedItemsList[i].url + '</a>'
                    var htmlContent1 = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate" title=' + selectedItemsList[i].newUrl + ' >' + selectedItemsList[i].name + ":<br/>" + selectedItemsList[i].newUrl + '</a>'

                    $('#source_webmap').append(htmlContent);
                    $('#Modified-webmaps').append(htmlContent1);

                }
                if (selectedItemsList.length == 0) {
                    $(".Updated_content").css("display", "none");
                }
            }
        })

        function loadSelectedItems() {
            $('#sel_items').empty();
            for (var i = 0; i < selected_items.length; i++) {
                var itemid = selected_items[i];
                source_items.forEach(function (item) {
                    if (item.id == itemid) {

                        var htmlContent = '<div class="dt-widget__item">' +
                            //'<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + item.title + " (" + item.type + ")" + '</a>' +
                            '<span style="float:right;display:none"  class="' + itemid + '_1' + ' progress_sec"><span style="color:#673AB7"  class=' + itemid + '_lbl ></span><span class="spinner-border text-success" id="' + itemid + '_load"></span></span>'


                        $('#sel_items').append(htmlContent);
                    }
                });
            }
            $(".itemCount")[0].innerText = selected_items.length;
        }

        $("#items-migrate-btn").click(function () {
            if (migrateflag) {
                migrateflag = false;
                $("#update-items").click(function () {
                    $("#manageduplicates")[0].style.display = "none";
                    $("#loader")[0].style.display = "none";
                    alloveride = true;
                    var itemstr = [];
                    for (var i = 0; i < duplicateItem.length; i++) {//{ "tar_itemid": targetfeatServices[j].itemid, "src_itemid": source_items[m].id, "itemname": source_items[m].title }
                        itemstr.push(duplicateItem[i].tar_itemid);
                    }
                    var url = v_portalurl + "/sharing/rest/content/users/" + v_username + "/deleteItems";
                    var queryParams = {
                        force: true,
                        items: itemstr.join(","),
                        f: "json",
                        token: v_tarToken,
                        responseType: "json",
                        method: "post"
                    };

                    $.ajax({
                        url: url,
                        type: "POST",
                        crossDomain: true,
                        data: queryParams,
                        success: function (response) {
                            count1++;
                            var response = response;//JSON.parse(data);
                            if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                                if (duplicateItem.length == count1) {
                                    // Config.portalUrlAlertMessages("Copy Items", response.error.message, "danger");
                                    $(".failure_msg")[0].innerText = response.error.message;
                                }
                                $("#loader")[0].style.display = "none";
                                $("#migrate-success").css("display", "none");
                                $("#migrate-fail").css("display", "block");
                                return
                            }
                            else {

                                $("#manageduplicates").css("display", "none");
                                CompleteItemMigration();
                            }
                        },
                        error: function (data, textStatus, jqXHR) {
                            console.log(textStatus);
                            alert("Error in ajax call");
                        }
                    });



                });
                $("#no-update-req").click(function () {
                    $("#manageduplicates")[0].style.display = "none";
                    $("#loader")[0].style.display = "none";
                    alloveride = false;
                    CompleteItemMigration();
                    $("#manageduplicates").css("display", "none");

                });
                mig_count = 0; err_count = 0;
                if (selected_items.length == 0) {
                    AlertMessagesinclone("Warning !", "Please select item", "warning");
                    return;
                }
                duplicateItem = [];
                if ($(".allowContentupdation")[0].checked) { // update content for selected webmaps
                    $("#source_webmap").empty();
                    $("#Modified-webmaps").empty();
                    for (var i = 0; i < source_items.length; i++) {
                        for (var j = 0; j < selectedItemsList.length; j++) {
                            if (source_items[i].id == selectedItemsList[j].webmapId) {
                                // var opr = source_items[i].Iteminfo;
                                var oprLayers = source_items[i].Iteminfo;
                                if (oprLayers != null && oprLayers != undefined) {

                                    if (typeof (oprLayers.operationalLayers) != "undefined") {
                                        for (var a = 0; a < oprLayers.operationalLayers.length; a++) {
                                            if (oprLayers.operationalLayers[a].layerType == "VectorTileLayer") {

                                                if (selectedItemsList[j].name == oprLayers.operationalLayers[a].title.replace(/\s/g, '')) {
                                                    oprLayers.operationalLayers[a].styleUrl = selectedItemsList[j].newUrl;
                                                    oprLayers.operationalLayers[a].itemId = "";
                                                    for (var m = 0; m < targetServices.length; m++) {

                                                        if (targetServices[m].styleUrl.toLowerCase() == oprLayers.operationalLayers[a].styleUrl.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                            oprLayers.operationalLayers[a].itemId = targetServices[m].itemid;
                                                            oprLayers.operationalLayers[a].title = targetServices[m].name;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }

                                            else {
                                                if (selectedItemsList[j].name == oprLayers.operationalLayers[a].title.replace(/\s/g, '')) {
                                                    oprLayers.operationalLayers[a].url = selectedItemsList[j].newUrl;
                                                    oprLayers.operationalLayers[a].itemId = "";
                                                    for (var m = 0; m < targetServices.length; m++) {

                                                        if (targetServices[m].url.toLowerCase() == oprLayers.operationalLayers[a].url.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                            oprLayers.operationalLayers[a].itemId = targetServices[m].itemid;
                                                            oprLayers.operationalLayers[a].title = targetServices[m].name;
                                                            break;
                                                        }
                                                    }
                                                    break;
                                                }

                                            }

                                        }
                                        //targetServices targetServices.push({ "name": item.title, "url": item.url, itemid: item.id });
                                    }
                                    if (typeof (oprLayers.baseMap) != "undefined") {
                                        for (var b = 0; b < oprLayers.baseMap.baseMapLayers.length; b++) {

                                            if (oprLayers.baseMap.baseMapLayers[b].title.replace(/\s/g, '') == selectedItemsList[j].name && oprLayers.baseMap.baseMapLayers[b].type == "VectorTileLayer") {
                                                oprLayers.baseMap.baseMapLayers[b].styleUrl = selectedItemsList[j].newUrl;
                                                oprLayers.baseMap.baseMapLayers[b].itemId = "";
                                                var vectorServiceURL = oprLayers.baseMap.baseMapLayers[b].styleUrl.toLowerCase();

                                                vectorServiceURL = vectorServiceURL.replace("/resources/styles/root.json", "");
                                                for (var n = 0; n < targetServices.length; n++) {

                                                    if (targetServices[n].url.toLowerCase() == vectorServiceURL.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.baseMap.baseMapLayers[b].itemId = targetServices[n].itemid;
                                                        oprLayers.baseMap.baseMapLayers[b].title = targetServices[n].name;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                            if (oprLayers.baseMap.baseMapLayers[b].title.replace(/\s/g, '') == selectedItemsList[j].name && oprLayers.baseMap.baseMapLayers[b].type != "VectorTileLayer") {
                                                oprLayers.baseMap.baseMapLayers[b].url = selectedItemsList[j].newUrl;
                                                oprLayers.baseMap.baseMapLayers[b].itemId = "";
                                                for (var n = 0; n < targetServices.length; n++) {

                                                    if (targetServices[n].url.toLowerCase() == oprLayers.baseMap.baseMapLayers[b].url.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.baseMap.baseMapLayers[b].itemId = targetServices[n].itemid;
                                                        oprLayers.baseMap.baseMapLayers[b].title = targetServices[n].name;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }



                                        }

                                    }
                                    if (typeof (oprLayers.tables) != "undefined") {
                                        for (var c = 0; c < oprLayers.tables.length; c++) {
                                            if (selectedItemsList[j].name == oprLayers.tables[c].title.replace(/\s/g, '')) {
                                                oprLayers.tables[c].url = selectedItemsList[j].newUrl;
                                                oprLayers.tables[c].itemId = "";
                                                for (var l = 0; l < targetServices.length; l++) {

                                                    if (targetServices[l].url.toLowerCase() == oprLayers.tables[c].url.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.tables[c].itemId = targetServices[l].itemid;
                                                        break;
                                                    }
                                                }
                                                break;

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (selectedItemsList.length == 0) {
                        $(".Updated_content").css("display", "none");
                    }
                }
                ErrList = [];
                count1 = 0; count2 = 0; count3 = 0; count4 = 0; itemscount = 0;
                duplicateItem = checkServiceName(selected_items);
                FeatureItem = [];
                nonFeatureItems = [];
                feature_err = 0; featur_succ = 0;
                for (var i = 0; i < source_items.length; i++) {
                    for (var j = 0; j < selected_items.length; j++) {
                        if (source_items[i].id == selected_items[j]) {
                            if (source_items[i].type == 'Feature Service') {
                                FeatureItem.push(source_items[i]);
                            }
                            else {
                                nonFeatureItems.push(source_items[i]);
                            }
                        }
                    }
                }



                if (duplicateItem.length == 0) {
                    CompleteItemMigration();
                }
                else {
                    var str = [];
                    for (var a = 0; a < duplicateItem.length; a++) {
                        str.push(duplicateItem[a].itemname)
                    }
                    const swalWithBootstrapButtons = swal.mixin({
                        confirmButtonClass: 'btn btn-success mb-2',
                        cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                        buttonsStyling: false,
                    });
                    errcount = 0;
                    swalWithBootstrapButtons({
                        title: 'Do you want to override existing items in target',
                        text: str.join(","),
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Override existing',
                        cancelButtonText: 'No',
                        reverseButtons: true
                    }).then(function (result) {
                        if (result.value) {

                            $("#update-items").click();

                        }
                        else if (
                            result.dismiss === swal.DismissReason.cancel
                        ) {
                            $("#no-update-req").click();
                        }
                    });
                    //$("#manageduplicates")[0].style.display = "block";
                    //$("#migrate-success")[0].style.display = "none";
                    //$("#loader")[0].style.display = "none";
                }
            }
        });


        //function CreateFeature_Service() {
        //    for (var i = 0; i < FeatureItem.length; i++) {
        //        var available = false;
        //        uncompatableItems = false;
        //        for (var m = 0; m < duplicateItem.length; m++) {
        //            if (duplicateItem[m].src_itemid == FeatureItem[i].id)
        //                available = true;
        //        }
        //        if (available && !alloveride) {
        //            featur_succ = featur_succ + 1;
        //        }
        //        else {
        //            uncompatableItems = false;
        //            selectedItemID = FeatureItem[i].id;
        //            $("." + selectedItemID + "_1").show();
        //            $("." + selectedItemID + "_lbl")[0].innerText = "Loading.....";
        //            loadItemsData_FS(FeatureItem[i].id);
        //        }
        //    }
        //}


        function CompleteItemMigration() {
            var uncompatableItems = true;
            messagesList = [];
            success_Flag = false;
            mig_count = 0; featur_succ = 0; feature_err = 0; err_count = 0;
            $(".progressText").empty();
            $(".Updated_content").css("display", "none");
            $(".lst-Actions").css("display", "none");
            $(".folder_target").css("display", "none");
            $(".createFolder_target").css("display", "none");
            err_count = 0;
            // copy Items except feature service
            if (nonFeatureItems.length > 0) {
                migrateItems();

            }
            if (FeatureItem.length > 0 && nonFeatureItems.length == 0) {
                uncompatableItems = false;
                // CreateFeature_defService();
                currentItemIndex = -1;
                Create_defserviceRecursive();
                //CreateFeature_Service();
            }
        };
        function Create_defserviceRecursive() {
            currentItemIndex = currentItemIndex + 1;

            if (currentItemIndex < FeatureItem.length) {
                CreateFeature_defService();
            }
            else { //success_Flag = false

                var options = {
                    userName: sesstionItem.username,
                    portalUrl: sesstionItem.portalurl,
                    message: messagesList.join("<br/>"),
                    isSendEmail: true,
                    destUserName: v_username,
                    destPortalUrl: v_portalurl
                };

                if (!CopiedItems) {
                    $(".response-msg")[0].innerText = "Failed to copy items to target portal";
                    LogMessages(options, logFailureMsg);
                    $(".swal2-container").css("display", "none");
                }
                else if (success_Flag) {
                    $(".response-msg")[0].innerText = "Copied items to target portal with errors";
                    LogMessages(options, logFailureMsg);
                    $(".swal2-container").css("display", "none");
                }
                else {
                    $(".response-msg")[0].innerText = "Successfully copied items to target portal";
                    options.isSendEmail = false;
                    LogMessages(options, logSuccessMsg);
                    $(".swal2-container").css("display", "none");
                }


                //showConfirmScreen();
                $("#loader").hide();
            }


        };

        function CreateFeature_defService() {
            var successItems = [];
            var itemOptions = {};
            var def_request = [];
            var LoginMode = $(".tabs-container .active")[0].id;
            for (var i = currentItemIndex; i < FeatureItem.length; i = i + FeatureItem.length) {
                var item = FeatureItem[i];
                selectedItemID = FeatureItem[i].id;
                $("." + selectedItemID + "_1").show();
                var createparams = {
                    description: item.description,
                    syncEnabled: true,
                    xssPreventionInfo: {
                        xssPreventionRule: "InputOnly",
                        xssPreventionEnabled: true,
                        xssInputRule: "rejectInvalid"
                    },
                    serviceDescription: item.description,
                    syncCapabilities: {
                        supportsAsync: true,
                        supportsRegisteringExistingData: true,
                        supportsPerLayerSync: true,
                        supportsSyncDirectionControl: true,
                        supportsAttachmentsSyncDirection: true,
                        supportsSyncModelNone: true,
                        supportsRollbackOnFailure: true,
                        supportsPerReplicaSync: true
                    },
                    hasStaticData: false,
                    capabilities: "Query,Editing,Create,Update,Delete,Sync",
                    supportedQueryFormats: "JSON",
                    maxRecordCount: 1000,
                    editorTrackingInfo: {
                        allowOthersToQuery: true,
                        enableOwnershipAccessControl: false,
                        allowOthersToUpdate: true,
                        enableEditorTracking: true,
                        allowOthersToDelete: true
                    },
                    allowGeometryUpdates: true,
                    copyrightText: "",
                    supportsApplyEditsWithGlobalIds: true,
                    supportsDisconnectedEditing: false,
                    hasVersionedData: false,
                    name: item.title
                }
                itemOptions = {
                    createParameters: JSON.stringify(createparams),
                    outputType: "featureService",
                    f: "json",
                    token: v_tarToken
                }
                v_featServUrl = item.url;
                var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/createService';
                if ($(".folder_target").val() != "")
                    var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + "/" + $(".folder_target").val() + '/createService';
                var itemparams = itemOptions;
                itemparams.responseType = "json";
                itemparams.method = "post";
                var request = $.ajax({
                    url: v_url,
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: (LoginMode == "LoginMode3") ? true : false
                    },
                    data: itemparams
                    // success: onSuccess
                })
                def_request.push(request);
                $("." + selectedItemID + "_lbl")[0].innerText = "Creating " + FeatureItem[i].title + " service in target portal ...";
                $("." + selectedItemID + "_lbl").css("color", "#673AB7");
                $(".progressText").append("<li class='text-success'>Creating " + FeatureItem[i].title + " service in target portal ...</li>");

            }
            all(def_request).then(function (results) { /// creating service

                console.log(results);
                var def_request = [];
                //results =  JSON.parse(results)
                for (var n = 0; n < results.length; n++) {
                    if (typeof (results[n]) == "string")
                        results[n] = JSON.parse(results[n]);

                    if (results[n].success) {
                        CopiedItems = true;
                        for (var k = 0; k < FeatureItem.length; k++) {


                            if (FeatureItem[k].title == results[n].name) {
                                selectedItemID = FeatureItem[k].id;
                                FeatureItem[k].new_serviceUrl = results[n].serviceurl;
                                FeatureItem[k].Source_serviceUrl = FeatureItem[k].url;
                                successItems.push(FeatureItem[k]);
                                v_featServUrl = FeatureItem[k].url;
                                var v_url = v_featServUrl + '/layers';
                                var msg = "Created " + results[n].name + " service in target portal ..."
                                $("." + selectedItemID + "_lbl")[0].innerText = msg;
                                $("." + selectedItemID + "_lbl").css("color", "#673AB7");
                                messagesList.push(msg);
                                //  $(".progressText").append("<li class='text-success'>Created " + results[n].name + " service in target portal ...</li>");
                                //Config.portalUrlLogMessages(sesstionItem.username, sesstionItem.portalurl, msg, Config.portalUrllogSuccessMsg, false);
                                var options = {
                                    token: v_srcToken,
                                    f: "json",
                                    responseType: "json",
                                    method: "get"
                                };
                                var request = $.ajax({
                                    url: v_url,
                                    type: "POST",
                                    crossDomain: true,
                                    xhrFields: {
                                        withCredentials: (LoginMode == "LoginMode3") ? true : false
                                    },
                                    data: options
                                    // success: onSuccess
                                })
                                def_request.push(request);
                                $("." + selectedItemID + "_lbl")[0].innerText = "Loading " + results[n].name + " service data from source portal ...";
                                $("." + selectedItemID + "_lbl").css("color", "#673AB7");
                                // $(".progressText").append("<li class='text-success'>Loading " + results[n].name + " service data from source portal ...</li>");

                            }
                            //else {
                            //    err_count++;
                            //    $("." + selectedItemID + "_lbl")[0].innerText = "Failed to create " + results[n].name + " service in target portal(" + results[n].response.message + ")";
                            //    $(".progressText").append("<li class='text-success'>Created " + results[n].name + " service in target portal(" + results[n].response.message + ")</li>");
                            //    if (err_count == FeatureItem.length) {
                            //        $("#migrate-fail").css("display", "none");
                            //        $(".failure_msg")[0].innerText = "Failed to copy items";
                            //        showConfirmScreen();
                            //        $("#loader").hide();

                            //    }
                            //}
                        }

                        // break;
                    }
                    else {

                        selectedItemID = FeatureItem[err_count].id;
                        $("#" + selectedItemID + "_load").css("display", "none");
                        var msg = results[n].error.message;
                        $("." + selectedItemID + "_lbl")[0].innerText = "Failed to create service,already exists in target portal "; //+ results[n].error.message;
                        $("." + selectedItemID + "_lbl").css("color", "#ea1c0d");
                        messagesList.push(msg);
                        //Config.portalUrlLogMessages(sesstionItem.username, sesstionItem.portalurl, msg, Config.portalUrllogFailureMsg, true);
                        //$(".progressText").append("<li class='text-danger'>Failed to create service,already exists in target portal </li>");
                        err_count++;
                        success_Flag = true;
                        Create_defserviceRecursive();
                        //if (err_count == FeatureItem.length) {

                        //   // $("#migrate-fail").css("display", "none");
                        //   // $(".failure_msg")[0].innerText = "Failed to copy items";
                        //  //  showConfirmScreen();
                        //    $("#loader").hide();
                        //    //return;

                        //}
                        //}
                    }
                }
                console.log(def_request);
                all(def_request).then(function (results) { // querying layers
                    console.log(results);
                    var response = results;
                    var def_request = [];
                    if (typeof (response) == "string")
                        response = JSON.parse(results);
                    for (var i = 0; i < results.length; i++) {
                        response = (typeof (results[i]) == "string") ? JSON.parse(results[i]) : results[i];
                        //if (sesstionItem.type != "PortalforArcgis") {

                        // response = JSON.parse(results[i]);
                        // }
                        selectedItemID = FeatureItem[currentItemIndex].id;
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            err_count++;
                            var msg = "Failed loading " + successItems[i].title + " service data from source portal ...";
                            messagesList.push(msg);
                            $("." + selectedItemID + "_lbl")[0].innerText = "Failed loading " + FeatureItem[currentItemIndex].title + " service data from source portal ..."
                            // $(".progressText").append("<li class='text-danger'>Failed " + successItems[i].title + " service data from source portal ...</li>");
                            $("." + selectedItemID + "_lbl").css("color", "#ea1c0d");
                            $("#" + selectedItemID + "_load").hide();
                            success_Flag = true;
                            Create_defserviceRecursive();
                            //if (err_count == FeatureItem.length) {
                            //    $("#migrate-fail").css("display", "none");
                            //    $(".failure_msg")[0].innerText = "Failed to copy items";
                            //    showConfirmScreen();
                            //    $("#loader").hide();
                            //}
                        }
                        else {
                            $("." + selectedItemID + "_lbl")[0].innerText = "Loaded " + FeatureItem[currentItemIndex].title + " service data from source portal ..."
                            //$(".progressText").append("<li class='text-success'>Loaded " + successItems[i].title + " service data from source portal ...</li>");

                            var v_url = successItems[i].new_serviceUrl + '/addToDefinition';
                            v_url = v_url.replace("/rest/services/", "/rest/admin/services/");
                            var data = results[i];

                            if (sesstionItem.type == "PortalforArcgis") {
                                data = (typeof (results[i]) != "string") ? JSON.stringify(data) : results[i];
                            }
                            successItems[i].layerdata = data;

                            //$(".progressText").append("<li class='text-success'>Updating service definition to " + successItems[i].title + " ...</li>");
                            $("." + selectedItemID + "_lbl")[0].innerText = "Updating service definition to " + FeatureItem[currentItemIndex].title + " ...";

                            var options = {
                                token: v_tarToken,
                                addToDefinition: data,
                                f: "json",
                                responseType: "json",
                                method: "post"
                            };

                            var request = $.ajax({
                                url: v_url,
                                type: "POST",
                                crossDomain: true,
                                data: options,
                                xhrFields: {
                                    withCredentials: (LoginMode == "LoginMode3") ? true : false
                                },
                                async: true
                                // success: onSuccess
                            })
                            def_request.push(request);
                        }


                    }
                    all(def_request).then(function (results) { ///adding deffered promise
                        var response = results;
                        var def_request = [];
                        selectedItemID = FeatureItem[currentItemIndex].id;
                        var count = 0; var succ_cnt = 0;
                        if (typeof (response) == "string")
                            response = JSON.parse(results);
                        for (var i = 0; i < results.length; i++) {

                            if (typeof (response[i]) == "string")
                                response[i] = JSON.parse(response[i])
                            if (typeof (response[i].error) != "undefined" && typeof (response[i].error) != "null") {
                                var msg = "Failed to update service definition to " + successItems[i].title + "(" + response[i].error.message + ")"
                                messagesList.push(msg);
                                $("." + selectedItemID + "_lbl")[0].innerText = "Failed to update service definition to " + successItems[i].title + "(" + response[i].error.message + ")";
                                //$(".progressText").append("<li class='text-danger'>Failed to update service definition to " + successItems[i].title + "(" + response[i].error.message + ")</li>");
                                $("." + selectedItemID + "_lbl").css("color", "#ea1c0d");
                                $("#" + selectedItemID + "_load").hide();
                                err_count++;
                                success_Flag = true;
                                Create_defserviceRecursive();
                                //if (err_count == FeatureItem.length) {
                                //    $("#migrate-fail").css("display", "none");
                                //    $(".failure_msg")[0].innerText = "Failed to copy items";
                                //    showConfirmScreen();
                                //    $("#loader").hide();
                                //}
                            }
                            else {
                                succ_cnt++;
                                //selectedItemID = successItems[i].id;
                                console.log("add to serivice defination");
                                var msg = "Updated service definition to " + successItems[i].title + " ...";
                                $("." + selectedItemID + "_lbl")[0].innerText = "Updated service definition to " + successItems[i].title + " ...";
                                messagesList.push(msg);
                                //$(".progressText").append("<li class='text-success'>Updated service definition to " + successItems[i].title + " ...</li>");
                                def_request = [];
                                var Layers;
                                if (sesstionItem.type == "PortalforArcgis") {
                                    if (typeof (successItems[i].layerdata) == "string")
                                        Layers = JSON.parse(successItems[i].layerdata).layers;
                                    else {
                                        Layers = successItems[i].layerdata.layers;
                                    }
                                }
                                else {
                                    if (typeof (successItems[i].layerdata) == "string")
                                        Layers = JSON.parse(successItems[i].layerdata).layers;
                                    else {
                                        Layers = successItems[i].layerdata.layers;
                                    }
                                }

                                for (var j = 0; j < Layers.length; j++) {
                                    var v_url = successItems[i].Source_serviceUrl + '/' + Layers[j].id + '/query';
                                    var options = {
                                        where: "1=1",
                                        outFields: "*",
                                        orderByFields: 'objectid',
                                        returnGeometry: true,
                                        token: v_srcToken,
                                        f: "json",
                                        responseType: "json",
                                        method: "get"
                                    };
                                    var request = $.ajax({
                                        url: v_url,
                                        type: "GET",
                                        crossDomain: true,
                                        xhrFields: {
                                            withCredentials: (LoginMode == "LoginMode3") ? true : false
                                        },
                                        data: options
                                    });
                                    def_request.push(request);
                                }
                                all(def_request).then(function (results) {

                                    successItems[count].layerInfo = results;
                                    selectedItemID = successItems[count].id;
                                    $("." + selectedItemID + "_lbl")[0].innerText = "Adding features to  " + successItems[count].title + " in destination portal ...";
                                    //$(".progressText").append("<li class='text-success'>Adding features to  " + successItems[count].title + " in destination portal ...</li>");
                                    count++;
                                    console.log(results);
                                    console.log(successItems);
                                    if (count == succ_cnt) {
                                        console.log("adding features....");
                                        var count_add = 0; var succ_add = 0;
                                        for (var i = 0; i < count; i++) {
                                            succ_add++;
                                            var def_request = [];
                                            var itemInfo = successItems[i];
                                            var layerData;
                                            if (sesstionItem.type == "PortalforArcgis") {

                                                if (typeof (itemInfo.layerdata) == "string")
                                                    layerData = JSON.parse(itemInfo.layerdata).layers;
                                                else {
                                                    layerData = itemInfo.layerdata.layers;
                                                }
                                            }
                                            else {

                                                if (typeof (itemInfo.layerdata) == "string")
                                                    layerData = JSON.parse(itemInfo.layerdata).layers;
                                                else {
                                                    layerData = itemInfo.layerdata.layers;
                                                }
                                            }
                                            for (var m = 0; m < layerData.length; m++) {
                                                var v_url = itemInfo.new_serviceUrl + '/' + layerData[m].id + '/addFeatures';

                                                var featureSet;

                                                if (sesstionItem.type == "PortalforArcgis") {

                                                    if (typeof (itemInfo.layerInfo[m]) == "string")
                                                        featureSet = JSON.stringify(JSON.parse(itemInfo.layerInfo[m]).features);
                                                    else {
                                                        featureSet = JSON.stringify(itemInfo.layerInfo[m].features);
                                                    }

                                                    //featureSet = JSON.stringify(itemInfo.layerInfo[m].features);
                                                }
                                                else {

                                                    if (typeof (itemInfo.layerInfo[m]) == "string")
                                                        featureSet = JSON.stringify(JSON.parse(itemInfo.layerInfo[m]).features);
                                                    else {
                                                        featureSet = JSON.stringify(itemInfo.layerInfo[m].features);
                                                    }

                                                    //featureSet = JSON.stringify(JSON.parse(itemInfo.layerInfo[m]).features);
                                                }
                                                var options = {
                                                    features: featureSet,
                                                    token: v_tarToken,
                                                    f: "json",
                                                    responseType: "json",
                                                    method: "post"
                                                };
                                                var request = $.ajax({
                                                    url: v_url,
                                                    type: "POST",
                                                    crossDomain: true,
                                                    xhrFields: {
                                                        withCredentials: (LoginMode == "LoginMode3") ? true : false
                                                    },
                                                    data: options
                                                });
                                                def_request.push(request);

                                            }
                                            all(def_request).then(function (results) { // adding feature to target layers
                                                selectedItemID = FeatureItem[currentItemIndex].id;
                                                $("#" + selectedItemID + "_load").hide();

                                                if (typeof (results[0]) == "string")
                                                    results[0] = JSON.parse(results[0]);

                                                //   if (results[0].success) {//#28a745
                                                var msg = "Added features to  " + FeatureItem[currentItemIndex].title + " in destination portal ..."
                                                messagesList.push(msg);
                                                $("." + selectedItemID + "_lbl")[0].innerText = "Added features to  " + FeatureItem[currentItemIndex].title + " in destination portal ...";
                                                //$(".progressText").append("<li class='text-success'>Added features to  " + successItems[count_add].title + " in destination portal ...</li>");
                                                $("." + selectedItemID + "_lbl").css("color", "#28a745");
                                                // }
                                                //else {
                                                //    $("." + selectedItemID + "_lbl")[0].innerText = "Failed to add features to  " + successItems[count_add].title + "in destination portal ...";
                                                //    $(".progressText").append("<li class='text-success'>Failed to add features to  " + successItems[count_add].title + "in destination portal ...</li>");

                                                //}

                                                count_add++;
                                                Create_defserviceRecursive()
                                                //if (succ_add == count_add) {
                                                //    showConfirmScreen();
                                                //    $("#loader").hide();
                                                //}


                                            }, function (err) {
                                                console.log(err);
                                                var msg = "Failed creating " + FeatureItem[currentItemIndex].title + "in target portal";
                                                selectedItemID = FeatureItem[currentItemIndex].id;
                                                $("#" + selectedItemID + "_load").hide();
                                                messagesList.push(msg);
                                                success_Flag = true;
                                                CreateFeature_defService();
                                            });

                                        }


                                    }
                                }, function (err) {
                                    console.log(err);
                                    var msg = "Failed loading  " + FeatureItem[currentItemIndex].title + " from source portal";
                                    messagesList.push(msg);
                                    selectedItemID = FeatureItem[currentItemIndex].id;
                                    $("#" + selectedItemID + "_load").hide();
                                    success_Flag = true;
                                    CreateFeature_defService();
                                });

                            }
                            // queryfeaturesFromSource(defData.layers, ItemName);
                        }

                    }, function (err) {
                        console.log(err);
                        var msg = "Failed to update sevice definiton " + FeatureItem[currentItemIndex].title + " in target portal";
                        messagesList.push(msg);
                        selectedItemID = FeatureItem[currentItemIndex].id;
                        $("#" + selectedItemID + "_load").hide();
                        success_Flag = true;
                        CreateFeature_defService();
                    });

                }, function (err) {
                    console.log(err);
                    var msg = "Failed to load  " + FeatureItem[currentItemIndex].title + " data from  source portal";
                    messagesList.push(msg);
                    selectedItemID = FeatureItem[currentItemIndex].id;
                    $("#" + selectedItemID + "_load").hide();
                    success_Flag = true;
                    CreateFeature_defService();
                });


            }, function (err) {
                console.log(err);
                var msg = "Failed to add features to  " + FeatureItem[currentItemIndex].title + " in target portal";
                messagesList.push(msg);
                selectedItemID = FeatureItem[currentItemIndex].id;
                $("#" + selectedItemID + "_load").hide();
                success_Flag = true;
                CreateFeature_defService();
            });
        }
        //laoding data of selected item from source portal
        //function loadItemsData(itemId) {
        //    var dataUrl = v_portalurl + '/sharing/rest/content/items/' + itemId + '/data';
        //    var options = {
        //        query: { token: v_srcToken, f: "json" },
        //        responseType: "json",
        //        method: "get"
        //    };
        //    esriRequest(dataUrl, options).then(function (response) {
        //        console.log("Success: ", response); //response.data
        //        var itemOptions = getOptionsById(itemId, response.data);
        //        migrateItems(itemOptions);
        //    }).catch(function (err) {
        //        console.log(err);
        //    });
        //}
        //adding item to organization with collected data
        function migrateItems() {
            var LoginMode = $(".tabs-container .active")[0].id;
            mig_count = 0;
            var uncompatableItems = true;
            var def_request = []; var validItems = [];
            for (var m = 0; m < nonFeatureItems.length; m++) {
                var itemOptions = getOptionsById(nonFeatureItems[m].id);
                itemOptions.token = v_tarToken;
                var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/addItem';
                if ($(".folder_target").val() != "")
                    var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + "/" + $(".folder_target").val() + '/addItem';
                var itemparams = itemOptions;
                itemparams.responseType = "json",
                    itemparams.method = "post"
                var request = $.ajax({
                    url: v_url,
                    type: "POST",
                    crossDomain: true,
                    data: itemparams,
                    xhrFields: {
                        withCredentials: (LoginMode == "LoginMode3") ? true : false
                    },

                })

                if (ActionType == "ArcgisToPortal") {
                    if (nonFeatureItems[m].type != "Web Experience" && nonFeatureItems[m].type != "StoryMap") {
                        def_request.push(request);
                        validItems.push(nonFeatureItems[m]);
                        var itemid = nonFeatureItems[m].id
                        $("#" + itemid + "_load").show();
                        $("." + itemid + "_1").show();
                        $("." + itemid + "_lbl")[0].innerText = "Copying " + nonFeatureItems[m].title + " in target portal ...";
                        $(".progressText").append("<li class='text-success'>Copying " + nonFeatureItems[m].title + "...</li>");
                        // migrateItems(itemOptions, nonFeatureItems[m].name);
                        uncompatableItems = false;
                    }
                    else {
                        uncompatableItems = false;
                        mig_count = mig_count + 1;
                    }
                }
                else {
                    uncompatableItems = false;
                    validItems.push(nonFeatureItems[m]);
                    var itemid = nonFeatureItems[m].id
                    $("#" + itemid + "_load").show();
                    $("." + itemid + "_1").show();
                    $("." + itemid + "_lbl")[0].innerText = "Copying " + nonFeatureItems[m].title + " in target portal ...";
                    def_request.push(request);
                    //  migrateItems(itemOptions, nonFeatureItems[m].title, nonFeatureItems[m].id);

                }
            }
            if (uncompatableItems && ActionType == "ArcgisToPortal") {
                $(".response-msg")[0].innerText = "No items to copy,as Selected item are not compatible for portal for ArcGIS";
                //$("#migrate-fail").show();
                //$("#loader").hide();
                //$("#migrate-success").hide();
                //   showConfirmScreen();
                return
            }
            all(def_request).then(function (results) {
                for (var m = 0; m < results.length; m++) {
                    if (typeof (results[m].error) != "undefined" && typeof (results[m].error) != "null") {

                        var itemid = validItems[m].id;
                        $("." + itemid + "_1").show();
                        $("#" + itemid + "_load").hide();
                        $("." + itemid + "_lbl")[0].innerText = "Failed to copy " + validItems[m].title + "(" + results[m].error.message + ")";
                        $("." + itemid + "_lbl").css("color", "#ea1c0d");
                        var msg = "Failed to copy " + validItems[m].title + "(" + results[m].error.message + ")";
                        messagesList.push(msg);
                        err_count++;
                        if (err_count == validItems.length) {
                            //   $(".progressText").append("<li class='text-danger'>Failed to copy " + validItems[m].title + "(" + results[m].error.message + ")</li>");
                            if (FeatureItem.length > 0) {
                                currentItemIndex = -1;
                                Create_defserviceRecursive();
                                //CreateFeature_Service();
                            }
                            else {
                                // $(".failure_msg")[0].innerText = results[m].error.message;
                                // showConfirmScreen();
                                $(".response-msg")[0].innerText = "Failed to copy items to target portal";
                                $("#loader")[0].style.display = "none";
                                var options = {
                                    userName: sesstionItem.username,
                                    portalUrl: sesstionItem.portalurl,
                                    message: messagesList.join(","),
                                    isSendEmail: true,
                                    destUserName: v_username,
                                    destPortalUrl: v_portalurl
                                };
                                LogMessages(options, logFailureMsg);
                                return
                            }

                        }
                    }
                    else {
                        var itemid = validItems[m].id;
                        CopiedItems = true;
                        $("#" + itemid + "_load").hide();
                        $("." + itemid + "_1").show();
                        $("." + itemid + "_lbl")[0].innerText = "Copied " + validItems[m].title + " Successfully";
                        // $("." + itemid + "_lbl")[0].innerText = "Copied " + validItems[m].title + " Successfully";
                        var msg = "Copied " + validItems[m].title + " Successfully";
                        messagesList.push(msg);
                        $("." + itemid + "_lbl").css("color", "#28a745");
                        mig_count = mig_count + 1;
                        // $(".progressText").append("<li class='text-success'>Copied " + validItems[m].title + " Sucessfully</li>");
                        // console.log("Success: ", response);
                        if (mig_count == validItems.length && err_count == 0) {
                            if (FeatureItem.length > 0) {
                                // CreateFeature_Service();
                                currentItemIndex = -1;
                                Create_defserviceRecursive();
                            }
                            else {
                                // $("#migrate-success")[0].style.display = "block";
                                $("#loader")[0].style.display = "none";
                                $(".response-msg")[0].innerText = "Successfully copied item to target portal";
                                var options = {
                                    userName: sesstionItem.username,
                                    portalUrl: sesstionItem.portalurl,
                                    message: messagesList.join(","),
                                    isSendEmail: false,
                                    destUserName: v_username,
                                    destPortalUrl: v_portalurl
                                };
                                LogMessages(options, logSuccessMsg);
                                //showConfirmScreen();
                                //Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
                            }

                        }
                        else if (mig_count + err_count == validItems.length && err_count > 0) {
                            if (FeatureItem.length > 0) {
                                //CreateFeature_Service();
                                currentItemIndex = -1;
                                Create_defserviceRecursive();
                            }
                            else {
                                //$("#migrate-success")[0].style.display = "block";
                                $("#loader")[0].style.display = "none";
                                $(".response-msg")[0].innerText = "Copied item to target portal with errors";
                                var options = {
                                    userName: sesstionItem.username,
                                    portalUrl: sesstionItem.portalurl,
                                    message: "Copied item to target portal with errors",
                                    isSendEmail: true,
                                    destUserName: v_username,
                                    destPortalUrl: v_portalurl
                                };
                                LogMessages(options, logFailureMsg);
                                //showConfirmScreen();
                                //$(".PText").css("display", "none");
                                //Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
                            }

                        }

                    }
                }


            }, function (err) {
                console.log(err);
            });

            //esriRequest(v_url, options).then(function (response) {
            //    mig_count = mig_count + 1;
            //    console.log("Success: ", response);
            //    if (mig_count == selected_items.length && err_count == 0) {
            //        $("#migrate-success")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //        Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
            //    }
            //    else if (mig_count == selected_items.length && err_count > 0) {
            //        $("#migrate-success")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //        Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
            //    }
            //    else {
            //        if (mig_count == selected_items.length && err_count == selected_items.length) {
            //            $("#migrate-fail")[0].style.display = "block";
            //            $("#loader")[0].style.display = "none";
            //            Config.portalUrlAlertMessages("Copy items to target portal", "Failed to copy items", "danger");
            //        }
            //    }
            //    // itemId = response.data.id
            //    //if (response.requestOptions.query.type == "Web Map" && $(".blockdependeance")[0].checked) {
            //    //    var itemdata = JSON.parse(response.requestOptions.query.text);
            //    //    var operationalLayers = itemdata.operationalLayers
            //    //    for (var i = 0; i < operationalLayers.length; i++) {
            //    //        var available = checkServiceName(operationalLayers[i].title);
            //    //        if (!available) {
            //    //            var createParamsObj = {
            //    //                name: operationalLayers[0].title,
            //    //                serviceDescription: operationalLayers[0].description,
            //    //                description: operationalLayers[0].description,
            //    //                spatialReference: operationalLayers[0].spatialReference,
            //    //                initialExtent: operationalLayers[0].extent,
            //    //                capabilities: "Create,Delete,Query,Update,Editing,Sync",
            //    //                xssPreventionInfo: {
            //    //                    xssPreventionEnabled: true,
            //    //                    xssPreventionRule: "input",
            //    //                    xssInputRule: "rejectInvalid"
            //    //                }
            //    //            }
            //    //            itemOptions = {
            //    //                createParameters: JSON.stringify(createParamsObj),
            //    //                outputType: "featureService",
            //    //                f: "json"
            //    //            }
            //    //            if (operationalLayers[i].url.indexOf("FeatureServer") != -1)
            //    //                v_featServUrl = operationalLayers[i].url.substring(0, operationalLayers[i].url.indexOf("FeatureServer") - 1) + "/FeatureServer";
            //    //            else
            //    //                v_featServUrl = operationalLayers[i].url.substring(0, operationalLayers[i].url.indexOf("MapServer") - 1) + "/MapServer";
            //    //            var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/createService';
            //    //            var options = {
            //    //                query: itemOptions,
            //    //                responseType: "json",
            //    //                method: "post"
            //    //            };
            //    //            esriRequest(v_url, options).then(function (response) {
            //    //                console.log("Created Feature Service");
            //    //                new_servcieUrl = response.data.serviceurl;
            //    //                updatewebmapurls(itemId, itemdata);
            //    //                getfeatureServiceLayers1();
            //    //            }).catch(function (err) {
            //    //                console.log(err);

            //    //            });
            //    //        }
            //    //        else {
            //    //            targetfeatServices.forEach(function (service) {
            //    //                if (service.name == operationalLayers[0].title) {
            //    //                    new_servcieUrl = service.url;
            //    //                    v_featServUrl = service.name
            //    //                }
            //    //            });
            //    //            updatewebmapurls(itemId, itemdata);
            //    //        }
            //    //    }
            //    //}
            //    //if (response.requestOptions.query.type == "Web Map" && $(".alldependence")[0].checked) {
            //    //    var itemdata = JSON.parse(response.requestOptions.query.text);
            //    //    var url = v_portalurl + "/sharing/rest/content/users/" + v_username + "/items/" + itemId + "/update";
            //    //    for (var i = 0; i < selectedItemsList.length; i++) {
            //    //        var oprLayers = itemdata;
            //    //        if (typeof (oprLayers.operationalLayers) != "undefined") {
            //    //            for (var j = 0; j < oprLayers.operationalLayers.length; j++) {
            //    //                if (selectedItemsList[i].name == oprLayers.operationalLayers[j].title.replace(/\s/g, '')) {
            //    //                    oprLayers.operationalLayers[j].url = selectedItemsList[i].newUrl;
            //    //                    break;
            //    //                }
            //    //            }

            //    //        }
            //    //        if (typeof (oprLayers.baseMap) != "undefined") {
            //    //            for (var j = 0; j < oprLayers.baseMap.baseMapLayers.length; j++) {
            //    //                if (oprLayers.baseMap.baseMapLayers[j].title.replace(/\s/g, '') == selectedItemsList[i].name) {
            //    //                    oprLayers.baseMap.baseMapLayers[j].url = selectedItemsList[i].newUrl;
            //    //                    break;
            //    //                }

            //    //            }

            //    //        }
            //    //        if (typeof (oprLayers.tables) != "undefined") {
            //    //            for (var j = 0; j < oprLayers.tables.length; j++) {
            //    //                if (selectedItemsList[i].name == oprLayers.tables[j].title.replace(/\s/g, '')) {
            //    //                    oprLayers.tables[j].url = selectedItemsList[i].newUrl;
            //    //                    break;

            //    //                }
            //    //            }
            //    //        }
            //    //        var queryparams = {
            //    //            text: JSON.stringify(oprLayers),
            //    //            f: "json"
            //    //        };
            //    //        var options = {
            //    //            query: queryparams,
            //    //            responseType: "json",
            //    //            method: "post"
            //    //        };
            //    //        esriRequest(url, options).then(function (response) {
            //    //            console.log(response.data);
            //    //        }).catch(function (err) {
            //    //            console.log(err);
            //    //        });
            //    //    }
            //    //}
            //}).catch(function (err) {
            //    err_count++;
            //    mig_count = mig_count + 1;
            //    ErrList.push(ItemName);
            //    $("#err-msg").append('<h5>' + err.message + '</h5>');
            //    if (mig_count == selected_items.length && err_count == selected_items.length) {
            //        $("#migrate-fail")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //        Config.portalUrlAlertMessages("Copy Items", "Failed to copy items to target portal", "danger");
            //    }
            //    else if (mig_count == selected_items.length && err_count < selected_items.length) {
            //        $("#migrate-success")[0].style.display = "block";
            //        $("#loader")[0].style.display = "none";
            //        Config.portalUrlAlertMessages("Copy Items", "Successfully copied item with errors", "success");
            //    }

            //});
        }
        //function updatewebmapurls(TargetId, itemdata) {
        //    url = v_portalurl + "/sharing/rest/content/users/" + v_username + "/items/" + TargetId + "/update";
        //    //  for (var i = 0; i < selectedItemsList.length; i++) {
        //    var oprLayers = itemdata;
        //    if (typeof (oprLayers.operationalLayers) != "undefined") {
        //        for (var j = 0; j < oprLayers.operationalLayers.length; j++) {
        //            if (oprLayers.operationalLayers[j].url.indexOf(v_featServUrl) != -1) {
        //                oprLayers.operationalLayers[j].url = new_servcieUrl + "/" + oprLayers.operationalLayers[j].url.split("/")[oprLayers.operationalLayers[j].url.split("/").length - 1];
        //                break;
        //            }
        //        }

        //    }
        //    //if (typeof (oprLayers.baseMap) != "undefined") {
        //    //    for (var j = 0; j < oprLayers.baseMap.baseMapLayers.length; j++) {
        //    //        for (var k = 0; k < selectedItemsList.length; k++) {
        //    //            if (oprLayers.baseMap.baseMapLayers[j].id == selectedItemsList[k].id) {
        //    //                oprLayers.baseMap.baseMapLayers[j].url = selectedItemsList[k].newUrl;
        //    //                break;
        //    //            }
        //    //        }
        //    //    }

        //    //}
        //    if (typeof (oprLayers.tables) != "undefined") {
        //        for (var j = 0; j < oprLayers.tables.length; j++) {
        //            if (oprLayers.tables[j].url.indexOf(v_featServUrl) != -1) {
        //                oprLayers.tables[j].url = new_servcieUrl + "/" + oprLayers.tables[j].url.split("/")[oprLayers.tables[j].url.split("/").length - 1];
        //                break;

        //            }
        //        }
        //    }

        //    var queryparams = {
        //        text: JSON.stringify(oprLayers),
        //        f: "json",
        //        token: portalToken
        //    };
        //    var options = {
        //        query: queryparams,
        //        responseType: "json",
        //        method: "post"
        //    };
        //    esriRequest(url, options).then(function (response) {
        //        console.log(response.data);
        //    }).catch(function (err) {
        //        console.log(err);
        //    });
        //    // }
        //}
        //laoding data of feature service from source portal
        //function loadItemsData_FS(Id) {
        //    var itemOptions = {};
        //    source_items.forEach(function (item) {
        //        if (item.id == Id) {

        //            $("." + selectedItemID + "_lbl")[0].innerText = "Creating " + item.title + " feature service ....";
        //            $(".progressText").append("<li class='text-success'>Creating " + item.title + " feature service .......</li>");
        //            var createparams = {
        //                description: item.description,
        //                syncEnabled: true,
        //                xssPreventionInfo: {
        //                    xssPreventionRule: "InputOnly",
        //                    xssPreventionEnabled: true,
        //                    xssInputRule: "rejectInvalid"
        //                },
        //                serviceDescription: item.description,
        //                syncCapabilities: {
        //                    supportsAsync: true,
        //                    supportsRegisteringExistingData: true,
        //                    supportsPerLayerSync: true,
        //                    supportsSyncDirectionControl: true,
        //                    supportsAttachmentsSyncDirection: true,
        //                    supportsSyncModelNone: true,
        //                    supportsRollbackOnFailure: true,
        //                    supportsPerReplicaSync: true
        //                },
        //                hasStaticData: false,
        //                capabilities: "Query,Editing,Create,Update,Delete,Sync",
        //                supportedQueryFormats: "JSON",
        //                maxRecordCount: 1000,
        //                editorTrackingInfo: {
        //                    allowOthersToQuery: true,
        //                    enableOwnershipAccessControl: false,
        //                    allowOthersToUpdate: true,
        //                    enableEditorTracking: true,
        //                    allowOthersToDelete: true
        //                },
        //                allowGeometryUpdates: true,
        //                copyrightText: "",
        //                supportsApplyEditsWithGlobalIds: true,
        //                supportsDisconnectedEditing: false,
        //                hasVersionedData: false,
        //                name: item.title
        //            }
        //            itemOptions = {
        //                createParameters: JSON.stringify(createparams),
        //                outputType: "featureService",
        //                f: "json",
        //                token: v_tarToken
        //            }
        //            v_featServUrl = item.url;
        //            // setTimeout(function () {
        //            createFeatureService(item.title, itemOptions, Id);

        //            //}, 0);

        //        }
        //    });
        //}
        //creating feature service
        //function createFeatureService(ItemName, itemOptions, src_Id) {
        //    var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/createService';
        //    var itemparams = itemOptions;
        //    itemparams.responseType = "json";
        //    itemparams.method = "post";
        //    // itemparams.delay = 3;
        //    $.ajax({
        //        url: v_url,
        //        type: "POST",
        //        crossDomain: true,
        //        data: itemparams,
        //        async: false,
        //        success: function (data) {
        //            var response = data;
        //            if (typeof (response) == "string")
        //                response = JSON.parse(data);
        //            if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
        //                feature_err++
        //                $("." + selectedItemID + "_lbl")[0].innerText = "Failed to create " + ItemName + "feature service(" + response.error.message + ")";
        //                $(".progressText").append("<li class='text-danger'>Failed to create " + ItemName + " feature service(" + response.error.message + ")</li>");
        //                if (feature_err == FeatureItem.length) {
        //                    $(".failure_msg")[0].innerText = response.error.message;
        //                    $("#loader")[0].style.display = "none";
        //                    $("#migrate-success").css("display", "none");
        //                    $("#migrate-fail").css("display", "block");
        //                    //$("PText").css("display", "none");
        //                    return
        //                }
        //            }
        //            else {
        //                console.log("Created Feature Service");
        //                $("." + selectedItemID + "_lbl")[0].innerText = "Created " + ItemName + " service...";
        //                $(".progressText").append("<li class='text-success'>Created " + ItemName + " service ...</li>");
        //                new_servcieUrl = response.serviceurl;
        //                updateItem_FS(response.itemId, src_Id);
        //                getfeatureServiceLayers(ItemName);
        //            }
        //        },
        //        error: function (data, textStatus, jqXHR) {
        //            feature_err++;
        //            //  $(".progressText")[0].innerText = "Failed to create " + ItemName + " service";
        //            $(".progressText").append("<li class='text-danger'>Failed to create " + ItemName + " service</li>");
        //            $("." + selectedItemID + "_lbl")[0].innerText = "Failed to create " + ItemName + " service";
        //            if (feature_err == FeatureItem.length) {
        //                $("#migrate-fail")[0].style.display = "block";
        //                $("#loader")[0].style.display = "none";
        //                $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //                for (var m = 0; m < selected_items.length; m++) {
        //                    $("#" + selected_items[m] + "_load").hide();
        //                }
        //                //$(".PText").css("display", "none");
        //            }

        //        }
        //    });
        //}
        //laoding layers data from source
        //function getfeatureServiceLayers(ItemName) {
        //    for (var k = 0; k < FeatureItem.length; k++) {
        //        if (FeatureItem[k].title == ItemName) {
        //            v_featServUrl = FeatureItem[k].url;
        //            break;
        //        }
        //    }
        //    var v_url = v_featServUrl + '/layers';
        //    var options = {
        //        token: v_srcToken,
        //        f: "json",
        //        responseType: "json",
        //        method: "get"
        //    };
        //    $("." + selectedItemID + "_lbl")[0].innerText = "Loading " + ItemName + " service data from source portal ...";
        //    $(".progressText").append("<li class='text-success'>Loading " + ItemName + " service data from source portal ...</li>");
        //    $.ajax({
        //        url: v_url,
        //        type: "GET",
        //        crossDomain: true,
        //        data: options,
        //        async: false,
        //        success: function (data) {
        //            var response = data;
        //            if (typeof (response) == "string")
        //                response = JSON.parse(data);
        //            if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

        //            }
        //            else {
        //                console.log("loaded source feature service layers ");
        //                $("." + selectedItemID + "_lbl")[0].innerText = "Loaded " + ItemName + " service data from source portal ..."
        //                $(".progressText").append("<li class='text-success'>Loaded " + ItemName + " service data from source portal ...</li>");
        //                console.log(response);
        //                var defData = response;
        //                addToDefination_FS(defData, ItemName);
        //            }
        //        },
        //        error: function (data, textStatus, jqXHR) {
        //            feature_err++;
        //            $(".progressText").append("<li class='text-danger'>Failed to load " + ItemName + " service data from source portal ...</li>");
        //            $("." + selectedItemID + "_lbl")[0].innerText = "Failed to load " + ItemName + " service data from source portal ..."
        //            if (feature_err == FeatureItem.length) {
        //                $("#migrate-fail")[0].style.display = "block";
        //                $("#loader")[0].style.display = "none";
        //                $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //                for (var m = 0; m < selected_items.length; m++) {
        //                    $("#" + selected_items[m] + "_load").hide();
        //                }
        //                //$(".PText").css("display", "none");
        //            }
        //        }
        //    });

        //    //var options = {
        //    //    query: { token: v_srcToken, f: "json" },
        //    //    responseType: "json",
        //    //    method: "get"
        //    //};


        //    //esriRequest(v_url, options).then(function (response) {
        //    //    count1++;
        //    //    console.log("loaded source feature service layers ");
        //    //    $(".progressText").append("<li class='text-success'>Loaded " + ItemName + " service data from source portal ...</li>");
        //    //    console.log(response.data);
        //    //    var defData = response.data;
        //    //    addToDefination_FS(defData, ItemName);
        //    //}).catch(function (err) {
        //    //    console.log(err);
        //    //    feature_err++;
        //    //    $(".progressText").append("<li class='text-danger'>Failed to load " + ItemName + " service data from source portal ...</li>");
        //    //    if (feature_err == FeatureItem.length) {
        //    //        $("#migrate-fail")[0].style.display = "block";
        //    //        $("#loader")[0].style.display = "none";
        //    //        $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //    //        //$(".PText").css("display", "none");
        //    //    }

        //    //});
        //}

        //adding service defination with layers
        //function addToDefination_FS(defData, ItemName) {
        //    var v_url = new_servcieUrl + '/addToDefinition';
        //    v_url = v_url.replace("/rest/services/", "/rest/admin/services/");
        //    var data = JSON.stringify(defData);
        //    // $(".progressText")[0].innerText = "Updating service definition to " + ItemName + " ...";
        //    $(".progressText").append("<li class='text-success'>Updating service definition to " + ItemName + " ...</li>");
        //    $("." + selectedItemID + "_lbl")[0].innerText = "Updating service definition to " + ItemName + " ..."
        //    var options = {
        //        token: v_tarToken,
        //        addToDefinition: data,
        //        f: "json",
        //        responseType: "json",
        //        method: "post"
        //    };

        //    $.ajax({
        //        url: v_url,
        //        type: "POST",
        //        crossDomain: true,
        //        data: options,
        //        async: false,
        //        success: function (data) {
        //            var response = data;
        //            if (typeof (response) == "string")
        //                response = JSON.parse(data);
        //            if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

        //            }
        //            else {
        //                console.log("add to serivice defination");
        //                $("." + selectedItemID + "_lbl")[0].innerText = "Updated service definition to " + ItemName + " ...";
        //                $(".progressText").append("<li class='text-success'>Updated service definition to " + ItemName + " ...</li>");
        //                queryfeaturesFromSource(defData.layers, ItemName);
        //            }
        //        },
        //        error: function (data, textStatus, jqXHR) {
        //            console.log(err);
        //            feature_err++;
        //            $("." + selectedItemID + "_lbl")[0].innerText = "Failed to update service definition to " + ItemName + " ...";
        //            $(".progressText").append("<li class='text-danger'>Failed to update service definition to " + ItemName + " ...</li>");
        //            if (feature_err == FeatureItem.length) {
        //                $("#migrate-fail")[0].style.display = "block";
        //                $("#loader")[0].style.display = "none";
        //                $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //                for (var m = 0; m < selected_items.length; m++) {
        //                    $("#" + selected_items[m] + "_load").hide();
        //                }
        //                //$(".PText").css("display", "none");
        //            }
        //        }
        //    });

        //    //esriRequest(v_url, options).then(function (response) {
        //    //    count2++;
        //    //    console.log("add to serivice defination");
        //    //    $(".progressText").append("<li class='text-success'>Updated service definition to " + ItemName + " ...</li>");
        //    //    // $(".progressText")[0].innerText = "Updated service definition to " + ItemName + " ...";
        //    //    queryfeaturesFromSource(defData.layers, ItemName);
        //    //}).catch(function (err) {
        //    //    //$(".progressText")[0].innerText = "Failed to update service definition to " + ItemName + " ...";
        //    //    console.log(err);
        //    //    feature_err++;
        //    //    $(".progressText").append("<li class='text-danger'>Failed to update service definition to " + ItemName + " ...</li>");
        //    //    if (feature_err == FeatureItem.length) {
        //    //        $("#migrate-fail")[0].style.display = "block";
        //    //        $("#loader")[0].style.display = "none";
        //    //        $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //    //        //$(".PText").css("display", "none");
        //    //    }
        //    //});
        //}
        //loading features from source layers
        //function queryfeaturesFromSource(layers, ItemName) {
        //    var count = -1; var query_cnt = 0;
        //    for (var i = 0; i < layers.length; i++) {
        //        var v_url = v_featServUrl + '/' + layers[i].id + '/query';
        //        var options = {
        //            where: "1=1",
        //            outFields: "*",
        //            orderByFields: 'objectid',
        //            returnGeometry: true,
        //            token: v_srcToken,
        //            f: "json",
        //            responseType: "json",
        //            method: "get"
        //        };


        //        $.ajax({
        //            url: v_url,
        //            type: "GET",
        //            crossDomain: true,
        //            data: options,
        //            async: false,
        //            success: function (data) {
        //                var response = data;
        //                if (typeof (response) == "string")
        //                    response = JSON.parse(data);
        //                if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

        //                }
        //                else {
        //                    console.log('query features');
        //                    count = count + 1;
        //                    $("." + selectedItemID + "_lbl")[0].innerText = "Updating features to  " + ItemName + "in destination portal ...";
        //                    $(".progressText").append("<li class='text-success'>Updating features to  " + ItemName + "in destination portal ...</li>");
        //                    addfeaturesToDestination(layers[count].id, response.features, ItemName);
        //                }
        //            },
        //            error: function (data, textStatus, jqXHR) {
        //                count = count + 1;
        //                query_cnt++;
        //                feature_err++;
        //                console.log(err);
        //                // $(".progressText").append("<li class='text-success'>Updating features to  " + ItemName + "in destination portal ...</li>");
        //                if (query_cnt == layers.length && feature_err == FeatureItem.length) {
        //                    $("#migrate-fail")[0].style.display = "block";
        //                    $("#loader")[0].style.display = "none";
        //                    $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //                    for (var m = 0; m < selected_items.length; m++) {
        //                        $("#" + selected_items[m] + "_load").hide();
        //                    }
        //                    //$(".PText").css("display", "none");
        //                }
        //            }
        //        });




        //        //esriRequest(v_url, options).then(function (response) {
        //        //    console.log('query features');
        //        //    count = count + 1;
        //        //    //  $(".progressText")[0].innerText = "Updating features to  " + ItemName + "in destination portal ...";
        //        //    $(".progressText").append("<li class='text-success'>Updating features to  " + ItemName + "in destination portal ...</li>");
        //        //    addfeaturesToDestination(layers[count].id, response.data.features, ItemName);
        //        //}).catch(function (err) {
        //        //    count = count + 1;
        //        //    query_cnt++;
        //        //    feature_err++;
        //        //    console.log(err);
        //        //    // $(".progressText").append("<li class='text-success'>Updating features to  " + ItemName + "in destination portal ...</li>");
        //        //    if (query_cnt == layers.length && feature_err == FeatureItem.length) {
        //        //        $("#migrate-fail")[0].style.display = "block";
        //        //        $("#loader")[0].style.display = "none";
        //        //        $(".failure_msg")[0].innerText = "Failed to copy items in target portal";
        //        //        //$(".PText").css("display", "none");
        //        //    }

        //        //});
        //    }
        //}
        ////adding features to newly created service layers
        //function addfeaturesToDestination(layerId, features, ItemName) {
        //    var featurestext = JSON.stringify(features);
        //    var v_url = new_servcieUrl + '/' + layerId + '/addFeatures';
        //    var options = {
        //        features: featurestext,
        //        token: v_tarToken,
        //        f: "json",
        //        responseType: "json",
        //        method: "post"
        //    };


        //    $.ajax({
        //        url: v_url,
        //        type: "POST",
        //        crossDomain: true,
        //        data: options,
        //        async: false,
        //        success: function (data) {
        //            var response = data;
        //            if (typeof (response) == "string")
        //                response = JSON.parse(data);
        //            if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

        //            }
        //            else {
        //                $("." + selectedItemID + "_lbl")[0].innerText = "Updated features to  " + ItemName + "in destination portal ...";
        //                $(".progressText").append("<li class='text-success'>Updated features to  " + ItemName + "in destination portal ...</li>");
        //                featur_succ++;
        //                $("#" + selectedItemID + "_load").hide();
        //                if (featur_succ == FeatureItem.length && feature_err == 0) {
        //                    $("#migrate-success")[0].style.display = "block";
        //                    //$(".PText").css("display", "none");
        //                    $("#loader")[0].style.display = "none";
        //                    showConfirmScreen()
        //                    Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
        //                }
        //                else if (featur_succ + feature_err == FeatureItem.length && feature_err > 0) {
        //                    $("#migrate-success")[0].style.display = "block";
        //                    $("#loader")[0].style.display = "none";
        //                    showConfirmScreen()
        //                    // $(".PText").css("display", "none");
        //                    Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
        //                }
        //                console.log("Added features");
        //            }
        //        },
        //        error: function (data, textStatus, jqXHR) {
        //            console.log(err);
        //            $("." + selectedItemID + "_lbl")[0].innerText = "Failed to updated features to  " + ItemName + "in destination portal ...";
        //            $("." + selectedItemID + "_load").hide();
        //            $(".progressText").append("<li class='text-danger'>Failed to updated features to  " + ItemName + "in destination portal ...</li>");
        //            // $(".progressText")[0].innerText = "Failed to updated features to  " + ItemName + "in destination portal ...";
        //            feature_err++;
        //            if (featur_succ == FeatureItem.length && feature_err == 0) {
        //                $("#migrate-success")[0].style.display = "block";
        //                // $(".PText").css("display", "none");
        //                showConfirmScreen()
        //                $("#loader")[0].style.display = "none";
        //                Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
        //            }
        //            else if (featur_succ + feature_err == FeatureItem.length && feature_err > 0) {
        //                $("#migrate-success")[0].style.display = "block";
        //                $("#loader")[0].style.display = "none";
        //                showConfirmScreen()
        //                //$(".PText").css("display", "none");
        //                Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
        //            }
        //            else {
        //                if (feature_err == FeatureItem.length) {
        //                    $("#migrate-fail")[0].style.display = "block";
        //                    $("#loader")[0].style.display = "none";
        //                    //$(".PText").css("display", "none");
        //                    showConfirmScreen()
        //                    //Config.portalUrlAlertMessages("Copy items to target portal", "Failed to copy items", "danger");
        //                    $(".failure_msg")[0].innerText = "Failed to copy Items";
        //                }
        //            }
        //        }
        //    });

        //    //esriRequest(v_url, options).then(function (response) {
        //    //    //$(".progressText")[0].innerText = "Updated features to  " + ItemName + "in destination portal ...";
        //    //    $(".progressText").append("<li class='text-success'>Updated features to  " + ItemName + "in destination portal ...</li>");
        //    //    featur_succ++;
        //    //    if (featur_succ == FeatureItem.length && feature_err == 0) {
        //    //        $("#migrate-success")[0].style.display = "block";
        //    //        //$(".PText").css("display", "none");
        //    //        $("#loader")[0].style.display = "none";
        //    //        Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
        //    //    }
        //    //    else if (featur_succ + feature_err == FeatureItem.length && feature_err > 0) {
        //    //        $("#migrate-success")[0].style.display = "block";
        //    //        $("#loader")[0].style.display = "none";
        //    //        // $(".PText").css("display", "none");
        //    //        Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
        //    //    }
        //    //    console.log("Added features");

        //    //}).catch(function (err) {
        //    //    console.log(err);
        //    //    $(".progressText").append("<li class='text-danger'>Failed to updated features to  " + ItemName + "in destination portal ...</li>");
        //    //    // $(".progressText")[0].innerText = "Failed to updated features to  " + ItemName + "in destination portal ...";
        //    //    feature_err++;
        //    //    if (featur_succ == FeatureItem.length && feature_err == 0) {
        //    //        $("#migrate-success")[0].style.display = "block";
        //    //        // $(".PText").css("display", "none");
        //    //        $("#loader")[0].style.display = "none";
        //    //        Config.portalUrlAlertMessages("Copy items to target portal", "Successfully copied item to target portal", "success")
        //    //    }
        //    //    else if (featur_succ + feature_err == FeatureItem.length && feature_err > 0) {
        //    //        $("#migrate-success")[0].style.display = "block";
        //    //        $("#loader")[0].style.display = "none";
        //    //        //$(".PText").css("display", "none");
        //    //        Config.portalUrlAlertMessages("Copy items to target portal", "Copied item to target portal with errors", "success")
        //    //    }
        //    //    else {
        //    //        if (feature_err == FeatureItem.length) {
        //    //            $("#migrate-fail")[0].style.display = "block";
        //    //            $("#loader")[0].style.display = "none";
        //    //            //$(".PText").css("display", "none");
        //    //            //Config.portalUrlAlertMessages("Copy items to target portal", "Failed to copy items", "danger");
        //    //            $(".failure_msg")[0].innerText = "Failed to copy Items";
        //    //        }
        //    //    }
        //    //});
        //}
        //updating item
        function updateItem_FS(tar_Id, src_Id) {
            var itemOptions = null;
            var v_url = v_portalurl + '/sharing/rest/content/users/' + v_username + '/items/' + tar_Id + '/' + 'update';
            source_items.forEach(function (item) {
                if (item.id == src_Id)
                    itemOptions = {
                        tags: item.tags.join(','),
                        token: v_tarToken,
                        f: "json"
                    };
            });
            var options = {
                query: itemOptions,
                responseType: "json",
                method: "post"
            };
            esriRequest(v_url, options).then(function (response) {
                console.log("Updated Item");
            }).catch(function (err) {
                console.log(err);
            });

        }

        //function showConfirmScreen() {
        //    current_fs = $("#items-migrate-btn").parent();
        //    next_fs = $("#items-migrate-btn").parent().next();

        //    //Add Class Active
        //    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        //    //show the next fieldset
        //    next_fs.show();
        //    //hide the current fieldset with style
        //    current_fs.animate({ opacity: 0 }, {
        //        step: function (now) {
        //            // for making fielset appear animation
        //            opacity = 1 - now;

        //            current_fs.css({
        //                'display': 'none',
        //                'position': 'relative'
        //            });
        //            next_fs.css({ 'opacity': opacity });
        //        },
        //        duration: 500
        //    });
        //}

        function checkServiceName(selected_items) {
            var status = false;
            var duplicateArray = [];
            for (var m = 0; m < source_items.length; m++) {
                for (var i = 0; i < selected_items.length; i++) {
                    if (source_items[m].id == selected_items[i]) {

                        for (var j = 0; j < targetfeatServices.length; j++) {
                            if (source_items[m].title == targetfeatServices[j].name) {
                                var markup = '<div class="alert alert-info"><strong>' + source_items[m].title + '</strong> feature service Already Exists.</div>';
                                $("#groups-update").append(markup);
                                //var obj = { "tar_itemid": targetfeatServices[j].id, "src_itemid": selected_items[i].id }
                                duplicateArray.push({ "tar_itemid": targetfeatServices[j].itemid, "src_itemid": source_items[m].id, "itemname": source_items[m].title });
                            }

                        }
                    }
                }
            }

            return duplicateArray;
        }
    });
}

function getOptionsById(Id) {
    var itemOptions = {};
    source_items.forEach(function (item) {
        if (item.id == Id)
            itemOptions = {
                title: item.title,
                access: item.access,
                description: item.description,
                type: item.type,
                culture: item.culture,
                languages: item.languages,
                industries: item.industries,
                snippet: item.snippet,
                metadata: item.itemUrl + '/info/metadata/metadata.xml',
                commentsEnabled: item.commentsEnabled,
                tags: item.tags.join(','),
                url: item.url,
                accessInformation: item.accessInformation,
                extent: item.extent[0].join(',') + "," + item.extent[1].join(','),
                spatialReference: item.spatialReference,
                name: item.name,
                typeKeywords: item.typeKeywords.join(','),
                categories: item.categories.join(','),
                serviceUsername: item.serviceUsername,
                serviceProxyFilter: item.serviceProxyFilter,
                servicePassword: item.servicePassword,
                largeThumbnail: item.largeThumbnail,
                thumbnail: item.thumbnail,
                thumbnailurl: item.itemUrl + '/info/' + item.thumbnail + '?token=' + v_srcToken,
                text: (item.Iteminfo != null || item.Iteminfo != undefined) ? JSON.stringify(item.Iteminfo) : null,
                f: "json"
            }
    });
    return itemOptions;
}
