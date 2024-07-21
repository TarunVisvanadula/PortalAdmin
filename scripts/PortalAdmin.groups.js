//var commonutils = new CommonUtils();
includeHeader();
includeMenu('Groups');
laodgroups();
var searchflag = false;
function laodgroups() {
    require([
        "esri/portal/Portal", "dojo/_base/array", "esri/request",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager", "esri/portal/PortalQueryParams",
        "esri/config",
        "dijit/form/Form"
    ], function (Portal, array, esriRequest, OAuthInfo, esriId, PortalQueryParams, esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);

        }
        var selectedItems = []; var tempdata = [];
        var groupList = [];
        var selectedItemsList = []; var current = 1;
        var BulkUpdatenode = $("#groupsBulkUpdate");
        var Actiontype = "";
        var url = "";
        var itemsList;
        var groupTags = $(".Groups_radbtn");
        var count = 0; var ErrList = []; var rolesData = [];
        var portalToken = '';
        $("#personalizedPanel").css("display", "block");
        var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
        //if (sesstionItem.hostName != "")
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        portalToken = sesstionItem.token;
        $(".lds-ring").css("display", 'block');

        var GroupParameters = [ // exporting array options
            { Name: "Group Name", Key: "title", exportLabel: "title" },
            { Name: "Access", Key: "access", exportLabel: "access" },
            { Name: "AutoJoin", Key: "autoJoin", exportLabel: "autoJoin" },
            { Name: "Hidden Members", Key: "hiddenMembers", exportLabel: "hiddenMembers" },
            { Name: "ID", Key: "id", exportLabel: "id" },
            { Name: "Favourite", Key: "isFav", exportLabel: "isFav" },
            { Name: "Invitation Only", Key: "isInvitationOnly", exportLabel: "isInvitationOnly" },
            { Name: "ReadOnly", Key: "isReadOnly", exportLabel: "isReadOnly" },
            { Name: "ViewOnly", Key: "isViewOnly", exportLabel: "isViewOnly" },
            { Name: "Leaving Disallowed", Key: "leavingDisallowed", exportLabel: "leavingDisallowed" },
            { Name: "Notifications Enabled", Key: "notificationsEnabled", exportLabel: "notificationsEnabled" },
            { Name: "Owner", Key: "owner", exportLabel: "owner" },
            { Name: "phone", Key: "phone", exportLabel: "phone" },
            { Name: "Protected", Key: "protected", exportLabel: "protected" },
            { Name: "Provider", Key: "provider", exportLabel: "provider" },
            { Name: "ProviderGroupName", Key: "providerGroupName", exportLabel: "providerGroupName" },
            { Name: "Summary", Key: "snippet", exportLabel: "snippet" },
            { Name: "Description", Key: "description", exportLabel: "description" },
            { Name: "SortField", Key: "sortField", exportLabel: "sortField" },
            { Name: "SortOrder", Key: "sortOrder", exportLabel: "sortOrder" },
            { Name: "Tags", Key: "tags", exportLabel: "tags" }
        ];
        $(document).ready(function () { /// new click events               
            var current_fs, next_fs, previous_fs; //fieldsets
            var opacity;
            $(".breadcrumb_Home").click(function () {
                $(".breadcrumb .active").each(function () {
                    $(this).remove();
                })
                $("#EditGroup").hide();
                $("#MainCard").show();
                $("#GroupInfo").hide();
                $("#ReturnHome").click();
            })
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



        });
        function setProgressBar(curStep) {
            var steps = $("fieldset").length;
            var percent = parseFloat(100 / steps) * curStep;
            percent = percent.toFixed();
            $(".progress-bar")
                .css("width", percent + "%")
        }
        Config.portalUrl = sesstionItem.portalurl;
        $(".lds-ring").css("display", 'block');
        fetchAllGroups();
        $(".close").click(function () {
            $("#EditGroup").hide();
            $("#MainCard").show();
            $("#GroupInfo").hide();
            Actiontype = "";
            url = "";
            var childElements = $("#GroupItemList .grp_control");
            for (var i = 0; i < childElements.length; i++) {
                $(childElements[i]).prop('disabled', false);
            }

        });
        function breadcrum_Label(label) {
            $(".breadcrumb").append('<li class="active breadcrumb-item">' + label + '</li>')

        }
        if (typeof (localStorage.getItem("Pagenavigation")) != "undefined" && typeof (localStorage.getItem("Pagenavigation")) != "null") {
            var searchedtext = localStorage.getItem("Pagenavigation");
            if (searchedtext == "Create Group") {
                CreateGroup();
            };
            localStorage.removeItem("Pagenavigation");
        }
        function fetchAllGroups() {

            var queryParams = {
                q: 'owner:' + sesstionItem.username,
                token: portalToken,
                num: 200,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json",
                num: 200

            };
            esriRequest(Config.portalUrl + "/sharing/rest/community/groups", options)
                .then(function (response) {
                    groupList = [];
                    $('#groupsaccordion').empty();
                    $("#dropdown-thumbnail-preview").css("display", "block");
                    groupList = response.data.results;
                    LoadGroupslist(groupList);
                    $(".lds-ring").css("display", 'none');
                }).catch(function (err) {
                    console.log(err);
                });
        };
        var ItemParams = {
            q: "owner:" + sesstionItem.username + " AND " + " orgid:" + sesstionItem.portalid,
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            sortField: 'title',
            sortOrder: 'asc'
        };
        fetchAllItems();
        fetchAllRoles();
        setTimeout(function () {
            $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
            $("#sign-out").click(function () {
                signOutCredentials(esriId);
            });
        }, 2000);
        function fetchAllRoles() { // fetch all roles
            var url = Config.portalUrl + "/sharing/rest/portals/self/roles";
            var queryParams = {
                returnPrivileges: true,
                token: portalToken,
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
        function fetchAllItems() {
            var options = {
                query: ItemParams,
                responseType: "json",
                sortField: "numViews",
                sortOrder: "desc",
                num: 100
            };
            esriRequest(Config.portalUrl + "/sharing/rest/search", options)
                .then(function (response) {
                    if (response.data.results.length != 0) {
                        itemsList = response.data.results.concat(itemsList);
                        ItemParams.start = itemsList.length + 1;
                        fetchAllItems();
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        };
        $("#ImportGroupCsv").click(function () {
            $("#inputGroupFile01").val('').clone(true);
        })
        $(".reassignOwner").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Reassign Group Owner", "Please select atleast one group", "warning");
                return;
            }
            selecteduserList = [];
            count = 0;
            Actiontype = "ChangeOwner";
            getGroupInformation("");
            $(".invitation-Control").css("display", "none");
            $(".wizard_header")[0].innerText = "Assign group owner"
        });

        $(".Invitetogroups").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Invite Users", "Please select group for inviting users", "warning");
                return;
            }
            $(".invitation-Control").css("display", "block");
            selecteduserList = [];
            selectedItemsList = []
            count = 0;
            Actiontype = "inviteusers";
            ErrList = [];
            getGroupInformation("");
            $(".wizard_header")[0].innerText = 'Invite user to group'
        });
        $(".Uninvitefromgroups").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Remove Users", "Please select group for removing users", "warning");
                return;
            }
            var usergroups = [];
            selecteduserList = [];
            selectedItemsList = [];
            Actiontype = "removeusers";
            // getGroupInformation("");
            count = 0;
            for (var i = 0; i < selectedItems.length; i++) {
                var v_url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/" + "userList";
                var queryParams = {
                    f: "json",
                    token: portalToken
                };
                var options = {
                    query: queryParams,
                    responseType: "json"
                };
                esriRequest(v_url, options)
                    .then(function (response) {
                        count++
                        usergroups = response.data.users.concat(usergroups);
                        if (Actiontype == 'removeusers' && count == selectedItems.length) {
                            let newArray = [];
                            let uniqueObject = {};
                            for (let i in usergroups) {
                                objTitle = usergroups[i]['username'];
                                uniqueObject[objTitle] = usergroups[i];
                            }
                            for (i in uniqueObject) {
                                newArray.push(uniqueObject[i]);
                            }
                            usergroups = newArray;
                            var users = usergroups;
                            if (users.length == 1) {
                                AlertMessages(Actiontype, "No users are found", "warning");
                                return;
                            }
                            breadcrum_Label('Remove user from groups');
                            var userArray = [];
                            var selectItem = function (item) {
                                selectedItemsList.push(item);
                                if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                                    $("#selectAllItemCheckbox").prop("checked", true);
                                } else {
                                    $("#selectAllItemCheckbox").prop("checked", false);
                                }
                                if (selectedItemsList.length == 0)
                                    $(".getselectetitems").addClass("disbaleClass");
                                else {
                                    $(".getselectetitems").removeClass("disbaleClass");
                                }
                            };
                            var unselectItem = function (item) {

                                selectedItemsList = $.grep(selectedItemsList, function (i) {
                                    return i !== item;
                                });
                                if (selectedItemsList.length == 0) {
                                    $('#selectAllItemCheckbox').attr('checked', false);
                                }
                                if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                                    $("#selectAllItemCheckbox").prop("checked", true);
                                } else {
                                    $("#selectAllItemCheckbox").prop("checked", false);
                                }
                                if (selectedItemsList.length == 0)
                                    $(".getselectetitems").addClass("disbaleClass");
                                else {
                                    $(".getselectetitems").removeClass("disbaleClass");
                                }
                            };
                            array.forEach(users, function (user) {
                                if (user.username != sesstionItem.username) {
                                    var UserObj = {
                                        id: user.username,
                                        Title: user.username,
                                        Name: user.fullName,
                                        //Type: user.userType,
                                        //Role: user.role,
                                        // Level: user.level,
                                        //Access: user.access,
                                        Joined: new Date(user.joined).toLocaleDateString()
                                        //ModifiedOn: new Date(user.modified).toLocaleDateString(),
                                    };
                                    userArray.push(UserObj);
                                }
                            });
                            $("#GroupItemsContol").empty();
                            var fields = [
                                //{
                                //    name: "",
                                //    width: 60,
                                //    itemTemplate: function (value, item) {
                                //        var chkbox = $("<input>").attr("value", item.id).
                                //            attr("type", "checkbox").attr("class", "getsubItems");
                                //        return chkbox;
                                //    },

                                //},
                                {
                                    visible: true,
                                    headerTemplate: function () {
                                        return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                            .on("change", function () {
                                                selectedItemsList = [];
                                                if (this.checked) { // check select status
                                                    $('.getsubItems').each(function () {
                                                        this.checked = true;
                                                        selectItem($(this)[0].id);
                                                    });
                                                } else {
                                                    $('.getsubItems').each(function () {
                                                        this.checked = false;
                                                        unselectItem($(this)[0].id);
                                                    });
                                                    selectedItemsList = [];
                                                }
                                            });
                                    },
                                    itemTemplate: function (_, item) {
                                        return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.id)
                                            .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                            .on("change", function () {
                                                $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                            });
                                    },
                                    align: "center",
                                    width: 50,
                                    sorting: false
                                },
                                { name: "Title", type: "text", title: 'User Name' },
                                { name: "Name", type: "text" },
                                { name: "Joined", type: "text", title: "Joined Date" }
                            ]
                            loadGroupsItems(userArray, fields);
                            HidetogglegroupsTable();
                        }
                    })
                    .catch(function (err) {
                        AlertMessages("Error", err.message, "danger");
                    });
            }
            $(".wizard_header")[0].innerText = 'Remove user from groups';

            $(".invitation-Control").css("display", "none");
        })
        function GetItemList() {
            var itemarray = [];
            selectedItemsList = [];
            var selectItem = function (item) {
                selectedItemsList.push(item);
                if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                    $("#selectAllItemCheckbox").prop("checked", true);
                } else {
                    $("#selectAllItemCheckbox").prop("checked", false);
                }
                if (selectedItemsList.length == 0)
                    $(".getselectetitems").addClass("disbaleClass");
                else {
                    $(".getselectetitems").removeClass("disbaleClass");
                }
            };
            var unselectItem = function (item) {

                selectedItemsList = $.grep(selectedItemsList, function (i) {
                    return i !== item;
                });
                if (selectedItemsList.length == 0) {
                    $('#selectAllItemCheckbox').attr('checked', false);
                }
                if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                    $("#selectAllItemCheckbox").prop("checked", true);
                } else {
                    $("#selectAllItemCheckbox").prop("checked", false);
                }
                if (selectedItemsList.length == 0)
                    $(".getselectetitems").addClass("disbaleClass");
                else {
                    $(".getselectetitems").removeClass("disbaleClass");
                }
            };
            $(".invitation-Control").css("display", "none");
            if (Actiontype == 'unshareItemtogroups') {
                $("#ItemsList").empty();
                count = 0;
                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/content/groups/" + selectedItems[i];
                    var queryParams = {
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: queryParams,
                        responseType: "json"
                    };
                    esriRequest(url, options)
                        .then(function (response) {

                            count++;
                            var Items = response.data.items;
                            var queryurl = response.url.split("/");
                            for (var k = 0; k < groupList.length; k++) {
                                if (queryurl[queryurl.length - 1] == groupList[k].id) {
                                    var groupname = groupList[k].title;
                                    break;
                                }
                            }
                            array.forEach(Items, function (item) {
                                var ItemObj = {
                                    id: item.id,
                                    Title: item.title,
                                    Type: item.type,
                                    Groupname: groupname,
                                    Access: item.access,
                                    Owner: item.owner,
                                    CreatedOn: new Date(item.created).toLocaleDateString(),
                                    ModifiedOn: new Date(item.modified).toLocaleDateString(),
                                };
                                itemarray.push(ItemObj);
                            });
                            if (count == selectedItems.length) {
                                let newArray = [];
                                let uniqueObject = {};
                                for (let i in itemarray) {
                                    objTitle = itemarray[i]['id'];
                                    uniqueObject[objTitle] = itemarray[i];
                                }
                                for (i in uniqueObject) {
                                    newArray.push(uniqueObject[i]);
                                }
                                itemarray = newArray;
                                if (itemarray.length == 0) {
                                    AlertMessages("Unshare Items", "No items found", "warning");
                                    return;
                                }
                                $("#GroupItemsContol").empty();
                                fields = [
                                    {
                                        visible: true,
                                        headerTemplate: function () {
                                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                                .on("change", function () {
                                                    selectedItemsList = [];
                                                    if (this.checked) { // check select status
                                                        $('.getsubItems').each(function () {
                                                            this.checked = true;
                                                            selectItem($(this)[0].id);
                                                        });
                                                    } else {
                                                        $('.getsubItems').each(function () {
                                                            this.checked = false;
                                                            unselectItem($(this)[0].id);
                                                        });
                                                        selectedItemsList = [];
                                                    }
                                                });
                                        },
                                        itemTemplate: function (_, item) {
                                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.id)
                                                .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                                .on("change", function () {
                                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                                });
                                        },
                                        align: "center",
                                        width: 50,
                                        sorting: false
                                    },
                                    { name: "Title", type: "text" },
                                    { name: "Type", type: "text" },
                                    { name: "Groupname", type: "text", title: 'Group Name' },
                                    { name: "Access", type: "text" },
                                    { name: "Owner", type: "text" },
                                    { name: "CreatedOn", type: "text", },
                                    { name: "ModifiedOn", type: "text", }
                                ]
                                loadGroupsItems(itemarray, fields);
                                HidetogglegroupsTable();
                                breadcrum_Label("Unshare Items with Groups");
                                // $("#GroupLabels")[0].innerText = "Item information";
                            }
                        }).catch(function (err) {
                            AlertMessages("Error", err.details.error.message, "danger");
                        });
                }
            }
            else if (Actiontype == "Import groups") {
                array.forEach(tempdata, function (item) {
                    var ItemObj = {
                        Title: item.title,
                        Access: item.access,
                        Tags: item.tags
                    };
                    itemarray.push(ItemObj);
                });
                $("#GroupItemsContol").empty();
                fields = [
                    {
                        visible: true,
                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                .on("change", function () {
                                    selectedItemsList = [];
                                    if (this.checked) { // check select status
                                        $('.getsubItems').each(function () {
                                            this.checked = true;
                                            selectItem($(this)[0].id);
                                        });
                                    } else {
                                        $('.getsubItems').each(function () {
                                            this.checked = false;
                                            unselectItem($(this)[0].id);
                                        });
                                        selectedItemsList = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.Title)
                                .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        align: "center",
                        width: 50,
                        sorting: false
                    },
                    { name: "Title", type: "text" },
                    { name: "Access", type: "text" },
                    { name: "Tags", type: "text" }

                ]
                loadGroupsItems(itemarray, fields);
                HidetogglegroupsTable();
                //$("#GroupLabels")[0].innerText = "Imported Groups";
            }
            else {
                itemarray = [];
                breadcrum_Label("Share Items with Groups");
                array.forEach(itemsList, function (item) {

                    if (typeof (item) != "undefined" && item != null) {
                        var ItemObj = {
                            id: item.id,
                            Title: item.title,
                            Type: item.type,
                            Access: item.access,
                            Owner: item.owner,
                            CreatedOn: new Date(item.created).toLocaleDateString(),
                            ModifiedOn: new Date(item.modified).toLocaleDateString(),
                        };
                        itemarray.push(ItemObj);
                    }
                });
                $("#GroupItemsContol").empty();
                var fields = [
                    {
                        visible: true,

                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                .on("change", function () {
                                    selectedItemsList = [];
                                    if (this.checked) { // check select status
                                        $('.getsubItems').each(function () {
                                            this.checked = true;
                                            selectItem($(this)[0].id);
                                        });
                                    } else {


                                        $('.getsubItems').each(function () {
                                            this.checked = false;
                                            unselectItem($(this)[0].id);
                                        });
                                        selectedItemsList = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.id)
                                .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        align: "center",
                        width: 50,
                        sorting: false
                    },
                    { name: "Title", type: "text" },
                    { name: "Type", type: "text" },
                    { name: "Access", type: "text" },
                    { name: "Owner", type: "text" },
                    { name: "CreatedOn", type: "text", },
                    { name: "ModifiedOn", type: "text", }
                ]
                loadGroupsItems(itemarray, fields);
                HidetogglegroupsTable();
                //$("#GroupLabels")[0].innerText = "Item information";
            }
        }
        $(".BulkUpdate").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Bulk Update", "Please select group for updating", "warning");
                return;
            }
            count = 0;
            Actiontype = "bulkupdate";
            $(".wizard_header")[0].innerText = "Bulk Update";
            breadcrum_Label("Update Groups");
            $(".getselectetitems").addClass("disbaleClass");
            $("#GroupItemsContol").empty();
            $("#GroupItemsContol").append(BulkUpdatenode);
            $(".invitation-Control").css("display", "none");
            clearInputFields($('#groupsBulkUpdate .grp_control'))
            $("#groupsBulkUpdate").css("display", "block");
            $(".groupFilters").css("display", "none")
            HidetogglegroupsTable();
            // $("#GroupLabels")[0].innerText = "Bulk Update"
            $(function () {

                $('#groupsBulkUpdate input:text').keyup(validateButton);
                $('#groupsBulkUpdate textarea').keyup(validateButton);
                $('#groupsBulkUpdate select').change(validateButton);

                function validateButton() {
                    var validation = true;
                    $('#groupsBulkUpdate input:text, #groupsBulkUpdate select,#groupsBulkUpdate textarea').each(function () {
                        if ($.trim($(this).val()).length > 0) {
                            validation = false;
                        }
                    });

                    if (validation) {
                        $(".getselectetitems").addClass("disbaleClass");
                    } else {
                        $(".getselectetitems").removeClass("disbaleClass");
                    }
                }
            });
        });
        $("#ShareportalItems").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Share Items", "Please select group for adding items", "warning");
                return;
            }
            selectedItemsList = [];
            count = 0;
            Actiontype = 'ShareItemstoGroups';
            GetItemList();
            $(".wizard_header")[0].innerText = "Share Items to Groups";
        });
        $(".unshareItemtogroups").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Unshare Items", "Please select group for removing items", "warning");
                return;
            }
            count = 0;
            selectedItemsList = [];
            Actiontype = 'unshareItemtogroups';
            GetItemList();
            $(".wizard_header")[0].innerText = "Unshare Items from Groups"
        });
        $("#saveGroupoptions").click(function () {
            count = 0;
            $("#loader").css("display", "inline-block");
            $(".success_msg")[0].innerText = "Successfully Updated Groups";
            if (Actiontype == 'AddTags' || Actiontype == "RemoveTags") {
                var tags = selectedItemsList;
                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/update";
                    for (var k = 0; k < groupList.length; k++) {
                        if (selectedItems[i] == groupList[k].id) {
                            if (Actiontype == "RemoveTags") {
                                var tagcount = 0;
                                for (var m = 0; m < tags.length; m++) {
                                    if (groupList[k].tags.indexOf(tags[m]) != -1) {
                                        tagcount++;
                                    }
                                }
                                if (tagcount == groupList[k].tags.length) {
                                    ErrList.push(groupList[k].title);
                                }
                                // var tagslist = groupList[k].tags.filter(function (el) {
                                //     return tags.indexOf(el) < 0;
                                //});

                                var tagslist = groupList[k].tags.filter(function (el) {
                                    return tags.indexOf(el) < 0;
                                });
                            }
                            if (Actiontype == "AddTags") {
                                //var tagslist = tags.concat(groupList[k].tags);
                                if ($(".addTagsrad")[0].checked) {
                                    var tagslist = tags.concat(groupList[k].tags);
                                    var uniqueNames = [];
                                    $.each(tagslist, function (i, el) {
                                        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                                    });
                                    tagslist = uniqueNames;
                                }
                                else { // if choosen replace tags
                                    var tagslist = tags;
                                }
                            }
                            var groupOptions = {
                                tags: tagslist.join(","),
                                f: "json",
                                token: portalToken
                            };
                            var options = {
                                query: groupOptions,
                                responseType: "json",
                                method: "post"
                            };
                            EsriRequest(Actiontype, options);

                        }
                    }
                }
            }
            if (Actiontype == 'ShareItemstoGroups' || Actiontype == 'unshareItemtogroups') {
                if (selectedItemsList.length == 0) {
                    AlertMessages("Items", "Please select atleast one item for sharing", "warning");
                    return;
                }
                for (var i = 0; i < selectedItemsList.length; i++) {
                    if (Actiontype == 'ShareItemstoGroups') {
                        url = Config.portalUrl + "/sharing/rest/content/items/" + selectedItemsList[i] + "/share "
                        var groupOptions = {
                            owner: sesstionItem.username,
                            items: selectedItemsList[i],
                            groups: selectedItems.join(','),
                            confirmItemControl: true,
                            f: "json",
                            token: portalToken
                        };
                    }
                    else {
                        url = Config.portalUrl + "/sharing/rest/content/items/" + selectedItemsList[i] + "/unshare "
                        var groupOptions = {
                            owner: sesstionItem.username,
                            items: selectedItemsList[i],
                            groups: selectedItems.join(','),
                            f: "json",
                            token: portalToken
                        };
                    }
                    var options = {
                        query: groupOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest(Actiontype, options);

                }
            }
            if (Actiontype == 'inviteusers' || Actiontype == 'removeusers') {
                for (var i = 0; i < selectedItems.length; i++) {
                    if (Actiontype == 'inviteusers') {

                        $('input[name="rad"]').click(function () {
                            var $radio = $(this);
                            $radio.siblings('input[name="userinvite"]').data('waschecked', false);
                        });

                        if ($(".useinvitation")[0].checked)
                            url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/invite";
                        else
                            url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/addUsers";
                    }
                    if (Actiontype == 'removeusers')
                        url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/removeUsers";
                    var groupOptions = {
                        users: selectedItemsList.join(","),
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: groupOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest(Actiontype, options);

                }

            }
            if (Actiontype == 'ChangeOwner') {
                ajaxcount = 0; ErrList = [];
                for (var i = 0; i < selectedItems.length; i++) {

                    url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/reassign";

                    var groupOptions = {
                        targetUsername: selectedItemsList.join(","),
                        f: "json",
                        token: portalToken,
                        responseType: "json",
                        method: "post"
                    };
                    var options = {
                        query: groupOptions,
                        responseType: "json",
                        method: "post"
                    };
                    AjaxRequest(url, groupOptions, "POST", "Assign Owner")
                    $("#selected_groups").empty();
                    //EsriRequest(Actiontype, options);

                }
            }
            if (Actiontype == 'bulkupdate') {
                UpdateBulk();
            }
            if (Actiontype == "ExportToCSV" || Actiontype == "ExportToJson") {
                var data = getExportingData();
                if (Actiontype == 'ExportToCSV') {
                    DownloadCsv("PortalGroups", data);
                    showSuccessDiv();
                }
                else {
                    data = JSON.stringify(data, null, "\t");
                    DownloadJson("PortalGroups", data);
                    showSuccessDiv();
                }
                AlertMessages("Export Groups", "Successfully exported groups", "success");
                $(".success_msg")[0].innerText = "Successfully Exported Groups";

            }
            if (Actiontype == "Import groups") {
                url = Config.portalUrl + "/sharing/rest/community/createGroup";
                count = 0;
                for (var i = 0; i < selectedItemsList.length; i++) {
                    for (var j = 0; j < tempdata.length; j++) {
                        if (tempdata[j].title == selectedItemsList[i]) {
                            var groupoptions = tempdata[j];
                            groupoptions.f = "json";
                            groupoptions.token = portalToken;
                            groupoptions.responseType = "json",
                                groupoptions.method = "post"
                            //var options = {
                            //    query: groupoptions,
                            //    responseType: "json",
                            //    method: "post"
                            //};
                            // EsriRequest(Actiontype, options);
                            AjaxRequest(url, groupoptions, "POST", "Import Groups")
                        }
                    }
                }

            }
        })
        function AjaxRequest(requesturl, options, type, label) { //method for catching permission errors
            $.ajax({
                url: requesturl,
                type: type,
                crossDomain: true,
                data: options,
                xhrFields: {
                    withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                },
                success: function (data, textStatus, jqXHR) {
                    count++;
                    var responsedata = data;
                    if (typeof (responsedata) == "string")
                        var responsedata = JSON.parse(data);
                    if (typeof (responsedata.error) != "undefined" && typeof (responsedata.error) != "null") {
                        if (Actiontype == "ChangeOwner" && selectedItems.length == count) {
                            AlertMessages(label, responsedata.error.message, "danger");
                            $(".failure_msg")[0].innerText = responsedata.error.message;
                            showfailureDiv();
                            return
                        }
                        if (Actiontype == "Import groups" && selectedItemsList.length == count) {
                            AlertMessages(label, responsedata.error.message, "danger");
                            $(".failure_msg")[0].innerText = responsedata.error.message;
                            showfailureDiv();
                            return
                        }
                        if (Actiontype == "add") {
                            //$(".head_Actions").css("display", "block");
                            $("#groupsBulkUpdate").css("display", "none");
                            //$("#groupsaccordion").css("display", "block");
                            //$("#GroupItemList").css("display", "none");
                            // $(".groupsForm").css("display", "none");
                            ///$("#EditGroup").hide();
                            //$("#MainCard").show();
                            groupList = [];
                            $('#groupsaccordion').empty();
                            setTimeout(function () {
                                ommonutils.AlertMessages(label, responsedata.error.message, "danger");
                                //$(".failure_msg")[0].innerText = responsedata.error.message;
                                fetchAllGroups();
                            }, 500)
                        }
                        if (Actiontype == "edit") {
                            //$(".head_Actions").css("display", "block");
                            $("#groupsBulkUpdate").css("display", "none");
                            //$("#groupsaccordion").css("display", "block");
                            // $("#GroupItemList").css("display", "none");
                            //$(".groupsForm").css("display", "none");
                            //$("#EditGroup").hide();
                            //$("#MainCard").show();
                            setTimeout(function () {
                                AlertMessages(label, responsedata.error.message, "danger");
                                //$(".failure_msg")[0].innerText = responsedata.error.message;
                                fetchAllGroups();

                            }, 500)
                        }
                        if (Actiontype == "delete" && selectedItems.length == count) {
                            groupList = [];
                            // $('#groupsaccordion').empty();
                            $('#groupsaccordion').destroy();
                            setTimeout(function () {
                                AlertMessages(label, responsedata.error.message, "danger");
                                // $(".failure_msg")[0].innerText = responsedata.error.message;
                                $("#displayPopup").remove();
                                fetchAllGroups();

                            }, 500)
                        }


                    }
                    else {
                        if (Actiontype == "ChangeOwner") {
                            if (!responsedata.success) {
                                ErrList.push(responsedata.itemId);
                            }
                            if (selectedItems.length == count) {
                                if (ErrList.length == selectedItems.length) {
                                    AlertMessages(label, "Failed to assign owner", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to assign owner ";
                                    showfailureDiv();
                                    return;
                                }
                                else {
                                    if (ErrList.length == 0) {
                                        AlertMessages(label, "Successfully assigned new owner", "success");
                                        showSuccessDiv();
                                    }
                                    if (ErrList.length < selectedItems && ErrList.length != 0) {
                                        AlertMessages(label, "Assigned group owners with errors", "success");
                                        showSuccessDiv();
                                    }
                                    //AlertMessages(label, "Assigned group owners with errors", "success");
                                    //var str = [];
                                    //for (var i = 0; i < itemsList.length; i++) {
                                    //    if (ErrList.indexOf(itemsList[i].id) != -1) {
                                    //        str.push(itemsList[i].title);
                                    //    }

                                    //}
                                    //if (str.length > 0)
                                    //    AlertMessages(label, "Failed assign owner for " + str.join(","), "danger");
                                    //showSuccessDiv();
                                }
                            }
                        }
                        else if (Actiontype == "Import groups") {
                            groupList = [];
                            $('#groupsaccordion').empty();
                            if (count == selectedItemsList.length) {
                                showSuccessDiv();
                                AlertMessages(label, "Successfully created groups", "success");
                                return
                            }


                        }
                        else if (Actiontype == "add") {
                            groupList = [];
                            $('#groupsaccordion').empty();
                            // $(".head_Actions").css("display", "block");
                            $("#groupsBulkUpdate").css("display", "none");
                            //  $("#groupsaccordion").css("display", "block");
                            //  $("#GroupItemList").css("display", "none");
                            //  $(".groupsForm").css("display", "none");                          
                            setTimeout(function () {
                                $("#EditGroup").hide();
                                $("#MainCard").show();
                                AlertMessages(label, "Successfully created group", "success");
                                fetchAllGroups();
                                $(".breadcrumb_Home").click();
                            }, 1000);

                        }
                        else if (Actiontype == "edit") {
                            groupList = [];
                            $('#groupsaccordion').empty();
                            // $(".head_Actions").css("display", "block");
                            $("#groupsBulkUpdate").css("display", "none");
                            // $("#groupsaccordion").css("display", "block");
                            // $("#GroupItemList").css("display", "none");
                            // $(".groupsForm").css("display", "none");

                            setTimeout(function () {
                                $("#EditGroup").hide();
                                $("#MainCard").show();
                                AlertMessages(label, "Successfully updated group", "success");
                                fetchAllGroups();
                                $(".breadcrumb_Home").click();
                            }, 500);
                        }
                        else if (Actiontype == "delete" && selectedItems.length == count) {
                            $("#displayPopup").remove();
                            groupList = [];
                            $('#groupsaccordion').empty();
                            setTimeout(function () {
                                fetchAllGroups();
                                AlertMessages(label, "successfully deleted", "success");
                                $(".breadcrumb_Home").click();

                            }, 500);


                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    showfailureDiv();
                    // alert("Error in ajax call");
                }
            });

        };
        $("#ReturnHome").click(function () {
            ShowtogglegroupsTable();
            fetchAllGroups();
            $("#migrate-success").css("display", "none");
            $("#migrate-fail").css("display", "none");
            count = 0;
            current = 1;
            $(".imported_grp").addClass("col-md-6").removeClass("col-md-12");
            setProgressBar(current);

        });
        $(".Firstpreview").click(function () {
            ShowtogglegroupsTable();
            fetchAllGroups();
            count = 0;
            $("#groupsBulkUpdate").css('display', 'none');
            $(".getselectetitems").removeClass("disbaleClass");
            $(".Groups_radbtn").css("display", "none");
            $(".groupFilters").css("display", "none");
        });
        $(".AddTagstogroups").click(function (e) {
            if (selectedItems.length == 0) {
                AlertMessages("Tags", "Please select group for adding tags", "warning");
                return;
            }
            Actiontype = 'AddTags';
            count = 0;
            getGroupInformation(sesstionItem.username);
            breadcrum_Label("Add tags to groups");
            // $(".wizard_header")[0].innerText = "Add tags to groups"
        });
        $(".RemoveTagsfromgroups").click(function (e) {
            if (selectedItems.length == 0) {
                AlertMessages("Tags", "Please select group for removing tags", "warning");
                return;
            }
            $("#AllGroupTags").empty()
            Actiontype = 'RemoveTags';
            var tagsArray = [];
            count = 0;
            var str = '';
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < groupList.length; j++) {
                    if (selectedItems[i] == groupList[j].id) {
                        if (groupList[j].tags.length == 1) {
                            //temparray.push({ "username": usersList[j].username, "Tags": usersList[j].tags.join(",") })
                            str = str + groupList[j].title + ",";
                        }
                        tagsArray = groupList[j].tags.concat(tagsArray);
                    }
                }
            }
            if (str != '') {
                str = str.replace(/,\s*$/, "");
                AlertMessages("Remove Tags", str + " has only single tag,please select groups with multiple tags", "warning");
                return;
            }
            var uniqueNames = [];
            $.each(tagsArray, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            tagsArray = uniqueNames;
            $("#GroupItemsContol").empty();
            CheckBoxController(tagsArray, "RemoveTags");
            breadcrum_Label("Remove tags from groups");
            $(".wizard_header")[0].innerText = "Remove tags from groups"
        });
        $("#uploadgroups").click(function (evt) {
            tempdata = [];
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
            if (regex.test($("#inputGroupFile01").val().toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var JsonData;
                        url = Config.portalUrl + "/sharing/rest/community/createGroup";
                        if ($("#inputGroupFile01")[0].files[0].type != "application/json") {
                            JsonData = JSON.parse(csvJSON(e.target.result));
                            // $("#GroupLabels")[0].innerText = "Importing groups";
                        }
                        if ($("#inputGroupFile01")[0].files[0].type == "application/json") {
                            JsonData = JSON.parse(e.target.result);
                            //$("#GroupLabels")[0].innerText = "Importing groups";
                        }
                        tempdata = JsonData;
                        Actiontype = "Import groups";
                        $(".wizard_header")[0].innerText = "Importing Groups"
                        var validStr = [];
                        var requiredfields = ['title', 'tags', 'access'];
                        for (var i = 0; i < JsonData.length; i++) {
                            for (var j = 0; j < requiredfields.length; j++) {
                                if (typeof (JsonData[i][requiredfields[j]]) != "undefined") {

                                }
                                else {
                                    if (validStr.indexOf(requiredfields[j]))
                                        validStr.push(requiredfields[j])
                                }
                            }
                        }

                        if (validStr.length != 0) {
                            validStr = validStr.join(",") + " are invalid fields in imported file,please upload a valid file";
                            $(".closeModal").click();
                            AlertMessages("Import groups", validStr, "danger");
                            return
                        }
                        var duplicate_grp = []; var unique_grp = []; var Groupstring = [];

                        for (var i = 0; i < groupList.length; i++) {
                            Groupstring.push(groupList[i].title);
                        }

                        for (var j = 0; j < JsonData.length; j++) {
                            if (Groupstring.indexOf(JsonData[j].title) == -1)
                                unique_grp.push(JsonData[j]);
                            else
                                duplicate_grp.push(JsonData[j].title);
                        }

                        if (duplicate_grp.length != 0) {
                            AlertMessages("Import Groups", duplicate_grp.join(",") + " are already existing", "warning");
                            if (duplicate_grp.length == JsonData.length) {
                                $(".closeModal").click();
                                return;
                            }
                        }
                        tempdata = unique_grp;
                        GetItemList();
                        breadcrum_Label("Importing Groups");
                        $(".closeModal").click();
                    }
                    reader.readAsText($("#inputGroupFile01")[0].files[0]);
                } else {
                    AlertMessages("", "This browser does not support HTML5.", "danger");
                }
            } else {
                AlertMessages("File Upload", "Please upload a valid CSV or JSON file.", "danger");
            }
        });
        $("#ExportGroupCsv").click(function () { //export groups to csv
            Actiontype = "ExportToCSV";
            CheckBoxController(GroupParameters, "ExportGroups");
            breadcrum_Label("Export Groups");
            $(".wizard_header")[0].innerText = "Export Groups"
        })
        function getExportingData() { //prepare exporting group data
            var groups = []; //groupList
            if (selectedItems.length > 0) {
                for (var i = 0; i < selectedItems.length; i++) {
                    for (var j = 0; j < groupList.length; j++) {
                        if (selectedItems[i] == groupList[j].id) {
                            groups.push(groupList[j]);
                            break;
                        }
                    }

                }
            }
            if (groups.length == 0)
                groups = groupList;
            var exportData = [];

            for (var j = 0; j < groups.length; j++) {
                var exportoptions = {};
                for (var k = 0; k < selectedItemsList.length; k++) {
                    for (var m = 0; m < GroupParameters.length; m++) {
                        if (GroupParameters[m].Key == selectedItemsList[k]) {

                            if (typeof (groups[j][selectedItemsList[k]]) == "object" && groups[j][selectedItemsList[k]] != null) {
                                exportoptions[GroupParameters[m].exportLabel] = groups[j][GroupParameters[m].Key].join(" ");
                            }
                            else {
                                exportoptions[GroupParameters[m].exportLabel] = groups[j][GroupParameters[m].Key];
                            }
                            break;
                        }
                    }
                }
                exportData.push(exportoptions);
            }
            return exportData;

        };
        $("#ExportGroupJson").click(function () { // exports groups to json
            Actiontype = "ExportToJson";
            CheckBoxController(GroupParameters, "ExportGroups");
            breadcrum_Label("Export Groups");
            $(".wizard_header")[0].innerText = "Export Groups"
        });
        $(".Deletegroups").click(function (evt) { // delete groups
            Actiontype = "delete";
            if (selectedItems.length == 0) {
                AlertMessages("Delete group", "please select atleast one group", "danger");
                return
            }
            count = 0;


            const swalWithBootstrapButtons = swal.mixin({
                confirmButtonClass: 'btn btn-success mb-2',
                cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                buttonsStyling: false,
            });
            errcount = 0;
            swalWithBootstrapButtons({
                title: 'Delete Groups',
                text: "Do you want to delete selected groups?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No!',
                reverseButtons: true
            }).then(function (result) {
                if (result.value) {
                    for (var i = 0; i < selectedItems.length; i++) {
                        url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[i] + "/delete";
                        var queryParams = {
                            f: "json",
                            token: portalToken,
                            responseType: "json",
                            method: "post"
                        };

                        AjaxRequest(url, queryParams, "POST", "Delete Groups")

                    }
                } else if (
                    // Read more about handling dismissals
                    result.dismiss === swal.DismissReason.cancel
                ) {

                }
            });
        });
        //$("#sign-out").click(function () {

        //    signOutCredentials(esriId);
        //});
        function UpdateBulk(evt) { //bulkupdate
            var groupOptions = { f: "json", token: portalToken };
            var boolflag = true;
            var childElements = $("#groupsBulkUpdate .grp_control");
            for (var i = 0; i < childElements.length; i++) {
                if ($(childElements)[i].value != "") {
                    groupOptions[$(childElements[i]).attr("data-target")] = $(childElements)[i].value;
                    boolflag = false;
                }
            }
            if (boolflag) {
                AlertMessages("", "please enter atleast one value", "warning");
                return;
            }
            var options = {
                query: groupOptions,
                responseType: "json",
                method: "post"
            };
            for (var k = 0; k < selectedItems.length; k++) {
                url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItems[k] + "/update";
                EsriRequest(Actiontype, options);
            }

        };
        $(".cleargroupsinfo").click(function () {
            $("#groupIteminfo").empty();
            $(".cleargroupsinfo").css("display", "none");
        })
        $(".createNewGroup").click(function (evt) {
            CreateGroup();
        });
        function CreateGroup() {
            Actiontype = "add";
            $('.GroupTags').tagsinput('removeAll');
            $(".bootstrap-tagsinput").addClass("form-control");
            var childElements = $("#GroupItemList .grp_control");
            clearInputFields(childElements);
            url = Config.portalUrl + "/sharing/rest/community/createGroup";
            $("#groupsBulkUpdate").css("display", "none");
            $("#MainCard").hide();
            $("#EditGroup").show();
            $(".Group_label")[0].innerText = "Create Group";
            breadcrum_Label("Create Group");
            $(".Grp_footer").css("display", "");
        }
        function EsriRequest(actiontype, options) {

            esriRequest(url, options)
                .then(function (response) {
                    count++
                    url = "";
                    if (actiontype == "iteminfo") {
                        $("#groupIteminfo").empty();
                        $(".groupInfo_label")[0].innerText = "Group Items";

                        if (response.data.items.length > 0) {
                            var items = response.data.items;
                            var table = '<table class="table table-hover mt-0" ><thead class="bg-light p-0"><tr><th scope="col" style="width: 30%">Title</th><th scope="col" style="width: 30%">Access</th><th scope="col" style="width: 30%">Description</th><th scope="col" style="width: 30%">Owner</th><th scope="col" style="width: 30%">url</th><th scope="col" style="width: 30%">Type</th><tr></thead>'
                            var trRow = '';
                            for (var i = 0; i < items.length; i++) {

                                trRow = trRow + '<tr>' +
                                    '<td class="text-dark">' + items[i].title + '</td>' +
                                    '<td>' + items[i].access + '</td>' +
                                    '<td>' + items[i].description + '</td>' +
                                    '<td>' + items[i].owner + '</td>' +
                                    '<td><span>' + items[i].url + '</span></td>' +
                                    '<td>' + items[i].type + '</td>' +
                                    '</tr >';

                            }
                            table = table + "<tbody>" + trRow + '</tbody></table>'
                            $("#groupIteminfo").append(table);
                            $("#MainCard").hide();
                            $("#GroupInfo").show();
                            breadcrum_Label("Group Items");
                        }
                        else {
                            $("#MainCard").show();
                            $("#GroupInfo").hide();
                            AlertMessages("Group items", "No items are found", "warning");
                            return
                        }
                    }
                    else if (actiontype == "userlist") {
                        $("#groupIteminfo").empty();
                        $(".groupInfo_label")[0].innerText = "Group Users";
                        // $(".cleargroupsinfo").css("display", "block");
                        if (response.data.users.length > 0) {
                            var users = response.data.users;
                            var table = '<table class="table table-hover mt-0" ><thead class="bg-light p-0"><tr><th scope="col" style="width: 30%">Name</th><th scope="col" style="width: 30%">Member type</th><th scope="col" style="width: 30%">User Name</th><th scope="col" style="width: 30%">Joined Date</th><tr></thead>'
                            var trRow = '';
                            for (var i = 0; i < users.length; i++) {
                                var joineddate = new Date(response.data.users[i].joined)
                                trRow = trRow + '<tr>' +
                                    '<td class="text-dark">' + users[i].fullName + '</td>' +
                                    '<td>' + users[i].memberType + '</td>' +
                                    '<td>' + users[i].username + '</td>' +
                                    '<td>' + joineddate.toLocaleDateString() + '</td>' +
                                    '</tr >';

                            }
                            table = table + '<tbody>' + trRow + '</tbody></table>'
                            $("#groupIteminfo").append(table);
                            $("#MainCard").hide();
                            $("#GroupInfo").show();
                            breadcrum_Label("Group Users");
                        }
                        else {
                            $("#MainCard").show();
                            $("#GroupInfo").hide();
                            AlertMessages("Group users", "No users are found", "warning");
                            return
                        }
                    }
                    else {
                        $('#groupsaccordion').empty();
                        if (actiontype == "add") {
                            AlertMessages("Group Creation", " group created successfully", "success");
                            ShowtogglegroupsTable();
                            fetchAllGroups(portalToken, sesstionItem.username);
                            $("#GroupItemList").css("display", "none");

                        }
                        if (Actiontype == "Import groups") {
                            AlertMessages("import Groups", "  Imported groups successfully", "success");
                            showfailureDiv();
                        }
                        if (actiontype == "edit") {
                            AlertMessages("Group Updation", " group updated successfully", "success");
                            ShowtogglegroupsTable();
                            $("#GroupItemList").css("display", "none");
                        }
                        if (actiontype == 'bulkupdate') {
                            if (count == selectedItems.length) {
                                AlertMessages("Bulk Update", " groups updated successfully", "success");
                                showSuccessDiv();
                            }
                        }
                        if (actiontype == "delete") {
                            if (count == selectedItems.length) {
                                AlertMessages("Group Deletion", " group deleted successfully", "success");
                                $("#displayPopup").remove();
                            }
                        }
                        if (actiontype == 'AddTags') {
                            if (count == selectedItems.length) {
                                AlertMessages("Adding Tags", "Tags updated successfully", "success");
                                showSuccessDiv()
                            }
                        }
                        if (actiontype == 'RemoveTags') {
                            if (count == selectedItems.length) {
                                if (ErrList.length == 0) {
                                    AlertMessages("Remove Tags", "Tags removed successfully", "success");
                                    showSuccessDiv();
                                }
                                else if (ErrList.length == selectedItems.length) {
                                    AlertMessages("Remove Tags", "Failed to remove tags", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to remove tags";
                                    showfailureDiv();
                                }
                                else {
                                    if (ErrList.length > 0)
                                        AlertMessages("Remove Tags", "Failed to remove tags for " + ErrList.join(","), "danger");
                                    AlertMessages("Removing Tags", "Tags removed with some errors", "success");
                                    showSuccessDiv();
                                }


                            }

                        }
                        if (actiontype == 'ShareItemstoGroups') {
                            if (response.data.notSharedWith.length != 0) {
                                if (ErrList.indexOf(response.data.notSharedWith) == -1)
                                    ErrList.push(response.data.notSharedWith);
                            }
                            if (count == selectedItemsList.length) {
                                if (ErrList.length == 0) {
                                    AlertMessages("Share Items to groups", "Successfully shared items to group", "success");
                                    showSuccessDiv();
                                }
                                else {
                                    if (ErrList.length == selectedItems.length) {
                                        //AlertMessages("Share Items to groups", "Failed to share items with groups", "danger");
                                        $(".failure_msg")[0].innerText = "Failed to share items with groups";
                                        showfailureDiv();
                                    }
                                    else {
                                        AlertMessages("Share Items to groups", "successfully shared items with errors", "success");
                                        showSuccessDiv();
                                    }
                                }
                                ErrList = [];
                                //$("#migrate-success").css("display", "block");
                                //$("#migrate-fail").css("display", "none");
                                //AlertMessages("Share Items to groups", "Successfully shared items to group", "success");
                            }
                        }
                        if (actiontype == "unshareItemtogroups") {
                            if (count == selectedItemsList.length) {
                                showSuccessDiv();
                                AlertMessages("Unshare items from groups", "Successfully unshared items from group", "success");
                            }
                        }
                        if (actiontype == 'inviteusers') {

                            if (response.data.notAdded.length != 0) {
                                var notaddedusers = response.data.notAdded;
                                for (var i = 0; i < notaddedusers.length; i++) {
                                    ErrList.push(notaddedusers[i])
                                }
                            }

                            if (count == selectedItems.length) {
                                var mshlabel = 'Add Users';
                                if ($(".useinvitation")[0].checked)
                                    mshlabel = "Invite Users"
                                if ($(".useinvitation")[0].checked && ErrList.length == 0) {
                                    AlertMessages(mshlabel, "Invitation has sent to user", "success");
                                }
                                else {
                                    var uniqueNames = [];
                                    $.each(ErrList, function (i, el) {
                                        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                                    });
                                    ErrList = uniqueNames;
                                    if (ErrList.length == 0) {
                                        AlertMessages(mshlabel, "Successfully added user to groups", "success");
                                        showSuccessDiv();
                                    }
                                    else if (ErrList.length == selectedItemsList.length) {
                                        // AlertMessages(mshlabel, "Failed to invite user to groups", "danger");
                                        $(".failure_msg")[0].innerText = "Failed to invite user to groups";
                                        showfailureDiv();
                                    }
                                    else if (ErrList.length != selectedItemsList.length && ErrList.length != 0) {
                                        showSuccessDiv();
                                        AlertMessages(mshlabel, "Successfully added user to groups with errors", "success");
                                    }

                                }
                            }
                        }
                        if (actiontype == 'removeusers') {
                            if (response.data.notRemoved.length != 0) {
                                var notRemoved = response.data.notRemoved;
                                for (var i = 0; i < notRemoved.length; i++) {
                                    ErrList.push(notRemoved[i])
                                }
                            }
                            if (count == selectedItems.length) {
                                //  AlertMessages("Remove Users", "Successfully removed user from groups", "success");
                                //var uniqueNames = [];
                                //$.each(ErrList, function (i, el) {
                                //    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                                //});
                                //ErrList = uniqueNames;
                                if (ErrList.length == 0) {
                                    AlertMessages("Remove Users", "Successfully removed users from groups", "success");
                                    showSuccessDiv();
                                }
                                else if (ErrList.length == selectedItems.length) {
                                    AlertMessages("Remove Users", "Failed to remove user from groups", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to remove user from groups";
                                    showfailureDiv();
                                }
                                else if (ErrList.length != selectedItems.length && ErrList.length != 0) {
                                    showSuccessDiv();
                                    AlertMessages("Remove Users", "Successfully removed user from groups with errors", "success");
                                }
                            }
                        }
                        if (actiontype == 'ChangeOwner') {
                            if (count == selectedItems.length)
                                AlertMessages("Reassign groups", "Successfully changed groups owner", "success");
                        }
                        setTimeout(function () {
                            fetchAllGroups(portalToken, sesstionItem.username);
                        }, 1000);

                    }
                    $(".Groups_radbtn").css("display", "none");

                }).catch(function (err) {
                    count++;
                    console.log(err);
                    if (actiontype == "add") {
                        if (err.details.messageCode == "COM_0044") {
                            AlertMessages("Error", err.details.messages[0], "danger");
                            $(".failure_msg")[0].innerText = err.details.messages[0];
                            return
                        }
                    }
                    else if (Actiontype == "ChangeOwner") {
                        AlertMessages("Error", err.message, "danger");
                        $(".failure_msg")[0].innerText = err.messages;
                        return;
                    }
                    else {
                        AlertMessages("Error", err.message, "danger");
                        $(".failure_msg")[0].innerText = err.messages;
                        showfailureDiv();
                        return;
                    }

                });

        };
        function ShowtogglegroupsTable() {
            //$("#groupsaccordion").css("display", "block");
            //$("#Groups_wizard").css("display", "none");
            $("#wizard_itemstab").css("display", 'block');
            $("#wizard_Successtab").css("display", 'none');
            $("#wizard_Successtab").css("opacity", "0");
            $("#wizard_itemstab").css("opacity", "1");
            $("#SelectItems").addClass("active");
            $("#Confirm").removeClass("active");
            $("#Finish").removeClass("active");
            $("#Wizard_Groups").hide();
            $("#MainCard").show();
            setProgressBar(1);
            //$(".groupFilters").css("display", "none");
            //$("#groupsaccordion").empty();
            //$(".head_Actions").css("display", "block");
            // $(".cleargroupsinfo").click();
        };
        function HidetogglegroupsTable() {
            // $("#groupsaccordion").css("display", "none");
            // $("#Groups_wizard").css("display", "block");
            $("#wizard_itemstab").css("display", 'block');
            $("#wizard_Successtab").css("display", 'none');
            //$(".Main_groupview").css("display", "none");
            //  $(".head_Actions").css("display", "none");
            $("#wizard_Successtab").css("opacity", "0");
            $("#wizard_itemstab").css("opacity", "1");
            $("#SelectItems").addClass("active");
            $("#Confirm").removeClass("active");
            $("#Finish").removeClass("active");
            $("#Wizard_Groups").show();
            $("#MainCard").hide();
            setProgressBar(1);
            // $(".groupFilters").css("display", "none")
            // $(".cleargroupsinfo").click();
        };
        $("#SaveGroup").click(function (evt) {
            count = 0;
            var groupOptions = {};
            if ($(".GroupTileName")[0].value == "" || $("#Groupaccess")[0].value == "") {
                AlertMessages("Create group", "please enter required fields", "success");
                return
            }

           // var regexp = /^[^<|>|%]+$/;
            if ($(".GroupTileName")[0].value.indexOf("%") != -1 || $(".GroupTileName")[0].value.indexOf("<") != -1 || $(".GroupTileName")[0].value.indexOf(">") != -1) { 
                AlertMessages("Create group", "Group name cannot contain any of these characters:%,<, or >.", "warning");
                return
            }

            var formdata = $("#groupsForm").serializeArray();
            var thumbnailInfo = document.getElementById("GroupThumbnail");
            var groupOptions = {
                f: "json",
                token: portalToken,
                responseType: "json",
                method: "post"
            };
            for (var i = 0; i < formdata.length; i++) {
                if (formdata[i].value != "") {
                    groupOptions[formdata[i].name] = formdata[i].value
                }
            }
            //var options = {
            //    query: groupOptions,
            //    responseType: "json",
            //    method: "post"
            //};
            if (Actiontype == "add") {
                // Ajax_createGroup(groupOptions, "Create Group");
                AjaxRequest(url, groupOptions, "POST", "Create Groups")
            }
            else {
                //Ajax_createGroup(groupOptions, "Update Group");
                AjaxRequest(url, groupOptions, "POST", "Update Groups")
            }
            //EsriRequest(Actiontype, options);

        });
        function Ajax_createGroup(options, Label) {
            try {
                $.ajax({
                    url: url,
                    type: "POST",
                    crossDomain: true,
                    data: options,
                    xhrFields: {
                        withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                    },
                    success: function (data, textStatus, jqXHR) {
                        var response = data;
                        if (typeof (data) == "string") {
                            response = JSON.parse(data);
                        }
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {

                            AlertMessages(Label, response.error.message, "danger");
                            $(".failure_msg")[0].innerText = response.error.message;
                            return
                        }
                        else {
                            $('#groupsaccordion').empty();
                            if (Actiontype == "add") {
                                AlertMessages(Label, " group created successfully", "success");
                                ShowtogglegroupsTable();
                                fetchAllGroups(portalToken, sesstionItem.username);
                                $("#GroupItemList").css("display", "none");

                            }
                            if (Actiontype == "Import groups") {
                                AlertMessages("import Groups", "  Imported groups successfully", "success");
                                fetchAllGroups(portalToken, sesstionItem.username);
                                showSuccessDiv();
                            }
                            if (Actiontype == "edit") {
                                AlertMessages(Label, " group updated successfully", "success");
                                fetchAllGroups(portalToken, sesstionItem.username);
                                ShowtogglegroupsTable();
                                $("#GroupItemList").css("display", "none");
                            }

                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
        function CheckBoxController(data, Label) {
            $('input[name="rad"]').click(function () {
                var $radio = $(this);
                $radio.siblings('input[name="userinvite"]').data('waschecked', false);
            });
            if (Label == "AddTags")
                tempdata = data;
            var checkboxNode = ' <div class="form-row sel_Allchkbox">' +
                '<div class="col-md-4 text-center1" >' +
                '<div class="custom-control custom-checkbox mb-0" style="position:absolute;bottom:0px">' +
                '<input type="checkbox" id="customcheckboxInline5"  name="customcheckboxInline1" class="custom-control-input selectallFields" />' +
                '<label class="custom-control-label" for="customcheckboxInline5">Select All</label> </div></div>' +

                '<div class="col-md-4 text-center1 Groupradio_btn"></div>' +
                '<div class="col-md-4 text-center1 GroupTags_btn"></div>' +


                '</div > <hr class="mb-0 pb-0">';

            var subCheckboxNode = '<div class="form-row mt-4 sel_Fields">';
            for (var i = 0; i < data.length; i++) {
                if (Label == "ExportGroups") {
                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].Key + '" name = "' + data[i].Key + '" class="custom-control-input selectFields" value= "' + data[i].Key + '">'
                        + '<label class="custom-control-label" for="' + data[i].Key + '"> <span class="contOverflow">' + data[i].Name + '</span></label></div ></div>';


                }
                else if (Label == "AddTags") {
                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].tag + '" name = "' + data[i].tag + '" class="custom-control-input selectFields" value= "' + data[i].tag + '">'
                        + '<label class="custom-control-label" for="' + data[i].tag + '"> <span class="contOverflow">' + data[i].tag + '</span></label></div ></div>'

                }
                else {
                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i] + '" name = "' + data[i] + '" class="custom-control-input selectFields" value= "' + data[i] + '">'
                        + '<label class="custom-control-label" for="' + data[i] + '"> <span class="contOverflow">' + data[i] + '</span></label></div ></div>'


                }
            }
            subCheckboxNode = subCheckboxNode + "</div>";
            $("#GroupItemsContol").empty();

            HidetogglegroupsTable();
            $("#GroupItemsContol").append(checkboxNode).append(subCheckboxNode);
            $(".Groupradio_btn").append(groupTags);
            if (Label == "AddTags") {
                var button = '<div class="tagsSec col-md-12"><div class="form-row d-flex justify-content-end"><input type="text" class="Tagcontent form-control  form-control-sm col-md-4 mr-1"/> <button class="addTagbtn btn btn-primary btn-sm">Add tag</button></div></div>';
                $(".GroupTags_btn").append(button);
            }

            $(".addTagbtn").click(function (evt) {
                evt.preventDefault();
                var newTagtext = $(".Tagcontent")[0].value;
                if (newTagtext == "") {
                    AlertMessages("Tags", "Please enter tag", "warning");
                    return;
                }
                if (newTagtext.indexOf("<") != -1 || newTagtext.indexOf(">") != -1) {
                    AlertMessages("Tags", "Tag  cannot contain any of these characters:< or >.", "warning");
                    return;
                }
                var isTagexists = false;
                $(".sel_Fields .selectFields").each(function () {
                    if ($(this).val().toUpperCase() == newTagtext.toUpperCase()) {
                        AlertMessages("Add tags", $(".Tagcontent")[0].value + "tag already exists", "warning");
                        isTagexists = true;
                        return;
                    }
                });
                if (isTagexists)
                    return;
                tempdata.push({ "tag": newTagtext });
                CheckBoxController(tempdata, "AddTags")
                //var newTagnode = '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectFields" value= "' + newTagtext + '"/>' + newTagtext + '</span><br/>'
                //$(".sel_Fields").append(newTagnode);
                AlertMessages("Add tags", $(".Tagcontent")[0].value + "tag added to below list", "success");
                $(".Tagcontent")[0].value = '';
                $("#GroupItemsContol").removeClass("jsgrid");
            });
            $(".getselectetitems").addClass("disbaleClass");
            $(".sel_Allchkbox").click(function () {  // check or uncheck all checkbox
                $('#selected_items').empty();
                selectedItemsList = [];
                if ($(".sel_Allchkbox :checkbox")[0].checked) {
                    $('.sel_Fields :checkbox').not(this).prop('checked', true);
                    $(".sel_Fields input:checkbox:checked").each(function () {
                        selectedItemsList.push($(this).val());
                    });
                }
                else {
                    $('.sel_Fields input:checkbox').not(this).prop('checked', false);
                    selectedItemsList = [];
                }
                if (selectedItemsList.length == 0) {
                    $(".getselectetitems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselectetitems").removeClass("disbaleClass");
                    if (Actiontype == 'RemoveTags') { // validation while user removes all tags at once
                        var RemovalFlag = validateTagsRemoval();
                        if (!RemovalFlag) {
                            $(".getselectetitems").addClass("disbaleClass");
                            return;
                        }
                    }
                }
            })
            $(".sel_Fields :checkbox").click(function (evt) {  // check or uncheck checkbox
                $('#selected_items').empty();
                if (evt.currentTarget.checked) {
                    selectedItemsList.push(evt.currentTarget.value);
                }
                else {
                    var removeItem = evt.currentTarget.value;
                    selectedItemsList = jQuery.grep(selectedItemsList, function (value) {
                        return value != removeItem;
                    });
                }
                if ($(".sel_Fields :checkbox").length != $(".sel_Fields input:checked")) {
                    $(".selectallFields")[0].checked = false;
                }
                if (selectedItemsList.length == 0) {
                    $(".getselectetitems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselectetitems").removeClass("disbaleClass");
                    if (Actiontype == 'RemoveTags') { // validation while user removes all tags at once
                        var RemovalFlag = validateTagsRemoval();
                        if (!RemovalFlag) {
                            $(".getselectetitems").addClass("disbaleClass");
                            return;
                        }
                    }
                }

            })
            $("#GroupItemsContol").removeClass("jsgrid");
        }
        function validateTagsRemoval() {
            var uniqueNames = [];
            var tags = selectedItemsList
            $.each(tags, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            tags = uniqueNames;
            ErrList = [];
            for (var i = 0; i < selectedItems.length; i++) {
                for (var k = 0; k < groupList.length; k++) {
                    if (selectedItems[i] == groupList[k].id) {
                        var tagcount = 0;
                        for (var m = 0; m < tags.length; m++) {
                            if (groupList[k].tags.indexOf(tags[m]) != -1) {
                                tagcount++;
                            }
                        }
                        if (tagcount == groupList[k].tags.length) {
                            ErrList.push(groupList[k].title);
                        }
                    }
                }
            }
            if (ErrList.length > 0) {
                AlertMessages("Remove Tags", "Cant remove all tags from " + ErrList.join(','), "warning");
                return false;
            }
            else {
                return true;
            }
        }
        function getGroupInformation(id) {
            var v_url = Config.portalUrl + "/sharing/rest/community/groups/" + id;
            if (Actiontype == 'AddTags')
                v_url = Config.portalUrl + "/sharing/rest/community/users/" + id + "/tags";
            if (Actiontype == 'inviteusers' || Actiontype == 'removeusers' || Actiontype == 'ChangeOwner')
                v_url = Config.portalUrl + "/sharing/rest/portals/self/users";
            var queryParams = {
                f: "json",
                token: portalToken,
                excludeSystemUsers: true
            };
            var options = {
                query: queryParams,
                responseType: "json"

            };
            esriRequest(v_url, options)
                .then(function (response) {
                    selectedItemsList = [];
                    var selectItem = function (item) {
                        selectedItemsList.push(item);
                        if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                            $("#selectAllItemCheckbox").prop("checked", true);
                        } else {
                            $("#selectAllItemCheckbox").prop("checked", false);
                        }
                        if (selectedItemsList.length == 0)
                            $(".getselectetitems").addClass("disbaleClass");
                        else {
                            $(".getselectetitems").removeClass("disbaleClass");
                        }
                    };
                    var unselectItem = function (item) {

                        selectedItemsList = $.grep(selectedItemsList, function (i) {
                            return i !== item;
                        });
                        if (selectedItemsList.length == 0) {
                            $('#selectAllItemCheckbox').attr('checked', false);
                        }
                        if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                            $("#selectAllItemCheckbox").prop("checked", true);
                        } else {
                            $("#selectAllItemCheckbox").prop("checked", false);
                        }
                        if (selectedItemsList.length == 0)
                            $(".getselectetitems").addClass("disbaleClass");
                        else {
                            $(".getselectetitems").removeClass("disbaleClass");
                        }
                    };
                    if (Actiontype == 'ChangeOwner') {
                        var selectItem1 = function (node, item) {
                            selectedItemsList = [];
                            selectedItemsList.push(item);

                            var nodeList = $("#GroupItemsContol .jsgrid-cell .getsubItems");
                            $("#GroupItemsContol .jsgrid-cell .getsubItems").each(function (node) {
                                if ($(nodeList)[node].id != item) {
                                    $(nodeList)[node].checked = false;
                                }
                            })

                            if (selectedItemsList.length == 0)
                                $(".getselectetitems").addClass("disbaleClass");
                            else {
                                $(".getselectetitems").removeClass("disbaleClass");
                            }
                        };
                        var unselectItem1 = function (item) {

                            selectedItemsList = $.grep(selectedItemsList, function (i) {
                                return i !== item;
                            });


                            if (selectedItemsList.length == 0)
                                $(".getselectetitems").addClass("disbaleClass");
                            else {
                                $(".getselectetitems").removeClass("disbaleClass");
                            }
                        };


                    }



                    if (Actiontype == 'edit' || Actiontype == 'view') {
                        $(["#AddContentGroup", "#Memberspermission", "#UpdateItems"]).css("display", "none");
                        $(".GroupTileName")[0].value = response.data.title,
                            $(".groupDesc")[0].value = response.data.snippet;
                        $(".groupDesc1")[0].value = response.data.description;
                        var tags = response.data.tags;
                        $.each(tags, function (index, value) {
                            $('.GroupTags').tagsinput('add', value);
                        });
                        $("#Groupaccess")[0].value = response.data.access;
                        $("#JoinGroup")[0].value = response.data.isInvitationOnly;
                        $("#SortingFields")[0].value = (response.data.sortField == null) ? "" : response.data.sortField;
                        $("#SortingOrder")[0].value = (response.data.sortOrder == null) ? "" : response.data.sortOrder
                    }
                    else if (Actiontype == 'AddTags') {
                        $(".Groups_radbtn").css("display", "block");
                        var TagsList = response.data.tags;
                        CheckBoxController(TagsList, "AddTags");
                    }
                    else if (Actiontype == 'inviteusers' || Actiontype == 'removeusers' || Actiontype == 'ChangeOwner') {
                        var users = response.data.users;
                        if (users.length == 1) {
                            AlertMessages(Actiontype, "No users are found", "warning");
                            return;
                        }

                        if (Actiontype == "inviteusers") {

                            breadcrum_Label("Invite Users to Groups")

                        }
                        if (Actiontype == "removeusers") {
                            breadcrum_Label("Remove Users from Groups")
                        }
                        if (Actiontype == "ChangeOwner") {
                            breadcrum_Label("Assign Owner");
                        }
                        var users = response.data.users;
                        var userArray = [];
                        array.forEach(users, function (user) {
                            if (user.username != sesstionItem.username) {
                                var rolename = '';
                                for (var m = 0; m < rolesData.length; m++) {
                                    if (rolesData[m].id == user.role) {
                                        rolename = rolesData[m].name;
                                    }
                                }
                                var UserObj = {
                                    id: user.username,
                                    Title: user.username,
                                    Name: user.fullName,
                                    Type: user.userType,
                                    Role: rolename,
                                    Level: user.level,
                                    Access: user.access,
                                    CreatedOn: new Date(user.created).toLocaleDateString(),
                                    ModifiedOn: new Date(user.modified).toLocaleDateString(),
                                };
                                userArray.push(UserObj);
                            }
                        });


                        $("#GroupItemsContol").empty();
                        var fields = [
                            {
                                visible: true,

                                headerTemplate: function () {
                                    if (Actiontype == 'ChangeOwner') {
                                        return $("<span>");
                                    }
                                    else {
                                        return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                            .on("change", function () {
                                                selectedItemsList = [];
                                                if (this.checked) { // check select status
                                                    $('.getsubItems').each(function () {
                                                        this.checked = true;
                                                        selectItem($(this)[0].id);
                                                    });
                                                } else {


                                                    $('.getsubItems').each(function () {
                                                        this.checked = false;
                                                        unselectItem($(this)[0].id);
                                                    });
                                                    selectedItemsList = [];
                                                }
                                            });
                                    }

                                },
                                itemTemplate: function (_, item) {
                                    if (Actiontype == 'ChangeOwner') {
                                        return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.id)
                                            .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                            .on("change", function () {
                                                $(this).is(":checked") ? selectItem1($(this), $(this)[0].id) : unselectItem1($(this), $(this)[0].id);
                                            });
                                    }
                                    else {
                                        return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.id)
                                            .prop("checked", $.inArray(item.Title, selectedItemsList) > -1)
                                            .on("change", function () {
                                                $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                            });
                                    }

                                },
                                align: "center",
                                width: 50,
                                sorting: false
                            },
                            { name: "Title", type: "text", title: 'User Name' },
                            { name: "Name", type: "text" },
                            { name: 'Type', type: "text" },
                            { name: "Role", type: "text" },
                            { name: 'Level', type: "text" },
                            { name: "Access", type: "text" },
                            { name: "CreatedOn", type: "text", },
                            { name: "ModifiedOn", type: "text", }
                        ]
                        loadGroupsItems(userArray, fields);
                        //$("#GroupLabels")[0].innerText = "User information";
                        HidetogglegroupsTable();
                    }
                    $(".head_Actions").css("display", "none");
                })
                .catch(function (err) {
                    AlertMessages("Error", err.message, "danger");
                    $(".failure_msg")[0].innerText = err.message;
                });

        };


        function loadGroupsItems(Itemdata, Fields) {
            $("#GroupItemsContol").jsGrid({
                width: "auto",
                height: "auto",
                heading: true,
                filtering: false,
                sorting: true,
                paging: true,
                pageSize: 5,
                data: Itemdata,
                controller: {
                    data: Itemdata,
                    loadData: function (filter) {
                        return $.grep(this.data, function (item) {
                            return (!filter.Title || item.Title.indexOf(filter.Title) >= 0);
                        });
                    },
                },
                onPageChanged: function (args) {
                    $('#selectAllItemCheckbox').prop('checked', false);
                    $(".getselectetitems").addClass("disbaleClass");
                },
                fields: Fields
            });
            selectedItemsList = [];
            $(".getselectetitems").addClass("disbaleClass");
            $("#GroupItemsContol").css("width", "auto");
        }
        $("#search").keydown(function (event) {
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#groupsaccordion").jsGrid("search", { GroupName: uname, Owner: uname, Access: uname }).done(function () { });
            }
            else {
                $("#groupsaccordion").jsGrid("clearFilter").done(function () { });
            }
        });
        function LoadGroupslist(groupsinfo) {
            var groupData = [];
            for (var i = 0; i < groupsinfo.length; i++) {
                var GroupObj = {
                    GroupId: groupsinfo[i].id,
                    GroupName: groupsinfo[i].title,
                    Access: groupsinfo[i].access,
                    Owner: groupsinfo[i].owner,
                    Summary: groupsinfo[i].snippet,
                    Description: groupsinfo[i].description,
                    Tags: groupsinfo[i].tags,
                    Capabilities: groupsinfo[i].capabilities,
                    AutoJoin: groupsinfo[i].autoJoin,
                    isFav: groupsinfo[i].isFav,
                    isInvitationOnly: groupsinfo[i].isInvitationOnly,
                    Phone: groupsinfo[i].phone,
                    isReadOnly: groupsinfo[i].isReadOnly,
                    isViewOnly: groupsinfo[i].isViewOnly,
                    Provider: groupsinfo[i].provider,
                    providerGroupName: groupsinfo[i].providerGroupName,
                    NotificationsEnabled: groupsinfo[i].notificationsEnabled,
                    CreatedDate: groupsinfo[i].created,
                    ModifiedDate: groupsinfo[i].modified,
                };
                groupData.push(GroupObj);
            }
            var DateField = function (config) {
                jsGrid.Field.call(this, config);
            };

            DateField.prototype = new jsGrid.Field({
                sorter: function (date1, date2) {
                    return new Date(date1) - new Date(date2);
                },

                itemTemplate: function (value) {
                    return new Date(value).toLocaleDateString();
                },

                filterTemplate: function () {
                    var now = new Date();
                    this._fromPicker = $("<input >").datepicker({ dateFormat: "dd/mm/yy", changeMonth: true, changeYear: true,  defaultDate: now.setFullYear(now.getFullYear() - 1) }).attr('placeholder', 'Select Date');
                   
                    return $("<div>").append(this._fromPicker);
                },
                
                filterValue: function () {
                    return {
                        from: this._fromPicker.datepicker("getDate"),
                        
                    };
                }
            });

            jsGrid.fields.date = DateField;
            selectedItems = [];
            var selectItem = function (item) {
                selectedItems.push(item);
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {

                selectedItems = $.grep(selectedItems, function (i) {
                    return i !== item;
                });
                if (selectedItems.length == 0) {
                    $('#selectAllCheckbox').attr('checked', false);
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };

            $("#groupsaccordion").jsGrid({
                width: '100%',
                height: 'auto',
                filtering: true,
                inserting: false,
                editing: false,
                sorting: true,
                paging: true,
                autoload: true,
                pageSize: $("#pageSize").val(),
                data: groupData,
                controller: {
                    data: groupData,
                    loadData: function (filter) {
                       // if ($('#search').val() == "") {
                        selectedItems = [];
                         $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                        $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                        if (searchflag== false) {
                            $('#search').val("");
                            return $.grep(this.data, function (item) {
                                if (item.Description == null) { item.Description = ""; }
                                if (item.Phone == null) { item.Phone = ""; }
                                if (item.Provider == null) { item.Provider = ""; }
                                if (item.providerGroupName == null) { item.providerGroupName = ""; }
                                if (item.Summary == null) { item.Summary = ""; }
                                if (filter.NotificationsEnabled == "true") { filter.NotificationsEnabled = true;}
                                if (filter.NotificationsEnabled == "false") {filter.NotificationsEnabled = false; }
                                if (filter.AutoJoin == "true") { filter.AutoJoin = true; }
                                if (filter.AutoJoin == "false") { filter.AutoJoin = false; }
                                if (filter.isFav == "true") { filter.isFav = true; }
                                if (filter.isFav == "false") { filter.isFav = false; }
                                if (filter.isReadOnly == "true") { filter.isReadOnly = true; }
                                if (filter.isReadOnly == "false") { filter.isReadOnly = false; }
                                if (filter.isViewOnly == "true") { filter.isViewOnly = true; }
                                if (filter.isViewOnly == "false") { filter.isViewOnly = false; }
                                if (filter.isInvitationOnly == "true") { filter.isInvitationOnly = true; }
                                if (filter.isInvitationOnly == "false") { filter.isInvitationOnly = false; }
                                return ((!filter.GroupName || item.GroupName.toUpperCase().indexOf(filter.GroupName.toUpperCase()) >= 0)
                                    && (!filter.Owner || item.Owner.toUpperCase().indexOf(filter.Owner.toUpperCase()) >= 0)
                                    //&& (!filter.Tags || item.Tags.map(value => value.toLowerCase()).includes(filter.Tags) == true)
                                    && (!filter.Tags || item.Tags.toString().toUpperCase().indexOf(filter.Tags.toUpperCase()) >= 0)
                                    && (!filter.Description || item.Description.toUpperCase().indexOf(filter.Description.toUpperCase()) >= 0)
                                    && (!filter.Summary || item.Summary.toUpperCase().indexOf(filter.Summary.toUpperCase()) >= 0)
                                    && (!filter.Phone || item.Phone == filter.Phone)
                                    && (!filter.Provider || item.Provider.toUpperCase().indexOf(filter.Provider.toUpperCase()) >= 0)
                                    && (!filter.providerGroupName || item.providerGroupName.toUpperCase().indexOf(filter.providerGroupName.toUpperCase()) >= 0)
                                    && (!filter.Capabilities || item.Capabilities.toString().toUpperCase().indexOf(filter.Capabilities.toUpperCase()) >= 0)
                                   // && (!filter.Capabilities || item.Capabilities.map(value => value.toLowerCase()).includes(filter.Capabilities) == true)
                                    && (!filter.AutoJoin || item.AutoJoin == filter.AutoJoin)
                                    && (!filter.isFav || item.isFav == filter.isFav)
                                    && (!filter.isReadOnly || item.isReadOnly == filter.isReadOnly)
                                    && (!filter.isViewOnly || item.isViewOnly == filter.isViewOnly)
                                    && (!filter.isInvitationOnly || item.isInvitationOnly == filter.isInvitationOnly)
                                    && (!filter.NotificationsEnabled || item.NotificationsEnabled == filter.NotificationsEnabled)
                                    && (!filter.CreatedDate.from || new Date(item.CreatedDate).toDateString() == filter.CreatedDate.from.toDateString())
                                    && (!filter.ModifiedDate.from || new Date(item.ModifiedDate).toDateString() == filter.ModifiedDate.from.toDateString())
                                    && (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0));
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return ((!filter.GroupName || item.GroupName.toUpperCase().indexOf(filter.GroupName.toUpperCase()) >= 0)
                                    || (!filter.Owner || item.Owner.toUpperCase().indexOf(filter.Owner.toUpperCase()) >= 0)
                                    || (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0));
                            });
                        }
                    },
                },
                onPageChanged: function (args) {
                    $('#selectAllCheckbox').prop('checked', false);
                },
                fields: [


                    {
                        visible: true,

                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllCheckbox")
                                .on("change", function () {

                                    selectedItems = [];
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
                                        selectedItems = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.GroupId)
                                .prop("checked", $.inArray(item.firstName, selectedItems) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        align: "center",
                        width: 50,
                        sorting: false
                    },
                    {
                        name: "GroupName", title: "Group Name", type: "text", align: "left", width: 110, visible: true,
                        itemTemplate: function (value, item) {
                            var $customViewButton = $("<a>").attr("class", "attrClass").attr("title", item.GroupName).text(item.GroupName)
                                .click(function (e) {
                                    Actiontype = "view";
                                    getGroupInformation(item.GroupId);
                                    var childElements = $("#GroupItemList .grp_control");
                                    for (var i = 0; i < childElements.length; i++) {

                                        $(childElements[i]).prop('disabled', true);
                                    }
                                    $(".Group_label")[0].innerText = "Group Information";
                                    breadcrum_Label("Group Information");
                                    $("#MainCard").hide();
                                    $("#EditGroup").show();
                                    $(".Grp_footer").css("display", "none");
                                    $("#groupsBulkUpdate").css("display", "none")
                                });

                            return $("<div>").append($customViewButton);
                        },
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
                    { name: "Owner", title: "Owner", type: "text", visible: true, align: "left" },
                    {
                        name: "Summary", title: "Summary", type: "text", visible: false, align: "left",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Summary).text(item.Summary)
                        }
                    },
                    {
                        name: "Description", title: "Description", type: "text", visible: false, align: "left",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Description).text(item.Description)
                        }
                    },
                    {
                        name: "Tags", title: "Tags", type: "text", visible: true, align: "left", width: 200,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Tags).text(item.Tags)
                        }
                    },
                    {
                        name: "Capabilities", title: "Capabilities", visible: false, type: "text", align: "left",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Capabilities).text(item.Capabilities)
                        }
                    },
                    {
                        name: "AutoJoin", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "AutoJoin", align: "center", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.AutoJoin).text(item.AutoJoin)
                        }
                    },
                    {
                        
                        name: "isFav", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "Favourite", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.isFav).text(item.isFav)
                        }
                    },
                    {
                      
                        name: "isInvitationOnly", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "Invitation Only", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.isInvitationOnly).text(item.isInvitationOnly)
                        }
                    },
                    { name: "Phone", title: "Phone", type: "text", align: "center", visible: false },
                    {
                        
                        name: "isReadOnly", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "Read Only", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.isReadOnly).text(item.isReadOnly)
                        }
                    },
                    {
                       
                        name: "isViewOnly", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "View Only", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.isViewOnly).text(item.isViewOnly)
                        }
                    },
                    { name: "Provider", title: "Provider", type: "text", align: "left", visible: false },
                    { name: "providerGroupName", title: "provider GroupName", type: "text", align: "left", visible: false },
                    {
                        name: "NotificationsEnabled", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "NotificationsEnabled", align: "left", visible: false,
                         itemTemplate: function (_, item) {
                             return $("<a>").attr("class", "attrClass").attr("title", item.NotificationsEnabled).text(item.NotificationsEnabled)
                        }
                    },

                    {
                       
                        name: "CreatedDate", type: "date", title: "Created Date", align: "center", visible: true
                      
                    },
                    {
                        name: "ModifiedDate", title: "Modified Date", visible: true, type: "date", align: "center"
                      
                    },
                    {
                        type: "control", width: 90, visible: true,
                        editButton: false, deleteButton: false,

                        itemTemplate: function (value, item) {
                            var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                            var TargetUrl = sesstionItem.portalurl + "/home/group.html?id=" + item.GroupId;///+"&token="+portalToken;//   "https://spatial1090.maps.arcgis.com/home/group.html?id=249f51d0af914ab08efca5f614b8821c"
                            var $customviewButton = $("<a>").attr('href', TargetUrl).attr('target', '_blank').attr('title', 'View Group').attr({ class: "ViewGroup text-primary fa fa-eye mr-2" })
                                .click(function (e) {

                                    e.stopPropagation();
                                });

                            var $customEditButton = $("<a>").attr('title', 'Edit Group').attr({ class: "EditGroup fa fa-edit text-primary mr-2" })
                                .click(function (e) {
                                    Actiontype = "edit";
                                    // $(".cleargroupsinfo").click();
                                    $('.GroupTags').tagsinput('removeAll');
                                    //  $(".bootstrap-tagsinput").addClass("form-control");
                                    url = Config.portalUrl + "/sharing/rest/community/groups/" + item.GroupId + "/update";
                                    getGroupInformation(item.GroupId);
                                    $(".Group_label")[0].innerText = "Edit Group";
                                    breadcrum_Label("Edit Group");
                                    $("#MainCard").hide();
                                    $("#EditGroup").show();
                                    $(".Grp_footer").css("display", "");
                                    //$(".head_Actions").css("display", "none");
                                    // $(".groupFilters").css("display", "none")
                                    e.stopPropagation();
                                });
                            var $customItemInfoButton = $("<a>").attr('title', 'Group Items').attr({ class: "GroupItems fa fa-sitemap text-primary mr-2" })
                                .click(function (e) {
                                    Actiontype = "iteminfo";
                                    url = Config.portalUrl + "/sharing/rest/content/groups/" + item.GroupId;
                                    var queryParams = {
                                        f: "json",
                                        token: portalToken
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json"
                                    };
                                    EsriRequest(Actiontype, options);
                                    e.stopPropagation();
                                });
                            var $customGroupUsersButton = $("<a>").attr('title', 'Group Users').attr({ class: "GroupUsers fa fa-users text-primary" })
                                .click(function (e) {
                                    Actiontype = "userlist";
                                    url = Config.portalUrl + "/sharing/rest/community/groups/" + item.GroupId + "/" + "userList";
                                    var queryParams = {
                                        f: "json",
                                        token: portalToken
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json"
                                    };
                                    EsriRequest(Actiontype, options);
                                    e.stopPropagation();
                                });
                            var $customDeleteButton = $("<a>").attr({ class: "deleteGroup fas fa-trash-alt" })
                                .click(function (e) {
                                    Actiontype = "delete";
                                    url = Config.portalUrl + "/sharing/rest/community/groups/" + item.GroupId + "/delete";
                                    var queryParams = {
                                        f: "json",
                                        token: portalToken
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json",
                                        method: "post"

                                    };
                                    EsriRequest(Actiontype, options);
                                    e.stopPropagation();
                                });

                            return $("<div>").append($customviewButton).append($customEditButton).append($customItemInfoButton).append($customGroupUsersButton);
                        },
                        headerTemplate: function (e) {
                            return $("<div>").append($("<span>"))
                            //    .click(function () {
                            //    $("#groupsaccordion").jsGrid("option", "filtering", false);
                            //    //$(".groupFilters").toggle();
                            //    // $("#groupsaccordion").jsGrid("option", "filtering", !$("#groupsaccordion").jsGrid("option", "filtering"));
                            //});

                        }
                    }]
            });
            //$("#groupsaccordion").jsGrid("refresh");
            $("#groupsaccordion").css("width", "auto");
            $("#group_colums_list").empty();
            createShowHideColumns("#groupsaccordion", "#group_colums_list", "group_columns");

            $("#pageSize").on('change', function (event) {
                $("#groupsaccordion").jsGrid("option", "pageSize", this.value);
            });
            $("#groupsaccordion").jsGrid("reset");
            $("#groupsaccordion").jsGrid("loadData");

            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
        };
        $(".getselectetitems").click(function () {
            count = 0;
            $('#selected_items').empty();
            if (Actiontype == "bulkupdate") {
                var formdata = $("#bulkGrpform").serializeArray();
                var node = '';
                for (var i = 0; i < formdata.length; i++) {
                    if (formdata[i].value.trim() != '') {
                        // node = node + '<li class=group-item-list><b>' + formdata[i].name + '</b>:' + formdata[i].value + '</li>';
                        node = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate"><b>' + formdata[i].name + '</b>:' + formdata[i].value + '</a>'
                        $('#selected_items').append(node);
                    }
                }
                //$('#selected_items').append(node);
                $(".fs-title1")[0].innerText = "Selected group parameters";
                $(".itemcount")[0].innerText = $('#selected_items')[0].childNodes.length;
            }
            else if (Actiontype == 'AddTags' || Actiontype == "RemoveTags" || Actiontype == 'ExportToCSV' || Actiontype == 'ExportToJson') {
                selectedItemsList = [];
                $(".sel_Fields input:checkbox:checked").each(function () {
                    //var list = document.createElement("li");
                    //list.className = "group-item-list";
                    //list.textContent = $(this).val();
                    //$('#selected_items').append(list);
                    var Value = $(this).val();
                    if (Actiontype == 'ExportToCSV' || Actiontype == 'ExportToJson') {
                        for (var m = 0; m < GroupParameters.length; m++) {
                            if (GroupParameters[m].Key == Value) {
                                Value = GroupParameters[m].Name;
                                break
                            }
                        }
                    }

                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + Value + '</a>'
                    selectedItemsList.push($(this).val());
                    $('#selected_items').append(htmlContent);

                })
                $(".itemcount")[0].innerText = selectedItemsList.length
                if (Actiontype == 'AddTags')
                    $(".fs-title1")[0].innerText = "Selected tags for adding";
                if (Actiontype == 'RemoveTags')
                    $(".fs-title1")[0].innerText = "Selected tags for removing";
                if (Actiontype == 'ExportToCSV' || Actiontype == 'ExportToJson')
                    $(".fs-title1")[0].innerText = "Selected fields for exporting";
            }

            else if (Actiontype == "ShareItemstoGroups" || Actiontype == "unshareItemtogroups") {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    for (var j = 0; j < itemsList.length; j++) {
                        if (typeof (itemsList[j]) != "undefined" && typeof (itemsList[j]) != "null") {
                            if (selectedItemsList[i] == itemsList[j].id) {
                                // var list = document.createElement("li");
                                // list.className = "group-item-list";
                                // list.textContent = itemsList[j].title;
                                var htmlContent = '<div class="dt-widget__item">' +
                                    '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                                    '<div class="dt-widget__info text-truncate">' +
                                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + itemsList[j].title + '</a>'

                                $('#selected_items').append(htmlContent);
                                break;
                            }
                        }
                    }
                }
                $(".itemcount")[0].innerText = selectedItemsList.length
                $(".fs-title1")[0].innerText = "Selected items";
            }
            else if (Actiontype == "Import groups") {
                $(".imported_grp").addClass("col-md-12").removeClass("col-md-6");
                for (var i = 0; i < selectedItemsList.length; i++) {
                    //var list = document.createElement("li");
                    /// list.className = "group-item-list";
                    //list.textContent = selectedItemsList[i];
                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + selectedItemsList[i] + '</a>'

                    $('#selected_items').append(htmlContent);
                }
                $(".itemcount")[0].innerText = selectedItemsList.length
                $(".fs-title1")[0].innerText = "Selected groups";
            }
            else {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    //var list = document.createElement("li");
                    //list.className = "group-item-list";
                    //list.textContent = selectedItemsList[i];
                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + selectedItemsList[i] + '</a>'
                    $('#selected_items').append(htmlContent);
                }
                $(".fs-title1")[0].innerText = "Selected Items";
                if (Actiontype == "inviteusers" || Actiontype == "removeusers") {
                    $(".fs-title1")[0].innerText = "Selected Users";
                }

                $(".itemcount")[0].innerText = selectedItemsList.length

            }
            $(".selected_grp").css("display", "none");
            if (Actiontype != "Import groups") {
                $(".selected_grp").css("display", "block");
                showSelectedGroupList();
                $(".grp_count")[0].innerText = selectedItems.length;
            }

        });
        function showSelectedGroupList() {
            $('#selected_groups').empty();
            if ((Actiontype == 'ExportToCSV' || Actiontype == 'ExportToJson') && selectedItems.length == 0) {
                selectedItems = [];
                for (var i = 0; i < groupList.length; i++) {
                    selectedItems.push(groupList[i].id);
                }
            }

            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < groupList.length; j++) {
                    if (selectedItems[i] == groupList[j].id) {
                        //var list = document.createElement("li");
                        //list.className = "group-item-list";
                        //list.textContent = groupList[j].title;
                        var htmlContent = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + groupList[j].title + '</a>'
                        $('#selected_groups').append(htmlContent);
                        break;
                    }
                }
            }
        };

        function showSuccessDiv() {
            $("#loader").css("display", "none");
            $("#migrate-success").css("display", "block");
            $("#migrate-fail").css("display", "none");

        };
        function showfailureDiv() {
            $("#loader").css("display", "none");
            $("#migrate-success").css("display", "none");
            $("#migrate-fail").css("display", "block");
        };

    });

}
