//var commonutils = new CommonUtils();
includeHeader();
includeMenu("Folders");
loadgroups();
var searchflag = false;
function loadgroups() {
    require([
        "esri/portal/Portal",
        "esri/request", "dojo/_base/array",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/config"
    ], function (Portal, esriRequest, array, OAuthInfo, esriId, esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);
            return;
        }
        var url = '';
        var Actiontype = "";
        var selectFolders = [];
        var folderList = [];
        var count = 0;
        var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
        //if (sesstionItem.hostName != "")
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        Config.portalUrl = sesstionItem.portalurl;
        var portalToken = sesstionItem.token;
        var FolderParams = {
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            sortField: 'title',
            sortOrder: 'asc'
        };
        $(".breadcrumb_Home").click(function () {
            $(".breadcrumb .active").each(function () {
                $(this).remove();
            })
            $("#GroupInfo").hide();
            $("#EditFolder").hide();
            $("#MainCard").show();
            $("#ReturnHome").click();
        })
        function breadcrum_Label(label) {
            $(".breadcrumb").append('<li class="active breadcrumb-item">' + label + '</li>')

        }
        $(".close").click(function () {
            $("#GroupInfo").hide();
            $("#EditFolder").hide();
            $("#MainCard").show();
        });
        fetchAllfolders();
        //$("#sign-out").click(function () {
        //    signOutCredentials(esriId);
        //    sessionStorage.setItem("Accesskey", 'Invalid token');
        //});
        function fetchAllfolders() { // fetch all folders
            var url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username;

            var options = {
                query: FolderParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    folderList = response.data.folders;
                    loadFolders(folderList);
                }).catch(function (err) {
                    console.log(err);
                });
        };

        $(".createNewFolder").click(function (e) {
            Createfolder();
        });
        function Createfolder() {
            url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/createFolder";
            Actiontype = "add";
            $(".Foldernameinput")[0].value = "";
            $("#EditFolder").show();
            $(".Folder_label")[0].innerText = "Create folder";
            breadcrum_Label("Create folder");
            $("#MainCard").hide();

        };
        if (typeof (localStorage.getItem("Pagenavigation")) != "undefined" && typeof (localStorage.getItem("Pagenavigation")) != "null") {
            var searchedtext = localStorage.getItem("Pagenavigation");
            if (searchedtext == "Create folder") {
                Createfolder();
            };
            localStorage.removeItem("Pagenavigation");
        }

        setTimeout(function () {
            $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
            $("#sign-out").click(function () {
                signOutCredentials(esriId);
            });
        }, 2000);
        $(".DeleteFolders").click(function () {
            Actiontype = "Delete";
            count = 0;
            $(".cleargroupsinfo").click();
            if (selectFolders.length == 0) {
                AlertMessages("Delete Folder", "Please select atleast one folder", "warning");
                return;
            }


            const swalWithBootstrapButtons = swal.mixin({
                confirmButtonClass: 'btn btn-success mb-2',
                cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                buttonsStyling: false,
            });
            errcount = 0;
            swalWithBootstrapButtons({
                title: 'Delete Folders',
                text: "Folders will be deleted along with items",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No!',
                reverseButtons: true
            }).then(function (result) {
                if (result.value) {
                    count = 0;
                    for (var i = 0; i < selectFolders.length; i++) {
                        url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/" + selectFolders[i] + "/delete";

                        var options = {
                            f: "json",
                            token: portalToken,
                            responseType: "json",
                            method: "post"

                        };
                        Ajaxrequest_Folders(options, "Delete folder")
                        $(".cleargroupsinfo").click();
                    }
                } else if (
                    // Read more about handling dismissals
                    result.dismiss === swal.DismissReason.cancel
                ) {

                }
            });


        });
        $("#SaveFolder").click(function (e) {

            if ($(".Foldernameinput")[0].value == '') {
                AlertMessages("Folder", "Please enter folder name", "warning");
                return;
            }
            if ($(".Foldernameinput")[0].value.indexOf("<") != -1 || $(".Foldernameinput")[0].value.indexOf(">") != -1) {
                AlertMessages("Folder Name", "Name cannot contain any of these characters:< or >.", "warning");
                return;
            }
            var message = '';
            if (Actiontype == "add") {
                groupOptions = {
                    folderName: $(".Foldernameinput")[0].value,
                    title: $(".Foldernameinput")[0].value,
                    f: "json",
                    token: portalToken,
                    responseType: "json",
                    method: "post"
                };
                message = "Create folder";
            }
            else if (Actiontype == "update") {
                groupOptions = {
                    newTitle: $(".Foldernameinput")[0].value,
                    f: "json",
                    token: portalToken,
                    responseType: "json",
                    method: "post"
                };
                message = "Update folder"
            }

            Ajaxrequest_Folders(groupOptions, message)
        });
        function Ajaxrequest_Folders(options, Label) {
            try {
                $.ajax({
                    url: url,
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                    },
                    data: options,
                    success: function (data, textStatus, jqXHR) {
                        var response = data;
                        count++;
                        if (typeof (data) == "string") {
                            response = JSON.parse(data);
                        }
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            if (Actiontype == 'Delete' && count == selectFolders.length) {
                                if (response.error.messageCode == "CONT_0035") {

                                    AlertMessages(Label, response.error.message + ",selected folder item has delete protection", "danger");
                                    return
                                }
                                else {
                                    AlertMessages(Label, response.error.message, "danger");
                                    return
                                }

                            }
                            else {
                                AlertMessages(Label, response.error.message + response.error.details[0], "danger");
                                return
                            }

                        }
                        else {
                            $(".Foldernameinput")[0].value = "";
                            $("#EditFolder").hide();
                            $("#MainCard").show();
                            if (Actiontype == 'add') {
                                AlertMessages("Create Folder", "Successfully created folder", "success");
                                fetchAllfolders();
                                $(".breadcrumb_Home").click();
                            }
                            if (Actiontype == 'update') {
                                AlertMessages("Update Folder", "Successfully update folder", "success");
                                fetchAllfolders();
                                $(".breadcrumb_Home").click();
                            }
                            if (Actiontype == 'Delete') {
                                if (count == selectFolders.length) {
                                    AlertMessages("Delete Folder", "Successfully deleted folder", "success");
                                    Actiontype = '';
                                    $("#displayPopup").remove();
                                    fetchAllfolders();

                                }
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


        function Esrirquest_Folders(options) {
            esriRequest(url, options)
                .then(function (response) {
                    count++;
                    $("#foldersaccordion").css("display", "block");
                    $("#FolderContentList").css("display", "none");
                    $(".createNewFolder").css("display", "block");
                    $(".page_size").css("display", "block");
                    if (Actiontype == 'add') {
                        AlertMessages("Create Folder", "Successfully created folder", "success");
                        fetchAllfolders();
                    }
                    if (Actiontype == 'update') {
                        AlertMessages("Update Folder", "Successfully update folder", "success");
                        fetchAllfolders();
                    }
                    if (Actiontype == 'Delete') {
                        if (count == selectFolders.length) {
                            AlertMessages("Delete Folder", "Successfully deleted folder", "success");
                            Actiontype = '';
                            $("#displayPopup").remove();
                            fetchAllfolders();
                        }
                    }

                }).catch(function (err) {
                    console.log(err);
                    if (typeof (err.details.messages) != "undefined" || typeof (err.details.messages) != "null") {
                        AlertMessages("Folder", err.details.messages.join(','), "danger");
                        return
                    }
                    else {
                        AlertMessages("Error", err.message, "danger");
                        return;
                    }

                });

        };
        $("#search").keydown(function (event) {
            searchflag = true;
            var uname = $("#search").val();
            if (uname.length > 1) {
                $("#foldersaccordion").jsGrid("search", { FolderName: uname, Username: uname }).done(function () { });
            }
            else {
                $("#foldersaccordion").jsGrid("clearFilter").done(function () { });
            }
        });
        function loadFolders(folders) {
            $("#foldersaccordion").empty();

            var folderData = [];
            for (var i = 0; i < folders.length; i++) {
                var folderObj = {
                    folderId: folders[i].id,
                    FolderName: folders[i].title,
                    Username: folders[i].username,
                    CreatedDate: folders[i].created
                };
                folderData.push(folderObj);
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
                    this._fromPicker = $("<input >").datepicker({ dateFormat: "dd/mm/yy", changeMonth: true, changeYear: true, defaultDate: now.setFullYear(now.getFullYear() - 1) }).attr('placeholder', 'Select Date');
                    return $("<div>").append(this._fromPicker).append(this._toPicker);
                },

                filterValue: function () {
                    return {
                        from: this._fromPicker.datepicker("getDate")

                    };
                }
            });

            jsGrid.fields.date = DateField;

            selectFolders = [];
            var selectItem = function (item) {
                selectFolders.push(item);
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {

                selectFolders = $.grep(selectFolders, function (i) {
                    return i !== item;
                });
                if (selectFolders.length == 0) {
                    $('#selectAllCheckbox').attr('checked', false);
                }
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };

            $("#foldersaccordion").jsGrid({
                width: "100%",
                height: 'auto',
                filtering: true,
                inserting: false,
                editing: false,
                sorting: true,
                paging: true,
                autoload: true,
                pageSize: $("#pageSize").val(),
                data: folderData,
                controller: {
                    data: folderData,
                    loadData: function (filter) {
                        selectFolders = [];
                        $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                        $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                        //if ($('#search').val() == "") {
                        if (searchflag == false) {
                            $('#search').val("");
                            return $.grep(this.data, function (item) {
                                return ((!filter.FolderName || item.FolderName.toUpperCase().indexOf(filter.FolderName.toUpperCase()) >= 0)
                                    && (!filter.Username || item.Username.toUpperCase().indexOf(filter.Username.toUpperCase()) >= 0)
                                    && (!filter.CreatedDate.from || new Date(item.CreatedDate).toDateString() == filter.CreatedDate.from.toDateString())
                                );
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return ((!filter.FolderName || item.FolderName.toUpperCase().indexOf(filter.FolderName.toUpperCase()) >= 0)
                                    || (!filter.Username || item.Username.toUpperCase().indexOf(filter.Username.toUpperCase()) >= 0)
                                );
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
                            return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.folderId)
                                .prop("checked", $.inArray(item.FolderName, selectFolders) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        align: "center",
                        width: 30,
                        sorting: false
                    },
                    {
                        name: "FolderName", title: "Folder Name", type: "text", align: "left", width: 110, visible: true,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.FolderName).text(item.FolderName)
                        }

                    },

                    {
                        name: "Username", title: "User Name", type: "text", visible: true, align: "left",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Username).text(item.Username)
                        }
                    },

                    {
                        name: "CreatedDate", title: "Created Date", visible: true, type: "date", align: "center"

                    },
                    {
                        type: "control", width: 60, visible: true,
                        editButton: false, deleteButton: false,
                        headerTemplate: function (e) {
                            return $("<div>").append($("<span>"));
                        },
                        itemTemplate: function (value, item) {
                            var TargetUrl = sesstionItem.portalurl + "/home/content.html?folder=" + item.folderId;
                            var $customviewButton = $("<a>").attr('href', TargetUrl).attr('target', '_blank').attr('title', 'View Folder').attr({ class: "ViewGroup fa fa-eye text-primary mr-2" })
                                .click(function (e) {
                                    e.stopPropagation();
                                });

                            var $customEditButton = $("<a>").attr('title', 'Edit Folder').attr({ class: "EditGroup fa fa-edit text-primary mr-2" })
                                .click(function (e) {
                                    Actiontype = "update";
                                    $(".cleargroupsinfo").click();
                                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/" + item.folderId + "/updateFolder";
                                    for (var i = 0; i < folderList.length; i++) {
                                        if (item.folderId == folderList[i].id)
                                            var foldername = folderList[i].title;
                                    }
                                    $(".Foldernameinput")[0].value = foldername;
                                    $("#EditFolder").show();
                                    $(".Folder_label")[0].innerText = "Edit folder";
                                    breadcrum_Label("Edit folder");
                                    $("#MainCard").hide();
                                });
                            var $customItemInfoButton = $("<a>").attr('title', 'Folder Items').attr({ class: "GroupItems fa fa-sitemap text-primary" })
                                .click(function (e) {
                                    Actiontype = "iteminfo";
                                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/" + item.folderId;
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
                                            var items = response.data.items;
                                            $("#groupIteminfo").empty();
                                            if (response.data.items.length > 0) {
                                                var items = response.data.items;
                                                var table = '<table class="table table-hover mt-0" ><thead class="bg-light p-0"><tr><th scope="col" style="width: 30%">Title</th><th scope="col" style="width: 30%">Access</th><th scope="col" style="width: 30%">Type</th><th scope="col" style="width: 30%">Owner</th><th scope="col" style="width: 30%">Created Date</th><th scope="col" style="width: 30%">Modified Date</th><tr></thead>'
                                                var trRow = '';
                                                for (var i = 0; i < items.length; i++) {

                                                    trRow = trRow + '<tr>' +
                                                        '<td class="text-dark">' + items[i].title + '</td>' +
                                                        '<td>' + items[i].access + '</td>' +
                                                        '<td>' + items[i].type + '</td>' +
                                                        '<td>' + items[i].owner + '</td>' +
                                                        '<td style="width:20%"><span>' + new Date(items[i].created).toLocaleDateString() + '</span></td>' +
                                                        '<td>' + new Date(items[i].modified).toLocaleDateString() + '</td>' +
                                                        '</tr >';

                                                }
                                                table = table + trRow + '</table>'
                                                $("#groupIteminfo").append(table);
                                                $("#GroupInfo").show();
                                                $("#MainCard").hide();
                                                breadcrum_Label("Item Information")
                                            }
                                            else {
                                                $("#GroupInfo").hide();
                                                $("#MainCard").show();
                                                AlertMessages("Folder Items", "No items are found", "warning");
                                                return;
                                            }
                                        })
                                    e.stopPropagation();
                                });
                            return $("<div>").append($customviewButton).append($customEditButton).append($customItemInfoButton);//.append($customGroupUsersButton);
                        }
                    }]
            });
            $("#foldersaccordion").jsGrid("refresh");
            $("#pageSize").on('change', function (event) {
                $("#foldersaccordion").jsGrid("option", "pageSize", this.value);
            });

            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
        }

    });

}
