//var commonutils = new CommonUtils();
includeHeader();
includeMenu("Items");
laodItems();
var _TagsList = [];
var searchflag = false;
var editor; var favGroup_id; var favItems = []; var jsonitemid;
var iteminfo; var editor1; var editflag = false; var edit1flag = false;
var revertflag = false; var ActionType1 = 'edited'; var ActionType2 = 'edited';
var edit1Count = 0; var edit2Count = 0;

function laodItems() {
    require([
        "esri/portal/Portal","dojo/_base/lang",
        "esri/request",
        "dojo/_base/array",
        "esri/portal/PortalQueryParams",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/config"
    ], function (Portal, lang,esriRequest, array, PortalQueryParams, OAuthInfo, esriId, esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);
            return;
        }
        var selectedItems = []; var bulkContent = $("#ItemsBulkUpdate");
        var itemRadNode = $(".items_radbtn"); var AllItems = [];
        var ItemList = []; var temdata = []; var ItemsData = []; var Userlist = []; var url = '';
        let portal; var queryParams; var selectedItemsList = []; var Actiontype = ''; var folderList = []; var Errlist = [];
        var portalToken; var count = 0; var selectedGroups = []; var groupsList; var ownername; var ajaxcount = 0;
        var ServiceList = [];
        var old_serviceurl; var new_serviceurl; var errcount = 0;
        var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));
        //if (sesstionItem.hostName != "")
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        portalToken = sesstionItem.token;
        $(".lds-ring").css('display', 'block'); var current = 1;
        Config.portalUrl = sesstionItem.portalurl;

        var ItemParameters = [ // exporting array options
            { Name: "Access", Key: "access", exportLabel: "access" },
            { Name: "Access Information", Key: "accessInformation", exportLabel: "accessInformation" },
            { Name: "App Categories", Key: "appCategories", exportLabel: "appCategories" },
            { Name: "Avg Rating", Key: "avgRating", exportLabel: "avgRating" },
            { Name: "Banner", Key: "banner", exportLabel: "banner" },
            { Name: "Categories", Key: "categories", exportLabel: "categories" },
            { Name: "Culture", Key: "culture", exportLabel: "culture" },
            { Name: "Description", Key: "description", exportLabel: "description" },
            { Name: "Documentation", Key: "documentation", exportLabel: "documentation" },
            { Name: "ID", Key: "id", exportLabel: "id" },
            { Name: "Industries", Key: "industries", exportLabel: "industries" },
            { Name: "Name", Key: "name", exportLabel: "name" },
            { Name: "Owner", Key: "owner", exportLabel: "owner" },
            { Name: "Summary", Key: "snippet", exportLabel: "snippet" },
            { Name: "SpatialReference", Key: "spatialReference", exportLabel: "spatialReference" },
            { Name: "Tags", Key: "tags", exportLabel: "tags" },
            { Name: "Item Name", Key: "title", exportLabel: "title" },
            { Name: "Type", Key: "type", exportLabel: "type" },
            { Name: "TypeKeywords", Key: "typeKeywords", exportLabel: "typeKeywords" },
            { Name: "Url", Key: "url", exportLabel: "url" },
            { Name: "Thumbnail", Key: "thumbnail", exportLabel: "thumbnail" },
            { Name: "ItemData", Key: "Iteminfo", exportLabel: "text" }
        ];
        $(document).ready(function () {
            $('#uploadItemForm input').change(function () {
                $('#uploadItemForm p').text("selected: " + this.files[0].name);
            });
        });

        $(document).ready(function () { /// new click events
            $(".fa-sitemap").click(function () {
                $("#GroupInfo").show();
                $("#MainCard").hide();
            });
            $(".fa-pencil").click(function () {
                $("#EditUser").show();
                $("#MainCard").hide();
            });

            $(".close").click(function () {
                $("#EditItem").hide();
                $("#MainCard").show();
                $("#GroupInfo").hide();
                $(".importContent").removeClass("col-md-12").addClass("col-md-6");
                var childElements = $("#itemsForm .form-control");
                for (var i = 0; i < childElements.length; i++) {
                    $(childElements[i]).prop('disabled', false);
                }

            });
            var current_fs, next_fs, previous_fs; //fieldsets
            var opacity;

            $(".breadcrumb_Home").click(function () {
                $(".breadcrumb .active").each(function () {

                    $(this).remove();

                })
                $("#EditItem").hide();
                $("#MainCard").show();
                $("#GroupInfo").hide();
                $("#Itemsjson").hide();
                $("#ReturnHome").click();
            })
            function breadcrum_Label(label) {
                $(".breadcrumb").append('<li class="active breadcrumb-item">' + label + '</li>')

            }
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

        setTimeout(function () {
            $("#user_name")[0].innerText = $(".user_name1")[0].innerText = sesstionItem.username;
            $("#sign-out").click(function () {
                signOutCredentials(esriId);
            });
        }, 2000);

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
        var queryParams_folder = {
            f: "json",
            token: portalToken
        };
        $("#folderdiv").change(function () {
            source_items = [];
            var folderid = $(this).val();
            if (folderid == "ALL") {
                ItemList = AllItems;
                $("#grdItems").empty();
                createGallery(AllItems);
            }
            else {


                url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/" + folderid;
                var options = {
                    query: queryParams_folder,
                    responseType: "json"
                };
                esriRequest(url, options)
                    .then(function (response) {
                        ItemList = response.data.items;
                        $("#grdItems").empty();
                        createGallery(ItemList);
                        // loadsourceItems(source_items);
                    })
            }
        });
        fetchAllGroups(portalToken, sesstionItem.username);
        fetchAllUsers();
        // image gallery
        $('#GridList').click(function () {
            $(this).find('i').toggleClass('fa-th fa-th-list')
            $(this).find('i').toggleClass('text-primary text-dark')
            $('#itemTableDiv').fadeToggle();
            $('#itemGallery').fadeToggle();
        });


        var ItemParams = {
            q: "owner:" + sesstionItem.username + " AND " + " orgid:" + sesstionItem.portalid,
            //q:  " orgid:" + sesstionItem.portalid,
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            sortField: 'title',
            sortOrder: 'asc'
        };
        fetchAllItems();
        function breadcrum_Label(label) {
            $(".breadcrumb").append('<li class="active breadcrumb-item">' + label + '</li>')

        }
        function fetchAllItems() {// get all items list
            $(".lds-ring").css("display", "block");

            var options = {
                query: ItemParams,
                responseType: "json"
            };
            esriRequest(Config.portalUrl + "/sharing/rest/search", options)
                .then(function (response) {

                    if (response.data.results.length != 0) {
                        ItemList = response.data.results.concat(ItemList);
                        ItemParams.start = ItemList.length + 1;
                        fetchAllItems();
                    }
                    else {
                        AllItems = ItemList;
                        LoadServiceInfo(ItemList)
                        createGallery(ItemList);
                        $(".lds-ring").css('display', 'none');

                    }

                }).catch(function (err) {
                    console.log(err);
                });
        };

        function LoadServiceInfo(itemsList) { //Get All service Items from portal
            ServiceList = [];
            array.forEach(itemsList, function (item) {

                if (item.type == "VectorTileLayer") {

                    if (item.styleUrl != null && item.styleUrl != "null") {

                        ServiceList.push({ "name": item.title, "url": item.styleUrl, itemid: item.id, "type": item.type });
                    }

                }
                else if (typeof (item.url) != "undefined") {
                    if (item.url != null && item.url != "null") {

                        ServiceList.push({ "name": item.title, "url": item.url, itemid: item.id, "type": item.type });
                    }

                }
                
            });

        };

        fetchAllfolders();
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
                    folderList = response.data.folders;
                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllGroups(token, ownername) {
            var queryParams = {
                q: 'owner:' + ownername, //username,
                token: token,
                f: "json",
                sortField: "numViews",
                sortOrder: "desc",
                start: 1,
                num: 100
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(Config.portalUrl + "/sharing/rest/community/groups", options)
                .then(function (response) {
                    groupsList = [];
                    groupsList = response.data.results;
                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllUsers() { // fetch all users
            var url = Config.portalUrl + "/sharing/rest/portals/self/users/search";
            var queryParams = {
                q: "-level: 1 -level: 11   orgid:" + sesstionItem.portalid,
                token: portalToken,
                f: "json",
                excludeSystemUsers: true
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    if (typeof (response.data.results) != "undefined")
                        var datalist = response.data.results;
                    else
                        var datalist = response.data.users;
                    //if (sesstionItem.type == "Arcgisonline")
                    //    var datalist = response.data.results;
                    //else
                    //    var datalist = response.data.users;
                    for (var i = 0; i < datalist.length; i++) {
                        if (datalist[i].username != sesstionItem.username) {
                            Userlist.push(datalist[i]);
                        }
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        };
        // document.getElementById("sign-out").addEventListener("click", function () {

        $(".bootstrap-tagsinput").addClass("form-control")
        function loadItemsData(ItemList, i) {
            var dataUrl = Config.portalUrl + '/sharing/rest/content/items/' + ItemList[i].id + '/data';
            var options = {
                query: { token: portalToken, f: "json" },
                responseType: "json",
                method: "get"
            };
            esriRequest(dataUrl, options).then(function (response) {
                var itemArray = response.url.split("/");
                var itemid = itemArray[itemArray.length - 2];
                for (var i = 0; i < ItemList.length; i++) {
                    if (ItemList[i].id == itemid) {
                        ItemList[i].Iteminfo = response.data
                        ItemsData.push({ id: ItemList[i].id, data: response.data });
                        break
                    }
                }
            }).catch(function (err) {
                ItemList[i].Iteminfo = null
                ItemsData.push({ id: ItemList[i].id, data: null })
                console.log(err);
            });
        }

        $(".AddLayerstoWebMap").click(function (e) {
            if (selectedItems.length == 0) {
                AlertMessages("Add Layers to WebMap", "Please select atleast one webmap for adding layers", "warning");
                return;
            }
            Actiontype = 'AddLayerstoWebmap';

            temdata = [];
            // var textboxDiv = ' <div class="controls" id="profs"><form class="input-append row"><div id="field" class="col-sm-10"><span class="col-sm-8"><input autocomplete="off" class="input form-control" id="field1" name="prof1" type="text" placeholder="Type something" data-items="8" /></span><span class="col-sm-2"><button id="b1" class="btn add-more" type="button">+</button></span></div></form ><br><small>Press + to add another form field :)</small></div>'

            var textboxnode = '<div class="container mt-3" style="width:85% !important"><div style="float: right;margin-bottom:30px;"><button class="btn btn-success addLayerInput" type="button">Add new layer</button></div>' +
                '<form id="Layerform">' +
                '<div class="input-group mb-3">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text" >Service 1</span></div >' +
                '<input type="text" class="form-control" placeholder="please enter service url" aria-label="serviceurl" aria-describedby="basic-addon2">' +
                '<div class="input-group-append">' +
                '<button style="display:none" class="btn btn-danger" type="button">x</button>'
                + '</div></div></form><div><button class="btn btn-primary pull-right validateUrl">Validate</button></div></div >'

            $("#items-control").empty();
            $("#items-control").append(textboxnode);
            var input_cnt = 0;
            $(".addLayerInput").click(function (e) {
                input_cnt++;
                var label = input_cnt + 1;
                e.preventDefault();
                var textboxNode = '<div id=inputgroup_' + input_cnt + ' class="input-group mb-3">' +
                    '<div class="input-group-prepend">' +
                    '<span class="input-group-text" >Service ' + label + '</span></div >' +
                    '<input type="text" class="form-control" placeholder="please enter service url" aria-label="serviceurl" aria-describedby="basic-addon2">' +
                    '<div class="input-group-append">' +
                    '<button class="btn btn-danger" id=' + input_cnt + ' type="button">x</button>'
                    + '</div></div>'
                $("#Layerform").append(textboxNode);
                $(".btn-danger").click(function (e) {
                    e.preventDefault();
                    var id = e.currentTarget.id;
                    $("#inputgroup_" + id).remove();

                })
            });
            $("#itemTableDiv").css("display", "none");
            $("#Items_wizard").css("display", "block");
            $(".Item_ActionPanel").css("display", "none");
            $("#itemLabels")[0].innerText = "Add Layers to Webmap";
            breadcrum_Label("Add Layers to Webmap")
            HidetoggleItemsTable();
            $(".getselecteditems").addClass("disbaleClass");
            var urllist = [];
            $(".validateUrl").click(function (e) {
                e.preventDefault();
                var queryParams = {
                    f: "json"
                }
                var options = {
                    query: queryParams,
                    responseType: "json",
                    method: "get"
                };
                urllist = [];
                $(".getselecteditems").removeClass("disbaleClass");
                $('#items-control #Layerform input:text').each(function () {
                    if ($.trim($(this).val()) == "") {
                        $(".getselecteditems").addClass("disbaleClass");
                    }
                    else {

                        var url = $.trim($(this).val());
                        var splitList = url.split("/");
                        if (/^\d+$/.test(splitList[splitList.length - 1])) {
                            if (splitList.indexOf("FeatureServer") != -1 || splitList.indexOf("MapServer") != -1) {
                                urllist.push(url);
                            }
                            else {
                                alert("invalid url")
                            }
                        }
                        else {
                            if (splitList.indexOf("FeatureServer") != -1 || splitList.indexOf("MapServer") != -1) {
                                url = url + "/layers";
                                urllist.push(url);
                            }
                            else {
                                alert("invalid url")
                            }
                        }
                    }

                });
                selectedItemsList = [];
                var date = new Date(); // some mock date
                var milliseconds = date.getTime();
                for (var j = 0; j < urllist.length; j++) {
                    esriRequest(urllist[j], options).then(function (response) {
                        $(".getselecteditems").removeClass("disbaleClass");
                        if (typeof (response.data.layers) != "undefined" && typeof (response.data.layers) != "null") {
                            var layers = response.data.layers;
                            var url = response.url.replace("/layers", "");
                            for (var m = 0; m < layers.length; m++) {
                                url = url + "/" + layers[m].id;
                                var LayerObject = {
                                    id: layers[m].name,
                                    layerType: layers[m].type,
                                    opacity: 1,
                                    title: layers[m].name,
                                    url: url,
                                    visibility: true
                                }
                                selectedItemsList.push(LayerObject);
                            }
                        }
                        else {
                            var LayerObject = {
                                id: response.data.name,
                                layerType: response.data.type,
                                opacity: 1,
                                title: response.data.name,
                                url: response.url,
                                visibility: true
                            }
                            selectedItemsList.push(LayerObject);
                        }
                    })
                        .catch(function (err) {
                            console.log(err)
                        });
                }
            })
        });

        $(".AddTagstoitems").click(function (e) {
            if (selectedItems.length == 0) {
                AlertMessages("Tags", "Please select item for adding tags", "warning");
                return;
            }
            Actiontype = 'AddTags';
            count = 0;
            breadcrum_Label("Add Tags");
            $("#items_radbtn").css("display", "block")
            getItemInformation(sesstionItem.username);
            $("#items-control").removeClass("jsgrid");
        });
        $(".RemoveTagsfromitems").click(function (e) {
            if (selectedItems.length == 0) {
                AlertMessages("Tags", "Please select item for removing tags", "warning");
                return;
            }
            breadcrum_Label("Remove Tags");
            Actiontype = 'RemoveTags';
            var tagsArray = [];
            count = 0;
            $("#items-control").empty();
            //var checkboxNode = '<div class="row sel_Alltags"><span class="col-sm-12" style="text-align:center"> <input type=checkbox class="form-check-input selectallTags"/> Select All</span></div><br/>';

            var checkboxNode = ' <div class="form-row sel_Alltags">' +
                '<div class="col-md-12 text-center1" >' +
                '<div class="custom-control custom-checkbox mb-0">' +
                '<input type="checkbox" id="customcheckboxInline5"  name="customcheckboxInline1" class="custom-control-input selectallTags" />' +
                '<label class="custom-control-label" for="customcheckboxInline5">Select All</label> </div></div></div > <hr class="mb-0 pb-0">';

            var subCheckboxNode = '<div class="form-row mt-4 sel_tags">';
            var str = '';

            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id) {
                        for (var k = 0; k < ItemList[j].tags.length; k++) {
                            if (ItemList[j].tags.length == 1) {
                                //temparray.push({ "username": usersList[j].username, "Tags": usersList[j].tags.join(",") })
                                str = str + ItemList[j].title + ",";
                            }
                            tagsArray.push(ItemList[j].tags[k]);
                            //subCheckboxNode = subCheckboxNode + '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectTags" value= "' + ItemList[j].tags[k] + '"/>  <a title=' + ItemList[j].tags[k] + '> <span class=contOverflow>' + ItemList[j].tags[k] + '</span></a></span><br/>'

                            subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                                '<input type = "checkbox" id = "' + ItemList[j].tags[k] + '" name = "' + ItemList[j].tags[k] + '" class="custom-control-input selectTags" value= "' + ItemList[j].tags[k] + '">'
                                + '<label class="custom-control-label" for="' + ItemList[j].tags[k] + '">' + ItemList[j].tags[k] + '</label></div ></div>'

                        }

                    }
                }
            }
            if (str != '') {
                str = str.replace(/,\s*$/, "");
                AlertMessages("Remove Tags", str + " has only single tag,please select items with multiple tags", "warning");
                return;
            }
            $(".wizard_header")[0].innerText = "Remove Tags from Items";
            subCheckboxNode = subCheckboxNode + "</div>";
            $("#items-control").append(checkboxNode).append(subCheckboxNode);
            var seen = {};
            $('.sel_tags span').each(function () { // filtering duplicate items
                var txt = $(this).text();
                if (seen[txt])
                    $(this).remove();
                else
                    seen[txt] = true;
            });
            LoadTagsCheckbox();
            HidetoggleItemsTable();
            $("#items-control").removeClass("jsgrid");

        });
        $(".Moveitems").click(function () { // moving item from one folder to another
            if (selectedItems.length == 0) {
                AlertMessages("Move Items", "Please select atleat one item", "warning");
                return;
            }
            Actiontype = 'MoveItems';
            breadcrum_Label("Move Items");
            var nodecontainer = "<div class='row'><div class='itm_container col-sm-12'></div></div>";
            var spanselect = document.createElement('span');
            spanselect.className = "col-sm-8";
            var select = document.createElement('select');
            select.id = "FoldersList";
            select.className = "form-control1 custom-select custom-select-sm";
            $("#items-control").empty();
            var option = document.createElement('option');
            option.value = '';
            option.textContent = 'Select Folders';
            select.append(option);
            for (var i = 0; i < folderList.length; i++) {
                var option = document.createElement('option');
                option.value = folderList[i].id
                option.textContent = folderList[i].title;
                select.append(option);
            }
            $(".wizard_header")[0].innerText = "Move Items";
            $("#items-control").append(nodecontainer);
            $(".itm_container").append("<span class='col-sm-4'><label class='mt-3'>Select folder for moving Items:</label></span>");
            $(spanselect).append(select)
            $(spanselect).css("float", "right");
            $(".itm_container").append($(spanselect));
            HidetoggleItemsTable();
            $(".getselecteditems").addClass("disbaleClass");
            $("#FoldersList").change(function () {
                if ($(this).val() != '') {
                    $(".getselecteditems").removeClass("disbaleClass");
                    //selectedItemsList.push($(this).val());
                }
                else
                    $(".getselecteditems").addClass("disbaleClass");
            });
        });
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
                    ajaxcount++;
                    var responsedata = data;
                    if (typeof (responsedata) == "string")
                        responsedata = JSON.parse(data);
                    if (typeof (responsedata.error) != "undefined" && typeof (responsedata.error) != "null") {
                        if (Actiontype == "AssignOwner" && selectedItems.length == ajaxcount) {
                            AlertMessages(label, responsedata.error.message, "danger");
                            $(".failure_msg")[0].innerText = responsedata.error.message;
                            showfailuredivDiv();
                            return
                        }
                        if (Actiontype == 'UpdateSync' && selectedItems.length == ajaxcount) {
                            AlertMessages("Update Sync Capabilities", responsedata.error.message, "danger");
                            $(".failure_msg")[0].innerText = responsedata.error.message;
                            showfailuredivDiv();
                            return
                        }

                    }
                    else {
                        if (Actiontype == "AssignOwner") {
                            if (!responsedata.success) {
                                Errlist.push(responsedata.itemId);
                            }
                            if (selectedItems.length == ajaxcount) {
                                if (Errlist.length == selectedItems.length) {
                                    AlertMessages(label, "Failed to assign owner", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to assign owner";
                                    showfailuredivDiv();
                                    return;
                                }
                                else if (Errlist.length < selectedItems.length && Errlist.length > 0) {
                                    AlertMessages(label, "Assigned item owners with errors", "success");
                                    showSuccessDiv();
                                }
                                else {
                                    AlertMessages(label, "Successfully assigned item owners", "success");
                                    showSuccessDiv();

                                }
                            }
                        }
                        if (Actiontype == 'UpdateSync' && selectedItems.length == ajaxcount) {
                            AlertMessages("Update Sync Capabilities", "successfully updated items", "success");
                            showSuccessDiv();
                            return
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    alert("Error in ajax call");
                }
            });

        };

        // document.getElementById("saveItemsoptions").addEventListener("click", function () {
        $("#saveItemsoptions").click(function () {
            count = 0;

            $("#loader").css("display", "inline-block");
            if (Actiontype == "AddLayerstoWebmap") {
                for (var m = 0; m < selectedItems.length; m++) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[m] + "/update";
                    for (var n = 0; n < ItemList.length; n++) {
                        if (selectedItems[m] == ItemList[n].id) {
                            if (typeof (ItemList[n].Iteminfo.operationalLayers) != "undefined" && typeof (ItemList[n].Iteminfo.operationalLayers) != "null") {
                                ItemList[n].Iteminfo.operationalLayers = [];
                                ItemList[n].Iteminfo.operationalLayers = selectedItemsList;
                                var text = ItemList[n].Iteminfo;
                            }
                            else {
                                ItemList[n].Iteminfo.operationalLayers = ItemList[n].Iteminfo.operationalLayers.concat(selectedItemsList)
                                var text = ItemList[n].Iteminfo;
                            }
                        }
                    }


                    var queryparams = {
                        text: JSON.stringify(text),
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: queryparams,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_Item(options);
                }


            }
            if (Actiontype == 'MoveItems') {
                url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/moveItems";
                var queryparams = {
                    folder: $("#FoldersList")[0].value,
                    items: selectedItems.join(","),
                    f: "json",
                    token: portalToken
                };
                var options = {
                    query: queryparams,
                    responseType: "json",
                    method: "post"
                };
                EsriRequest_Item(options);

            }
            if (Actiontype == 'UpdateDescription') {
                count = 0;
                var updDescType = $("input[name='updDesc']:checked").val();
                var descText = $("#descriptionText")[0].value;
                if (descText == '') {
                    AlertMessages("Update Description", "Please enter description", "warning");
                    return;
                }
                for (var i = 0; i < selectedItems.length; i++) {
                    if (updDescType == 'appendDescription') {
                        for (var j = 0; j < ItemList.length; j++) {
                            if (ItemList[j].id == selectedItems[i])
                                descText = ItemList[j].description + ' ' + descText
                        }
                    }
                    url = 'https://www.arcgis.com/sharing/rest/content/users/' + sesstionItem.username + '/items/' + selectedItems[i] + '/update';
                    updateOptions = {
                        description: descText,
                        f: "json"
                    };
                    var options = {
                        query: updateOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_Item(options);
                }
            }
            if (Actiontype == 'UpdateAccess') {
                count = 0;
                var accessval = $("#updAccess")[0].value;

                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + '/items/' + selectedItems[i] + '/update';
                    updateOptions = {
                        access: accessval,
                        f: "json",
                        token: portalToken,
                        responseType: "json",
                        method: "post"
                    };
                    var options = {
                        query: updateOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_Item(options);
                }
            }
            if (Actiontype == 'UpdateSync') {
                count = 0;
                var syncVal = $("#items-control select")[0].value;
                updateSyncCapabilities(syncVal);
            }
            if (Actiontype == "ExportToCSV" || Actiontype == "ExportToJson") {
                var data = getExportingData();
                if (Actiontype == 'ExportToCSV') {
                    DownloadCsv("PortalItems", data);
                }
                else {
                    data = JSON.stringify(data, null, "\t");
                    DownloadJson("PortalItems", data);
                }
                AlertMessages("Export Items", "Successfully exported Items", "success");
                showSuccessDiv();
                $(".success_msg")[0].innerText = "Successfully Exported Items";
            }
            if (Actiontype == 'AddTagstoItems' || Actiontype == "RemoveTags") {
                Errlist = [];
                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + '/items/' + selectedItems[i] + '/' + 'update';
                    for (var j = 0; j < ItemList.length; j++) {
                        if (selectedItems[i] == ItemList[j].id) {
                            var tags = selectedItemsList;
                            var tagslist = [];
                            if (Actiontype == 'AddTagstoItems') {
                                if ($(".addTagsrad")[0].checked) {
                                    var tagslist = tags.concat(ItemList[j].tags);
                                }
                                else { // if choosen replace tags
                                    var tagslist = tags;
                                }
                                var uniqueList = [];
                                $.each(tagslist, function (i, el) {
                                    if ($.inArray(el, uniqueList) === -1)
                                        uniqueList.push(el);
                                });
                                tagslist = uniqueList;
                            }
                            else {
                                var tagcount = 0;
                                for (var m = 0; m < tags.length; m++) {
                                    if (ItemList[j].tags.indexOf(tags[m]) != -1) {
                                        tagcount++;
                                    }
                                }
                                if (tagcount == ItemList[j].tags.length) {
                                    Errlist.push(ItemList[j].title);
                                    tagslist = ItemList[j].tags;
                                }
                                else {
                                    tagslist = ItemList[j].tags.filter(function (evt) {
                                        return tags.indexOf(evt) < 0;
                                    });
                                }
                            }
                            var tagOptions = {
                                tags: tagslist.join(','),
                                f: "json",
                                token: portalToken
                            };
                            var options = {
                                query: tagOptions,
                                responseType: "json",
                                method: "post"
                            };
                            EsriRequest_Item(options);
                        }

                    }
                }
            }
            if (Actiontype == 'ShareItemstoGroups' || Actiontype == 'UnshareItemsfromGroups') {
                for (var i = 0; i < selectedItems.length; i++) {

                    if (Actiontype == 'ShareItemstoGroups') {
                        url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/share";
                    }
                    else {
                        url = Config.portalUrl + "/sharing/rest/content/items/" + selectedItems[i] + "/unshare";
                    }

                    var shareOptions = {
                        groups: selectedItemsList.join(','),
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: shareOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_Item(options);
                }
            }
            if (Actiontype == "ExportWebMapServices") {
                var getdata = $('#items-control').jsGrid('option', 'data');
                var data = [];
                for (var i = 0; i < getdata.length; i++) {
                    for (var j = 0; j < selectedItemsList.length; j++) {
                        if (getdata[i].LayerName == selectedItemsList[j]) {
                            data.push(getdata[i]);
                            break;
                        }
                    }
                }
                DownloadCsv("PortalWebMap_services", JSON.stringify(data));
                $(".success_msg")[0].innerText = "Successfully Exported Webmap Services";
                AlertMessages("Export Webmap services", "Successfully exported services", "success");
                showSuccessDiv();
            }
            if (Actiontype == "AssignOwner") {
                ajaxcount = 0;
                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/reassign";
                    //var queryparams = {
                    //    targetUsername: selectedItemsList[0],
                    //    targetFolderName: '/',
                    //    f: "json",
                    //    token: portalToken
                    //};
                    var options = {
                        targetUsername: selectedItemsList[0],
                        targetFolderName: '/',
                        f: "json",
                        token: portalToken,
                        responseType: "json",
                        method: "post"
                    };
                    AjaxRequest(url, options, "POST", "Assign owner")
                    // EsriRequest_Item(options);
                }
            }
            if (Actiontype == "Enable/disablepopup") {
                for (var i = 0; i < selectedItems.length; i++) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/update";
                    for (var j = 0; j < ItemsData.length; j++) {
                        if (selectedItems[i] == ItemsData[j].id) {
                            var text = ItemsData[j].data;
                            if (text != null && text != undefined) {
                                for (var k = 0; k < text.operationalLayers.length; k++) {
                                    text.operationalLayers[k]["disablePopup"] = JSON.parse($(".displaypopup")[0].value);
                                }
                                var queryparams = {
                                    text: JSON.stringify(text),
                                    f: "json",
                                    token: portalToken
                                };
                                var options = {
                                    query: queryparams,
                                    responseType: "json",
                                    method: "post"
                                };

                                EsriRequest_Item(options);
                                break
                            }
                        }
                    }
                }
            }
            if (Actiontype == "UpdateWebMapServices") {
                for (var m = 0; m < selectedItems.length; m++) {
                    for (var i = 0; i < ItemList.length; i++) {
                        if (selectedItems[m] == ItemList[i].id) {
                            url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[m] + "/update";
                            var oprLayers = ItemList[i].Iteminfo;
                            if (typeof (oprLayers.operationalLayers) != "undefined") {
                                for (var j = 0; j < oprLayers.operationalLayers.length; j++) {
                                    for (var k = 0; k < selectedItemsList.length; k++) {//ServiceList

                                        if (oprLayers.operationalLayers[j].layerType == "VectorTileLayer") {//Update VectorLayer Sevice Url
                                            if (oprLayers.operationalLayers[j].title.replace(/\s/g, '') == selectedItemsList[k].name) {
                                                oprLayers.operationalLayers[j].styleUrl = selectedItemsList[k].newUrl;
                                                oprLayers.operationalLayers[j].itemId = "";
                                                for (var a = 0; a < ServiceList.length; a++) {

                                                    if (ServiceList[a].url.toLowerCase() == oprLayers.operationalLayers[j].styleUrl.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.operationalLayers[j].itemId = ServiceList[a].itemid;
                                                        //oprLayers.operationalLayers[j].title = ServiceList[m].name;
                                                        break;
                                                    }
                                                }

                                                break;
                                            }
                                        }
                                        else {
                                            if (oprLayers.operationalLayers[j].title.replace(/\s/g, '') == selectedItemsList[k].name) {
                                                oprLayers.operationalLayers[j].url = selectedItemsList[k].newUrl;
                                                oprLayers.operationalLayers[j].itemId = "";
                                                for (var a = 0; a < ServiceList.length; a++) {

                                                    if (ServiceList[a].url.toLowerCase() == oprLayers.operationalLayers[j].url.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.operationalLayers[j].itemId = ServiceList[a].itemid;
                                                        //oprLayers.operationalLayers[j].title = ServiceList[m].name;
                                                        break;
                                                    }
                                                }

                                                break;
                                            }
                                        }


                                    }
                                }

                            }
                            if (typeof (oprLayers.baseMap) != "undefined") {
                                for (var j = 0; j < oprLayers.baseMap.baseMapLayers.length; j++) {
                                    for (var k = 0; k < selectedItemsList.length; k++) {

                                        if (oprLayers.baseMap.baseMapLayers[j].layerType == "VectorTileLayer") {
                                            if (oprLayers.baseMap.baseMapLayers[j].id == selectedItemsList[k].id) {
                                                oprLayers.baseMap.baseMapLayers[j].styleUrl = selectedItemsList[k].newUrl;
                                                oprLayers.baseMap.baseMapLayers[j].itemId = "";
                                                vectorServiceURL = oprLayers.baseMap.baseMapLayers[j].styleUrl.toLowerCase();
                                                vectorServiceURL = vectorServiceURL.replace("/resources/styles/root.json", "");
                                                for (var a = 0; a < ServiceList.length; a++) {

                                                    if (ServiceList[a].url.toLowerCase() == vectorServiceURL.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.baseMap.baseMapLayers[j].itemId = ServiceList[a].itemid;
                                                        //oprLayers.operationalLayers[j].title = ServiceList[m].name;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        }

                                        else {
                                            if (oprLayers.baseMap.baseMapLayers[j].id == selectedItemsList[k].id) {
                                                oprLayers.baseMap.baseMapLayers[j].url = selectedItemsList[k].newUrl;
                                                oprLayers.baseMap.baseMapLayers[j].itemId = "";
                                                for (var a = 0; a < ServiceList.length; a++) {

                                                    if (ServiceList[a].url.toLowerCase() == oprLayers.baseMap.baseMapLayers[j].url.toLowerCase()) { // Map itemid if layer already exist in target portal
                                                        oprLayers.baseMap.baseMapLayers[j].itemId = ServiceList[a].itemid;
                                                        //oprLayers.operationalLayers[j].title = ServiceList[m].name;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        }


                                    }
                                }

                            }
                            if (typeof (oprLayers.tables) != "undefined") {
                                for (var j = 0; j < oprLayers.tables.length; j++) {
                                    for (var k = 0; k < selectedItemsList.length; k++) {
                                        if (oprLayers.tables[j].title.replace(/\s/g, '') == selectedItemsList[k].name) {
                                            oprLayers.tables[j].url = selectedItemsList[k].newUrl;
                                            break;
                                        }
                                    }
                                }
                            }
                            var queryparams = {
                                text: JSON.stringify(oprLayers),
                                f: "json",
                                token: portalToken
                            };
                            var options = {
                                query: queryparams,
                                responseType: "json",
                                method: "post"
                            };

                            EsriRequest_Item(options);
                            selectedItemsList = []
                        }
                    }
                }
            }
            if (Actiontype == "BulkUpdate") {
                var itemurl; var requestOptions = []; var subrequest = []; var setcount = 0; ajaxcount = 0; var setcontent = [];
                for (var i = 0; i < selectedItems.length; i++) {
                    if ($("#itemprotect").val() != "") {
                        if ($("#itemprotect").val() == "protect")
                            itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/protect";
                        else
                            itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/unprotect";
                        var options = {
                            query: { token: portalToken, f: "json" },
                            responseType: "json",
                            method: "post"
                        }
                        requestOptions.push({ "url": itemurl, "options": options });
                    }
                    //if ($("#itemstatus").val() != '') {
                    //    var queryparams = {
                    //        token: portalToken,
                    //        f: "json",
                    //        responseType: "json",
                    //        method: "post"
                    //    }
                    //    setcount++;
                    //    itemurl = `${Config.portalUrl}/sharing/rest/content/items/` + selectedItems[i] + "/setContentStatus";
                    //    if ($("#itemstatus").val() == "Noneofabove")
                    //        queryparams.status = "";
                    //    else
                    //        queryparams.status = $("#itemstatus").val();
                    //    //var options = {
                    //    //    query: queryparams,
                    //    //    responseType: "json",
                    //    //    method: "post"
                    //    //}
                    //    setcontent.push({ "url": itemurl, "options": queryparams });
                    //}
                    var queryParams = {
                        token: portalToken,
                        f: "json"
                    };
                    var isDataExist = false;
                    if ($("#ItemSummary")[0].value != "") {
                        queryParams.snippet = $("#ItemSummary")[0].value;
                        isDataExist = true
                    }
                    if ($("#Itemdescription")[0].value != "") {
                        queryParams.description = $("#Itemdescription")[0].value
                        isDataExist = true
                    }
                    if ($("#ItemAccess").val() != "") {
                        itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/shareItems";
                        isDataExist = true
                        var shareparams = {
                            items: selectedItems[i],
                            token: portalToken,
                            groups: '',
                            confirmItemControl: true,
                            f: "json"
                        }
                        var shareoptions = {
                            query: shareparams,
                            responseType: "json",
                            method: "post"
                        }
                        if ($("#ItemAccess").val() == "org") {
                            shareparams.everyone = false;
                            shareparams.org = true
                        }
                        else if ($("#ItemAccess").val() == "private") {
                            shareparams.everyone = false;
                            shareparams.org = false
                        }
                        else {
                            shareparams.everyone = true;
                            shareparams.org = false
                        }
                        subrequest.push({ "url": itemurl, "options": shareoptions });
                    }
                    if ($("#ItemAttribution")[0].value != "") {
                        queryParams.accessInformation = $("#ItemAttribution")[0].value
                        isDataExist = true
                    }
                    if (isDataExist) {
                        itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + selectedItems[i] + "/update";
                        var updateoptions = {
                            query: queryParams,
                            responseType: "json",
                            method: "post"
                        };
                        requestOptions.push({ "url": itemurl, "options": updateoptions });
                    }
                }
                if (subrequest.length > 0)
                    requestOptions = requestOptions.concat(subrequest);
                selectedItemsList = requestOptions.length - setcount;
                for (var i = 0; i < requestOptions.length; i++) {
                    url = requestOptions[i].url;
                    EsriRequest_Item(requestOptions[i].options)
                };
            }
            if (Actiontype == "Importitems") {
                count = 0;
                url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/addItem";
                for (var i = 0; i < temdata.length; i++) {
                    for (var j = 0; j < selectedItemsList.length; j++) {

                        if (selectedItemsList[j] == temdata[i].title) {
                            if (temdata[i].type != "Feature Service") {
                                var itemOptions = temdata[i];
                                itemOptions.f = "json";
                                itemOptions.token = portalToken;
                                var options = {
                                    query: itemOptions,
                                    responseType: "json",
                                    method: "post"
                                };
                                EsriRequest_Item(options);
                            }

                        }
                    }
                }

                for (var i = 0; i < temdata.length; i++) {
                    for (var j = 0; j < selectedItemsList.length; j++) {
                        if (selectedItemsList[j] == temdata[i].title) {
                            if (temdata[i].type == "Feature Service") {
                                loadFeatureService_data(temdata[i]);
                            }

                        }
                    }
                }

            }

        });
        function loadFeatureService_data(item) {
            var itemOptions = {};
            var date = new Date(); // some mock date
            var milliseconds = date.getTime();
            var createParamsObj = {
                name: item.title + "_" + milliseconds,
                serviceDescription: item.description,
                description: item.description,
                spatialReference: item.spatialReference,
                initialExtent: item.extent,
                capabilities: "Create,Delete,Query,Update,Editing,Sync",
                xssPreventionInfo: {
                    xssPreventionEnabled: true,
                    xssPreventionRule: "input",
                    xssInputRule: "rejectInvalid"
                }
            }
            itemOptions = {
                createParameters: JSON.stringify(createParamsObj),
                outputType: "featureService",
                f: "json",
                token: portalToken
            }
            old_serviceurl = item.url;
            createFeatureService(item, itemOptions);
        }

        function createFeatureService(item, itemOptions) {
            var v_url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + '/createService';

            var itemparams = itemOptions;
            itemparams.responseType = "json";
            itemparams.method = "post";

            $.ajax({
                url: v_url,
                type: "POST",
                crossDomain: true,
                data: itemparams,
                xhrFields: {
                    withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                },
                success: function (data) {
                    count++;
                    var response = data;
                    if (typeof (response) == "string")
                        response = JSON.parse(data);
                    if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                        errcount++;
                        if (selectedItemsList.length == errcount && count == selectedItemsList.length) {
                            AlertMessages("Import items", response.error.message, "danger");
                            $(".failure_msg")[0].innerText = response.error.message;
                            showfailuredivDiv();
                        }
                        if (count == selectedItemsList.length && errcount < selectedItemsList.length) {
                            AlertMessages("Import items", "Successfully imported items with errors", "success");
                            showSuccessDiv();
                        }
                    }
                    else {

                        new_serviceurl = response.serviceurl;
                        updateItem_FS(response.itemId, item);
                        getfeatureServiceLayers(item.name);
                        if (count == selectedItemsList.length && errcount == 0) {
                            AlertMessages("Import items", "Successfully imported items", "success");
                            showSuccessDiv();
                        }
                        if (count == selectedItemsList.length && errcount > 0) {
                            AlertMessages("Import items", "Successfully imported items with errors", "success");
                            showSuccessDiv();
                        }

                    }
                },
                error: function (data, textStatus, jqXHR) {
                    errcount++;
                    console.log("failed to create service")
                }
            });
        }
        //laoding layers data from source
        function getfeatureServiceLayers(ItemName) {
            var v_url = old_serviceurl + '/layers';
            var options = {
                query: { token: portalToken, f: "json" },
                responseType: "json",
                method: "get"
            };
            esriRequest(v_url, options).then(function (response) {

                var defData = response.data;
                addToDefination_FS(defData, ItemName);
            }).catch(function (err) {
                console.log(err);

            });
        }

        //adding service defination with layers
        function addToDefination_FS(defData, ItemName) {
            var v_url = new_serviceurl + '/addToDefinition';
            v_url = v_url.replace("/rest/services/", "/rest/admin/services/");
            var data = JSON.stringify(defData)
            var options = {
                query: { token: portalToken, addToDefinition: data, f: "json" },
                responseType: "json",
                method: "post"
            };
            esriRequest(v_url, options).then(function (response) {

                queryfeaturesFromSource(defData.layers, ItemName);
            }).catch(function (err) {
                console.log(err);

            });
        }
        //loading features from source layers
        function queryfeaturesFromSource(layers, ItemName) {
            var count = -1;
            for (var i = 0; i < layers.length; i++) {
                var v_url = old_serviceurl + '/' + layers[i].id + '/query';
                var options = {
                    query: {
                        where: "1=1",
                        outFields: "*",
                        returnGeometry: true,
                        token: portalToken,
                        f: "json"
                    },
                    responseType: "json",
                    method: "get"
                };

                esriRequest(v_url, options).then(function (response) {

                    count = count + 1;
                    addfeaturesToDestination(layers[count].id, response.data.features, ItemName);
                }).catch(function (err) {

                });
            }
        }
        //adding features to newly created service layers
        function addfeaturesToDestination(layerId, features, ItemName) {
            var featurestext = JSON.stringify(features);
            var v_url = new_serviceurl + '/' + layerId + '/addFeatures';
            var options = {
                query: {
                    features: featurestext,
                    token: portalToken,
                    f: "json"
                },
                responseType: "json",
                method: "post"
            };
            esriRequest(v_url, options).then(function (response) {

            }).catch(function (err) {
                console.log(err);
            });
        }

        function updateItem_FS(tar_Id, item) {
            var itemOptions = null;
            var v_url = Config.portalUrl + '/sharing/rest/content/users/' + sesstionItem.username + '/items/' + tar_Id + '/' + 'update';

            itemOptions = {
                tags: item.tags,//.join(','),
                token: portalToken,
                f: "json"
            };

            var options = {
                query: itemOptions,
                responseType: "json",
                method: "post"
            };
            esriRequest(v_url, options).then(function (response) {

            }).catch(function (err) {
                console.log(err);
            });

        }
        function getExportingData() {
            var exportdata = [];
            var selectedItemInfo = [];
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id) {
                        selectedItemInfo.push(ItemList[j]);
                        break;
                    }
                }
            }
            if (selectedItemInfo.length == 0)
                selectedItemInfo = ItemList;
            for (var i = 0; i < selectedItemInfo.length; i++) {

                var itemOptions = {};
                for (var k = 0; k < selectedItemsList.length; k++) {
                    for (var m = 0; m < ItemParameters.length; m++) {
                        if (ItemParameters[m].Key == selectedItemsList[k]) {

                            if (typeof (selectedItemInfo[i][selectedItemsList[k]]) == "object" && selectedItemInfo[i][selectedItemsList[k]] != null) {
                                if (selectedItemsList[k] == "Iteminfo") {
                                    if (Actiontype == 'ExportToCSV')
                                        //itemOptions[ItemParameters[m].exportLabel] = (selectedItemInfo[i][selectedItemsList[k]] != null || selectedItemInfo[i][selectedItemsList[k]] != undefined) ?  JSON.stringify(selectedItemInfo[i][selectedItemsList[k]]).replace(/"/g, "\'"): null;
                                        itemOptions[ItemParameters[m].exportLabel] = (selectedItemInfo[i][selectedItemsList[k]] != null || selectedItemInfo[i][selectedItemsList[k]] != undefined) ? '"' + JSON.stringify(selectedItemInfo[i][selectedItemsList[k]]).replace(/"/g, '\""') + '"' : null;
                                    else
                                        itemOptions[ItemParameters[m].exportLabel] = (selectedItemInfo[i][selectedItemsList[k]] != null || selectedItemInfo[i][selectedItemsList[k]] != undefined) ? selectedItemInfo[i][selectedItemsList[k]] : null;
                                }
                                else {
                                    itemOptions[ItemParameters[m].exportLabel] = selectedItemInfo[i][selectedItemsList[k]].join(" ");
                                }

                            }
                            else {
                                itemOptions[ItemParameters[m].exportLabel] = JSON.stringify(selectedItemInfo[i][selectedItemsList[k]]) //selectedItemInfo[i][selectedItemsList[k]];
                            }
                        }
                    }
                }
                exportdata.push(itemOptions);

            }
            return exportdata;
        };

        $(".bulkUpdate").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Update Item", "Please select atleat one item", "warning");
                return;
            }
            Actiontype = "BulkUpdate";
            $(".getselecteditems").addClass("disbaleClass");
            $(".wizard_header")[0].innerText = "Update Items";
            $("#items-control").empty().append(bulkContent);
            $("#ItemsBulkUpdate").css("display", "block");
            HidetoggleItemsTable();
            $(function () {
                $('#ItemsBulkUpdate input:text').keyup(validateButton);
                $('#ItemsBulkUpdate select').change(validateButton);

                function validateButton() {
                    var validation = true;
                    $('#ItemsBulkUpdate input:text, #ItemsBulkUpdate select').each(function () {
                        if ($.trim($(this).val()).length > 0) {
                            validation = false;
                        }
                    });

                    if (validation) {
                        $(".getselecteditems").addClass("disbaleClass");
                    } else {
                        $(".getselecteditems").removeClass("disbaleClass");
                    }
                }
            });
            $(".wizard_header")[0].innerText = "Item Parameters"
            breadcrum_Label("Update Items");
        });

        function _viewitems(id) {


            jsonitemid = id;
            for (var m = 0; m < ItemList.length; m++) {
                if (ItemList[m].id == id) {
                    iteminfo = ItemList[m].Iteminfo;
                    itemOptions = {
                        id: ItemList[m].id,
                        owner: ItemList[m].owner,
                        created: ItemList[m].created,
                        isOrgItem: ItemList[m].isOrgItem,
                        modified: ItemList[m].modified,
                        guid: ItemList[m].guid,
                        name: ItemList[m].name,
                        title: ItemList[m].title,
                        type: ItemList[m].type,
                        typeKeywords: ItemList[m].typeKeywords,
                        description: ItemList[m].description,
                        tags: ItemList[m].tags,
                        snippet: ItemList[m].snippet,
                        thumbnail: ItemList[m].thumbnail,
                        documentation: ItemList[m].documentation,
                        categories: ItemList[m].categories,
                        spatialReference: ItemList[m].spatialReference,
                        accessInformation: ItemList[m].accessInformation,
                        licenseInfo: ItemList[m].licenseInfo,
                        culture: ItemList[m].culture,
                        properties: ItemList[m].properties,
                        url: ItemList[m].url,
                        proxyFilter: ItemList[m].proxyFilter,
                        access: ItemList[m].access,
                        size: ItemList[m].size,
                        appCategories: ItemList[m].appCategories,
                        industries: ItemList[m].industries,
                        languages: ItemList[m].languages,
                        largeThumbnail: ItemList[m].largeThumbnail,
                        banner: ItemList[m].banner,
                        screenshots: ItemList[m].screenshots,
                        listed: ItemList[m].listed,
                        ownerFolder: ItemList[m].ownerFolder,
                        protected: ItemList[m].protected,
                        commentsEnabled: ItemList[m].commentsEnabled,
                        numComments: ItemList[m].numComments,
                        numRatings: ItemList[m].numRatings,
                        avgRating: ItemList[m].avgRating,
                        numViews: ItemList[m].numViews,
                        itemControl: ItemList[m].itemControl,
                        scoreCompleteness: ItemList[m].scoreCompleteness,
                        groupDesignations: ItemList[m].groupDesignations,
                    }
                }

            }
            if ($('#editor').val() == undefined) {
                $("#bulk_Itemform").append("<div id ='editor'></div>");
            }

            $("#editor")[0].value = itemOptions;
            $('#Itemsjson').css("display", "block");
            $('#Itemsjson .row').css("display", "block").css("opacity", 2);
            $('#editor').css("display", "block");
            $('._opl').css("display", "block");
            $('._opl').css("opacity", "2");
            $('.opl').css("display", "none");
            $('#editor1').css("display", "none");

            breadcrum_Label("View ItemJson");
            editor = ace.edit("editor");
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/json");
            editor.renderer.setShowGutter(true);
            editor.getSession().setUseWrapMode(true);
            editor.getSession().setValue(JSON.stringify($("#editor")[0].value, null, '\t'));
            editor.getSession().on("changeAnnotation", function (e) {

                if (ActionType1 == 'reverted') {

                }
                else {

                    ActionType1 = 'edited';

                }
                edit1Count++;
                //if (revertflag == true) { editflag = false; }
                //else {editflag = true;  }
                var annot = editor.getSession().getAnnotations();
                if (annot.length > 0) { $("#savejsonitem").addClass("disbaleClass"); }
                else { $("#savejsonitem").removeClass("disbaleClass"); }
                //revertflag = false;
            });
            var errors = editor.getSession().getAnnotations();
            if (iteminfo != null) {
                if ($('#editor1').val() == undefined) {
                    $("#_bulk_Itemform").append("<div id ='editor1'></div>");
                }
                editor1 = ace.edit("editor1");
                editor1.setTheme("ace/theme/monokai");
                editor1.getSession().setMode("ace/mode/json");
                editor1.renderer.setShowGutter(true);
                editor1.getSession().setUseWrapMode(true);
                editor1.getSession().setValue(JSON.stringify(iteminfo, null, '\t'));
                editor1.getSession().on("changeAnnotation", function (e) {
                    if (ActionType2 == 'reverted') {

                    }
                    else {
                        ActionType2 = 'edited';
                    }
                    edit2Count++
                    //if (revert1flag == true) { edit1flag = false; }
                    //else {edit1flag = true; }
                    var _annot = editor1.getSession().getAnnotations();
                    if (_annot.length > 0) { $("#_savejsonitem").addClass("disbaleClass"); }
                    else { $("#_savejsonitem").removeClass("disbaleClass"); }
                    //revert1flag = false
                });
                $('#editor1').css("display", "block");
                $('.opl').css("display", "block");
                $('.opl').css("opacity", "2");

            }

        }
        $('#Revertjsonitem').click(function (e) { // Revert items Info
            //revertflag = true;
            //editflag = false;
            ActionType1 = 'reverted';
            editor.getSession().setValue(JSON.stringify(itemOptions, null, '\t'));
            e.preventDefault();
        });
        $('#_Revertjsonitem').click(function (e) { // Revert items Data
            // revert1flag = true;
            // edit1flag = false;
            ActionType2 = 'reverted';
            editor1.getSession().setValue(JSON.stringify(iteminfo, null, '\t'));
            e.preventDefault();
        });
        $('#savejsonitem').click(function (e) { // updating selected items 
            try {
                editor = ace.edit("editor");
                var info = editor.getValue();
                jsondata = JSON.parse(info);
                var _requestOptions = [];
                Actiontype = "ViewItems";
                var owner; var properties; var ownerFolder;
                var id;
                var _tagslist; var _typeKeywordslist; var _categoriesList; var _appCategorieslist; var _industrieslist; var _languageslist; var _Screenlist;
                for (var j = 0; j < ItemList.length; j++) {
                    if (ItemList[j].id == jsonitemid) {
                        var _tags = ItemList[j].tags;
                        var _typeKeywords = ItemList[j].typeKeywords;
                        var _categories = ItemList[j].categories;
                        var _appcategories = ItemList[j].appCategories;
                        var _industries = ItemList[j].industries;
                        var _languages = ItemList[j].languages;
                        var _screen = ItemList[j].screenshots;
                        _tagslist = _tags.concat(jsondata.tags);
                        _typeKeywordslist = _typeKeywords.concat(jsondata.typeKeywords);
                        _categoriesList = _categories.concat(jsondata.categories);
                        _appCategorieslist = _appcategories.concat(jsondata.appCategories);
                        _industrieslist = _industries.concat(jsondata.industries);
                        _languageslist = _languages.concat(jsondata.languages);
                        _Screenlist = _screen.concat(jsondata.screenshots)
                        id = ItemList[j].id;
                        properties = ItemList[j].properties;
                        ownerFolder = ItemList[j].ownerFolder;
                        owner = ItemList[j].owner;
                        var _uniqueList = [];
                        $.each(_tagslist, function (i, el) {
                            if ($.inArray(el, _uniqueList) === -1)
                                _uniqueList.push(el);
                        });
                        _tagslist = _uniqueList;
                        var Uniquetypewords = [];
                        $.each(_typeKeywordslist, function (i, el) {
                            if ($.inArray(el, Uniquetypewords) === -1)
                                Uniquetypewords.push(el);
                        });
                        _typeKeywordslist = Uniquetypewords;
                        var Uniquecategories = [];
                        $.each(_categoriesList, function (i, el) {
                            if ($.inArray(el, Uniquecategories) === -1)
                                Uniquecategories.push(el);
                        });
                        _categoriesList = Uniquecategories;
                        var Uniqueappcategories = [];
                        $.each(_appCategorieslist, function (i, el) {
                            if ($.inArray(el, Uniqueappcategories) === -1)
                                Uniqueappcategories.push(el);
                        });
                        _appCategorieslist = Uniqueappcategories;
                        var Uniqueindustries = [];
                        $.each(_industrieslist, function (i, el) {
                            if ($.inArray(el, Uniqueindustries) === -1)
                                Uniqueindustries.push(el);
                        });
                        _industrieslist = Uniqueindustries;
                        var Uniquelanguageslist = [];
                        $.each(_languageslist, function (i, el) {
                            if ($.inArray(el, Uniquelanguageslist) === -1)
                                Uniquelanguageslist.push(el);
                        });
                        _languageslist = Uniquelanguageslist;
                        var Uniquescreenlist = [];
                        $.each(_Screenlist, function (i, el) {
                            if ($.inArray(el, Uniquescreenlist) === -1)
                                Uniquescreenlist.push(el);
                        });
                        _Screenlist = Uniquescreenlist;
                    }
                }

                var queryParams = {
                    token: portalToken,
                    f: "json"
                };
                if (id != jsondata.id || owner != jsondata.owner || properties != jsondata.properties || ownerFolder != jsondata.ownerFolder) {
                    AlertMessages("Update Items", "Unable to update the field", "danger");
                    return;
                }
                queryParams.id = jsondata.id;
                queryParams.owner = jsondata.owner;
                queryParams.created = jsondata.created;
                queryParams.isOrgItem = jsondata.isOrgItem;
                queryParams.modified = jsondata.modified;
                queryParams.guid = jsondata.guid;
                queryParams.name = jsondata.name;
                queryParams.title = jsondata.title;
                queryParams.type = jsondata.type;
                queryParams.typeKeywords = _typeKeywordslist.join(',');
                queryParams.description = jsondata.description;
                queryParams.tags = _tagslist.join(',');
                queryParams.snippet = jsondata.snippet;
                queryParams.thumbnail = jsondata.thumbnail;
                queryParams.documentation = jsondata.documentation;
                queryParams.categories = _categoriesList.join(',');
                queryParams.spatialReference = jsondata.spatialReference;
                queryParams.accessInformation = jsondata.accessInformation;
                queryParams.licenseInfo = jsondata.licenseInfo;
                queryParams.culture = jsondata.culture;
                queryParams.properties = jsondata.properties;
                queryParams.url = jsondata.url;
                queryParams.proxyFilter = jsondata.proxyFilter;
                queryParams.access = jsondata.access;
                queryParams.size = jsondata.size;
                queryParams.appCategories = _appCategorieslist.join(',');
                queryParams.industries = _industrieslist.join(',');
                queryParams.languages = _languageslist.join(',');
                queryParams.largeThumbnail = jsondata.largeThumbnail;
                queryParams.banner = jsondata.banner;
                queryParams.screenshots = _Screenlist.join(',');
                queryParams.listed = jsondata.listed;
                queryParams.ownerFolder = jsondata.ownerFolder;
                queryParams.protected = jsondata.protected;
                queryParams.numComments = jsondata.numComments;
                queryParams.numRatings = jsondata.numRatings;
                queryParams.avgRating = jsondata.avgRating;
                queryParams.numViews = jsondata.numViews;
                queryParams.scoreCompleteness = jsondata.scoreCompleteness;
                queryParams.groupDesignations = jsondata.groupDesignations;


                var _itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + jsonitemid + "/update";
                var updateoptions = {
                    query: queryParams,
                    responseType: "json",
                    method: "post"
                };
                url = _itemurl;
                _requestOptions.push({ "url": _itemurl, "options": updateoptions });
                EsriRequest_Item(_requestOptions[0].options);
                //$(".breadcrumb_Home").click();

            } catch (e) {

                AlertMessages("Update Items", "Unexpected JSON Format", "danger");
                e.preventDefault();
                // $('._opl').css("display", "block");
                // $('._opl').css("opacity", "2");
                return;

            }
        });

        $('#_savejsonitem').click(function (e) { // updating selected items 
            try {
                var editor1 = ace.edit("editor1");
                var info = editor1.getValue();
                var jsondata = info;
                JSON.parse(info);
                var _requestOptions = [];
                Actiontype = "ViewItems";
                var queryParams = {
                    text: jsondata,
                    token: portalToken,
                    f: "json"
                };
                var _itemurl = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + jsonitemid + "/update";
                var updateoptions = {
                    query: queryParams,

                };
                url = _itemurl;
                _requestOptions.push({ "url": _itemurl, "options": updateoptions });
                EsriRequest_Item(_requestOptions[0].options);
                // $(".breadcrumb_Home").click();

            } catch (e) {

                AlertMessages("Update Items", "Unexpected JSON Format", "danger");
                e.preventDefault();
                //$('.opl').css("display", "block");
                // $('.opl').css("opacity", "2");

            }
        });
        $('#close').click(function (e) {
            // if (ActionType1 == 'reverted' || edit1Count < 3) {
            //     ShowtoggleItemsTable();
            //     $('#Itemsjson').css("display", "none");
            //     $(".breadcrumb_Home").click();

            // }
            //else if (ActionType2 == 'reverted' || edit2Count < 3) {
            //     ShowtoggleItemsTable();
            //     $('#Itemsjson').css("display", "none");
            //     $(".breadcrumb_Home").click();
            // }
            // else {
            const swalWithBootstrapButtons = swal.mixin({
                confirmButtonClass: 'btn btn-success mb-2',
                cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                buttonsStyling: false,
            });
            errcount = 0;
            swalWithBootstrapButtons({
                title: 'Update ItemJson',
                text: "Do you want to continue unsaved data will be lost ?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No!',
                reverseButtons: true
            }).then(function (result) {
                //if (edit1flag == false && editflag == false) {
                //    ShowtoggleItemsTable();
                //    $('#Itemsjson').css("display", "none");
                //    $(".breadcrumb_Home").click();
                //} else {
                if (result.value) {

                    ShowtoggleItemsTable();
                    $('#Itemsjson').css("display", "none");
                    $(".breadcrumb_Home").click();
                } else if (
                    // Read more about handling dismissals
                    result.dismiss === swal.DismissReason.cancel
                ) {
                    return;
                    //  Actiontype = '';
                }
                //}
            });
            // }
        });






        $(".Description").click(function () { // updating selected items description
            if (selectedItems.length == 0) {
                AlertMessages("Update Description", "Please select atleat one item", "warning");
                return;
            }
            Actiontype = 'UpdateDescription';
            $("#ItemLabels")[0].innerText = "Update Description";
            $("#ItemupdateModal").modal('toggle');
            $("#updateDesc").css("display", "block");
            $("#itemsdrp").css("display", "none");
            $("#updateAccess").css("display", "none");
            $("#updateSync").css("display", "none");

        });
        $(".SharingProperties").click(function () { // updating selected items sharing properties
            if (selectedItems.length == 0) {
                AlertMessages("Update Access", "Please select atleat one item", "warning");
                return;
            }
            Actiontype = 'UpdateAccess';
            $("#ItemLabels")[0].innerText = "Update Sharing Properties";
            $("#ItemupdateModal").modal('toggle');
            $("#updateAccess").css("display", "block");
            $("#updateDesc").css("display", "none");
            $("#itemsdrp").css("display", "none");
            $("#updateSync").css("display", "none");
        });
        $(".SyncCapabilities").click(function () { // updating selected items sync capabilities
            var isFeatureService = false;
            if (selectedItems.length == 0) {
                AlertMessages("Update Sync Capabilities", "Please select atleat one item", "warning");
                return;
            }
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (ItemList[j].id == selectedItems[i] && ItemList[j].type == "Feature Service")
                        isFeatureService = true;
                }
            }
            if (!isFeatureService) {
                AlertMessages("Update Sync Capabilities", "Please select Feature Service", "warning");
                return;
            }
            Actiontype = 'UpdateSync';
            var nodecontainer = "<div class='row'><div class='itm_container col-sm-12'></div></div>";
            var spanselect = document.createElement('span');
            spanselect.className = "col-sm-8";
            var select = document.createElement('select');
            select.id = "updSync";
            select.className = "form-control1 custom-select custom-select-sm col-sm-8";
            $("#items-control").empty();
            var option = document.createElement('option');
            option.value = '';
            option.textContent = 'Select Capabilities';
            select.append(option);
            var fields = [
                {
                    name: "Enable",
                    value: "enable"
                },
                {
                    name: "Disable",
                    value: "disable"
                }
            ]
            for (var i = 0; i < fields.length; i++) {
                var option = document.createElement('option');
                option.value = fields[i].value
                option.textContent = fields[i].name;
                select.append(option);
            }
            $("#items-control").append(nodecontainer);
            $(".itm_container").append("<span class='col-sm-4'><label class='mt-3'>Select Item Capabilities for updating:</label></span>");
            $(".itm_container").append($(spanselect));
            $(spanselect).css("float", "right");
            $(spanselect).append(select);
            HidetoggleItemsTable();
            $(".getselecteditems").addClass("disbaleClass");
            $(".wizard_header")[0].innerText = "Update Sync Capabilities";
            breadcrum_Label("Update Sync Capabilities");
            setTimeout(function () {
                $("#items-control select").change(function () {
                    if ($(this).val() != '') {
                        $(".getselecteditems").removeClass("disbaleClass");
                        //selectedItemsList.push($(this).val());
                    }
                    else
                        $(".getselecteditems").addClass("disbaleClass");
                });
            }, 1000);
        });
        $(".togglewebmapPopup").click(function () {
            Actiontype = "Enable/disablepopup";
            $(".wizard_header")[0].innerText = "Popup Information";
            var selectedWebMaps = [];
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id && ItemList[j].type == "Web Map") {
                        selectedWebMaps.push(ItemList[j]);
                        break;
                    }
                }
            }
            if (selectedWebMaps.length == 0) {
                AlertMessages("Export Webmap Services Url", "Please select atleast one webmap", "warning");
                return
            }
            breadcrum_Label("Popup Information");
            $("#items-control").empty();
            var div = "<div class='row' style='margin-top:20px;'><div class='col-sm-12'><span class='col-sm-4'>Enable/Disable Webmap Popup:</span><span class='col-sm-8' style='float:right'><select class='displaypopup form-control1 custom-select custom-select-sm' ><option value=''>Choose option</option> <option value='false'>Enable</option> <option value='true'>disable</option></select ></span></div ></div > "
            $("#items-control").append(div);
            HidetoggleItemsTable();
            $(".getselecteditems").addClass("disbaleClass");
            $(".displaypopup").change(function () {
                $(".getselecteditems").removeClass("disbaleClass");
                if ($(this).val() == "") {
                    $(".getselecteditems").addClass("disbaleClass");
                }
            })
        })

        $(".Firstpreview").click(function () {
            ShowtoggleItemsTable();
            count = 0;
            selectedItemsList = [];
            $(".getselecteditems").removeClass("disbaleClass");
            $("#ItemsBulkUpdate").css("display", "none");
            $(".items_radbtn").css("display", "none");
            Errlist = [];
        });
        $(".shareItemstogroups").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Share Items", "Please select items", "warning");
                return;
            }
            count = 0;
            Actiontype = 'ShareItemstoGroups';
            // breadcrum_Label("Share Items to Groups");
            Errlist = [];
            GetGroupsList(groupsList);
        });
        $(".unshareItemsfromgroups").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Unshare Items", "Please select items", "warning");
                return;
            }
            count = 0;
            Actiontype = 'UnshareItemsfromGroups';
            // breadcrum_Label("Unshare Items from Groups");
            Errlist = [];
            GetItemsGroupsList();
        });

        $(".reassignOwner").click(function () {

            if (selectedItems.length == 0) {
                AlertMessages("Assign owner", "Please select atleast one item", "warning");
                return;
            }
            Actiontype = "AssignOwner";
            var usrData = [];
            var selectItem = function (node, item) {
                selectedItemsList = [];
                selectedItemsList.push(item);
                var nodeList = $("#items-control .jsgrid-cell .singleCheckbox");
                $("#items-control .jsgrid-cell .singleCheckbox").each(function (node) {
                    if ($(nodeList)[node].id != item) {
                        $(nodeList)[node].checked = false;
                    }
                })
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };
            var unselectItem = function (node, item) {
                selectedItemsList = $.grep(selectedItemsList, function (i) {
                    return i !== item;
                });
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };
            for (var i = 0; i < Userlist.length; i++) {
                var userObj = {
                    id: Userlist[i].username,
                    UserName: Userlist[i].username,
                    FullName: Userlist[i].fullName,
                    CreatedDate: new Date(Userlist[i].created).toLocaleDateString(),
                    LastLogin: new Date(Userlist[i].modified).toLocaleDateString()
                }
                usrData.push(userObj);
            }
            var fields = [
                {
                    name: "",
                    width: 60,
                    itemTemplate: function (value, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.id)
                            .prop("checked", $.inArray(item.id, selectedItemsList) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(this, $(this)[0].id) : unselectItem(this, $(this)[0].id);
                            });
                    },
                    sorting: false,
                    filtering: false,
                },
                { name: "UserName", type: "text" },
                { name: "FullName", type: "text", title: "Full Name" },
                { name: "CreatedDate", type: "date", title: "Created Date" },
                { name: "LastLogin", type: "date", title: "Modified Date" },
            ];
            if (usrData.length == 0) {
                AlertMessages("Assign Owner", "No users are found for changing ownership", "warning");
                return;
            }
            loadportalGroups(usrData, fields);
            HidetoggleItemsTable();
            $(".wizard_header")[0].innerText = "Assign Owner";
            breadcrum_Label("Assign Owner");
        })
        function GetItemsGroupsList() {
            var itemGroups = [];
            count = 0;
            for (var i = 0; i < selectedItems.length; i++) {
                url = Config.portalUrl + "/sharing/rest/content/items/" + selectedItems[i] + "/groups";
                var queryParams = {
                    f: "json",
                    token: portalToken
                };
                var options = {
                    query: queryParams,
                    responseType: "json"
                };
                esriRequest(url, options).then(function (response) {
                    var results = response.data.admin;
                    for (var i = 0; i < results.length; i++) {
                        itemGroups.push(results[i]);
                    }
                    count++;
                    if (count == selectedItems.length) {
                        if (itemGroups.length == 0) {
                            AlertMessages("Unshare Items", "No groups found", "warning");
                            return;
                        }
                        else
                            GetGroupsList(itemGroups);
                        breadcrum_Label("Unshare Items from Groups");

                    }
                });

            }
        }
        function GetGroupsList(groups) {
            $("#items-control").empty();
            var groupsData = [];
            groups.forEach(function (group) {
                var groupObj = {
                    id: group.id,
                    Title: group.title,
                    Access: group.access,
                    Description: group.description,
                    CreatedOn: new Date(group.created).toLocaleDateString(),
                    ModifiedOn: new Date(group.modified).toLocaleDateString(),
                };
                groupsData.push(groupObj);
            });
            if (Actiontype == 'ShareItemstoGroups') {
                breadcrum_Label("Share Items to Groups");
            }
            var selectItem = function (item) {
                selectedItemsList.push(item);
                //if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                //    $("#selectAllItemCheckbox").prop("checked", true);
                //} else {
                //    $("#selectAllItemCheckbox").prop("checked", false);
                //}
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };
            var unselectItem = function (item) {

                selectedItemsList = $.grep(selectedItemsList, function (i) {
                    return i !== item;
                });
                //if (selectedItemsList.length == 0) {
                //    $('#selectAllItemCheckbox').attr('checked', false);
                //}
                //if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                //    $("#selectAllItemCheckbox").prop("checked", true);
                //} else {
                //    $("#selectAllItemCheckbox").prop("checked", false);
                //}
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };
            fields = [
                //{
                //    name: "",
                //    width: 60,
                //    itemTemplate: function (value, item) {
                //        var chkbox = $("<input>").attr("value", item.id).attr("type", "checkbox").attr("class", "getGroups");
                //        return chkbox;
                //    },
                //    sorting: false,
                //    filtering: false,
                //},
                {
                    visible: true,
                    itemTemplate: function (_, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.id)
                            .prop("checked", $.inArray(item.title, selectedItems) > -1)
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
                { name: "Description", type: "text" },
                { name: "CreatedOn", type: "date" },
                { name: "ModifiedOn", type: "date" },
            ]
            loadportalGroups(groupsData, fields);
            // $("#itemTableDiv").css("display", "none");
            // $(".item_colums_list").css("display", "none");
            // $(".Item_ActionPanel").css("display", "none");
            // $("#Items_wizard").css("display", "block");
            HidetoggleItemsTable();
            $(".wizard_header")[0].innerText = "Groups information";

            //$("#wizard_confirmtab").css({ "display": "none", "opacity": "0" });
            //$("#wizard_itemstab").css({ "display": "block", "opacity": "1" });

        }

        function loadportalGroups(groupdata, Fields) {
            $("#items-control").jsGrid({
                width: "100%",
                height: "auto",
                heading: true,
                filtering: false,
                sorting: true,
                paging: true,
                pageSize: 5,
                data: groupdata,
                controller: {
                    data: groupdata,
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
            $(".getselecteditems").addClass("disbaleClass");
        }
        $("#ImportItemCsv").click(function () {

            $("#inputitemFile01").val('').clone(true);
        });
        $("#ImportItemJson").click(function () {
            $("#inputitemFile01").val('').clone(true);
        });
        function loadItemsData_FS(itemdata) {

            var createParamsObj = {
                name: itemdata.name,
                serviceDescription: '',
                description: '',
                //spatialReference: item.spatialReference,
                // initialExtent: item.extent,
                capabilities: "Create,Delete,Query,Update,Editing,Sync",
                xssPreventionInfo: {
                    xssPreventionEnabled: true,
                    xssPreventionRule: "input",
                    xssInputRule: "rejectInvalid"
                }
            }
            itemOptions = {
                createParameters: JSON.stringify(createParamsObj),
                outputType: "featureService",
                f: "json"
            }
            v_featServUrl = item.url;
            createFeatureService(itemOptions, Id);

        };
        function GetimportedItemsList(itemdata) {
            $("#items-control").empty();
            var ItemsData = [];
            if (sesstionItem.type != "PortalforArcgis") {
                var validateditems = ["Web Map", "Feature Service", "Dashboard", "StoryMap", "Web Mapping Application", "Route Layer", "Web Experience", "Application"]
            }
            else {
                var validateditems = ["Web Map", "Feature Service", "Web Mapping Application", "Route Layer", "Application"]
            }

            itemdata.forEach(function (item) {
                if (validateditems.indexOf(item.type) != -1) {
                    var itemObj = {
                        Title: item.title,
                        Access: item.access,
                        Type: item.type,
                        Name: item.name
                    };
                    ItemsData.push(itemObj);
                }
            });
            var selectItem = function (item) {
                selectedItemsList.push(item);
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };
            var unselectItem = function (item) {

                selectedItemsList = $.grep(selectedItemsList, function (i) {
                    return i !== item;
                });

                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };

            fields = [
                {
                    name: "",
                    width: 60,
                    itemTemplate: function (value, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.Title)
                            .prop("checked", $.inArray(item.Title, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                            });
                    },
                    sorting: false,
                    filtering: false,
                },
                { name: "Title", type: "text" },
                { name: "Access", type: "text" },
                { name: "Type", type: "text" },
                { name: "Name", type: "text" }
            ]
            loadportalGroups(ItemsData, fields);
            HidetoggleItemsTable();
            $("#MainCard").hide();
            $("#Wizard_Items").show();
            //$("#itemLabels")[0].innerText = "Imported items list";
            //$("#itemTableDiv").css("display", "none");
            // $(".item_colums_list").css("display", "none");
            // $(".Item_ActionPanel").css("display", "none");
            // $("#Items_wizard").css("display", "block");
            //$("#itemLabels")[0].innerText = "Groups information";
            // $("#wizard_confirmtab").css({ "display": "none", "opacity": "0" });
            // $("#wizard_itemstab").css({ "display": "block", "opacity": "1" });
        }
        $("#uploadItems").click(function (evt) {
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
            if (regex.test($("#inputitemFile01").val().toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var validateditems = ["Web Map", "Feature Service", "Dashboard", "StoryMap", "Web Mapping Application", "Route Layer", "Web Experience", "Application"];
                        if ($("#inputitemFile01")[0].files[0].type != "application/json") {
                            JsonData = JSON.parse(csvjsonConverter(e.target.result, ",")); //csvjsonConverter(e.target.result,',');
                            for (var i = 0; i < JsonData.length; i++) {
                                if (validateditems.indexOf(JsonData[i].type) != -1) {
                                    if (typeof (JsonData[i].text) != "undefined" && typeof (JsonData[i].text) != "null") {
                                        var parseddata = JSON.parse(JsonData[i].text.replace(/""/g, '\"'));
                                        JsonData[i].text = JSON.stringify(parseddata);
                                    }
                                }
                                else {

                                    JsonData.splice(i, 1);
                                }

                            }
                        }
                        if ($("#inputitemFile01")[0].files[0].type == "application/json") {
                            JsonData = JSON.parse(e.target.result);
                            for (var i = 0; i < JsonData.length; i++) {
                                if (typeof (JsonData[i].text) != "undefined" && typeof (JsonData[i].text) != "null") {
                                    var stringifydata = JSON.stringify(JsonData[i].text);
                                    JsonData[i].text = stringifydata;
                                }
                            }
                        }
                        Actiontype = "Importitems";
                        var validStr = [];
                        var requiredfields = ['title', 'access', 'type', 'url', 'name'];
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
                        var available_FS = [];
                        for (var m = 0; m < ItemList.length; m++) {// getting available feature services names
                            if (ItemList[m].type == 'Feature Service') {
                                available_FS.push(ItemList[m].title);
                            }
                        }
                        var filterarr = []; var str = [];
                        for (var i = 0; i < JsonData.length; i++) {
                            if (JsonData[i].type == 'Feature Service') {
                                if (available_FS.indexOf(JsonData[i].title) == -1)
                                    filterarr.push(JsonData[i]);
                                else
                                    str.push(JsonData[i].title);
                            }
                            else {
                                filterarr.push(JsonData[i]);
                            }
                        }

                        if (str.length != 0) {
                            AlertMessages("Import items", str.join(',') + " are already existing", "warning");
                            if (str.length == JsonData.length) {
                                $(".closeModal").click();
                                return;
                            }
                        }
                        JsonData = filterarr;
                        breadcrum_Label("Imported items list");
                        GetimportedItemsList(JsonData);

                        $(".closeModal").click();
                        temdata = JsonData;
                        $(".wizard_header")[0].innerText = "Imported items list"
                    }
                    reader.readAsText($("#inputitemFile01")[0].files[0]);
                } else {
                    AlertMessages("", "This browser does not support HTML5.", "danger");
                }
            } else {
                AlertMessages("File Upload", "Please upload a valid CSV or JSON file.", "danger");
            }
        });
        $("#Delete_items").click(function () { // delete selected items

            if (selectedItems.length == 0) {
                AlertMessages("Delete Items", "Please select atleat one item", "warning");
                return;
            }
            Actiontype = 'Deleteitem';

            const swalWithBootstrapButtons = swal.mixin({
                confirmButtonClass: 'btn btn-success mb-2',
                cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                buttonsStyling: false,
            });
            errcount = 0;
            swalWithBootstrapButtons({
                title: 'Delete Items',
                text: "Do you want to delete selected items?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No!',
                reverseButtons: true
            }).then(function (result) {
                if (result.value) {
                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/deleteItems";
                    var queryParams = {
                        force: true,
                        items: selectedItems.join(","),
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: queryParams,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_Item(options);

                } else if (
                    // Read more about handling dismissals
                    result.dismiss === swal.DismissReason.cancel
                ) {
                    Actiontype = '';
                }
            });







            //$.notify({
            //    title: 'Delete Item',
            //    message: 'Do you want to delete selected Items'
            //}, {
            //    placement: {
            //        align: 'center'
            //    },
            //    type: 'pastel-info',
            //    delay: 0,
            //    template: '<div data-notify="container" id="displayPopup" style="background-color:#ffeeba !important;" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
            //        '<span data-notify="message">{2}</span>' + '</br>' + '</br>' +
            //        '<button type="button" id="deleteConfirm" class="btn btn-success">Ok</button>' + ' ' +
            //        '<button type="button" id="CancelDelete" class="btn btn-danger">Cancel</button>' +
            //        '</div>'
            //});

            //$("#deleteConfirm").click(function () {
            //    url = `${Config.portalUrl}/sharing/rest/content/users/` + sesstionItem.username + "/deleteItems";
            //    var queryParams = {
            //        force: true,
            //        items: selectedItems.join(","),
            //        f: "json",
            //        token: portalToken
            //    };
            //    var options = {
            //        query: queryParams,
            //        responseType: "json",
            //        method: "post"
            //    };
            //    EsriRequest_Item(options);


            //})
            //$("#CancelDelete").click(function () {
            //    Actiontype = '';
            //    $("#displayPopup").remove();
            //    return;
            //});
        });
        function updateSyncCapabilities(syncVal) {
            var DefData;
            var editTrackObj = {
                "enableEditorTracking": true,
                "enableOwnershipAccessControl": true,
                "allowOthersToUpdate": true,
                "allowOthersToDelete": false
            }

            if (syncVal == "enable")
                DefData = { "editorTrackingInfo": editTrackObj, "hasStaticData": false };
            else {
                DefData = {
                    "editorTrackingInfo": editTrackObj, "hasStaticData": false,
                    "capabilities": "Create,Delete,Query,Update,Editing"
                };
            }
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (ItemList[j].id == selectedItems[i] && ItemList[j].type == "Feature Service")
                        var servcieUrl = ItemList[j].url;
                }
                url = servcieUrl + '/updateDefinition';
                url = url.replace("/rest/services/", "/rest/admin/services/");
                updateOptions = {
                    updateDefinition: JSON.stringify(DefData),
                    token: portalToken,
                    f: "json",
                    responseType: "json",
                    method: "post"
                };
                //var options = {
                //    query: updateOptions,
                //    responseType: "json",
                //    method: "post"
                //};
                AjaxRequest(url, updateOptions, "POST", "Update sync capabilities")
                //EsriRequest_Item(options);
            }
        }
        function LoadTagsCheckbox() {  // load click event for add checkbox
            $(".getselecteditems").addClass("disbaleClass");
            $(".sel_Alltags").click(function () {  // check or uncheck all tags checkbox
                $('#selected_items').empty();
                selectedItemsList = [];
                if ($(".sel_Alltags :checkbox")[0].checked) {
                    $('.sel_tags :checkbox').not(this).prop('checked', true);
                    $(".sel_tags input:checkbox:checked").each(function () {
                        if (selectedItemsList.indexOf($(this).val()) == -1)
                            selectedItemsList.push($(this).val());
                    });
                }
                else {
                    $('.sel_tags input:checkbox').not(this).prop('checked', false);
                    selectedItemsList = [];
                }
                if (selectedItemsList.length == 0) {
                    $(".getselecteditems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselecteditems").removeClass("disbaleClass");
                    // validate remove tags
                    if (Actiontype == "RemoveTags") {
                        var RemovalFlag = validateTagsRemoval();
                        if (!RemovalFlag) {
                            $(".getselecteditems").addClass("disbaleClass");
                            return;
                        }
                    }
                }
            })
            $(".sel_tags :checkbox").on('click', function (evt) {  // check or uncheck  tags checkbox
                $('#selected_items').empty();
                if (evt.currentTarget.checked) {
                    if (selectedItemsList.indexOf(evt.currentTarget.value) == -1)
                        selectedItemsList.push(evt.currentTarget.value);
                }
                else {
                    var removeItem = evt.currentTarget.value;
                    selectedItemsList = jQuery.grep(selectedItemsList, function (value) {
                        return value != removeItem;
                    });
                }
                if ($(".sel_tags :checkbox").length != $(".sel_tags input:checked")) {
                    $(".sel_Alltags :checkbox")[0].checked = false;
                }
                if (selectedItemsList.length == 0) {
                    $(".getselecteditems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselecteditems").removeClass("disbaleClass");
                    if (Actiontype == "RemoveTags") {
                        var RemovalFlag = validateTagsRemoval();
                        if (!RemovalFlag) {
                            $(".getselecteditems").addClass("disbaleClass");
                            return;
                        }
                    }
                }

            })

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
                for (var k = 0; k < ItemList.length; k++) {
                    if (selectedItems[i] == ItemList[k].id) {
                        var tagcount = 0;
                        for (var m = 0; m < tags.length; m++) {
                            if (ItemList[k].tags.indexOf(tags[m]) != -1) {
                                tagcount++;
                            }
                        }
                        if (tagcount == ItemList[k].tags.length) {
                            ErrList.push(ItemList[k].title);
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
        function EsriRequest_GroupItem(options) {
            esriRequest(url, options)
                .then(function (response) {
                    count++;
                    url = "";
                    $("#Itemgroupinfo").empty();
                    $(".cleargroupsinfo").css("display", "block");

                    if (response.data.admin.length > 0) {
                        var headerspan = '<h4 style:"text-align:center">Group Information</h6>';
                        // var table = '<table style="border: 1px solid black" class=table table-bordered><tr><th>Titles</th><th>Access</th><th>Description</th><th>Owner</th><tr>'
                        var table = '<table class="table table-hover mt-0" ><thead class="bg-light p-0"><tr><th scope="col" style="width: 30%">Title</th><th scope="col" style="width: 30%">Access</th><th scope="col" style="width: 30%">Description</th><th scope="col" style="width: 30%">Owner</th><tr></thead>'
                        var trRow = '';
                        for (var i = 0; i < response.data.admin.length; i++) {

                            trRow = trRow + '<tr>' +
                                '<td class="text-dark">' + response.data.admin[i].title + '</td>' +
                                '<td>' + response.data.admin[i].access + '</td>' +
                                '<td>' + response.data.admin[i].description + '</td>' +
                                '<td>' + response.data.admin[i].owner + '</td>' +
                                '</tr >';

                        }
                        table = table + '<tbody>' + trRow + '</tbody></table>'
                        $("#Itemgroupinfo").append(table);
                        $("#MainCard").hide();
                        $("#GroupInfo").show();
                        breadcrum_Label("Groups Information");

                    }
                    else {
                        AlertMessages("Item groups", "No groups are found", "warning");
                        $("#EditItem").hide();
                        $("#MainCard").show();
                        $("#GroupInfo").hide();
                        return
                    }

                })
        }
        $(".cleargroupsinfo").click(function () {
            $("#groupinfo").empty();
            $(".cleargroupsinfo").css("display", "none");
        })
        function EsriRequest_Item(options) {
            esriRequest(url, options)
                .then(function (response) {
                    count++;
                    url = "";
                    if (Actiontype == "AddLayerstoWebmap") {
                        if (count == selectedItems.length) {
                            AlertMessages("Add Layers to Webamap", "Successfully added layers", "success");
                        }
                    }
                    if (Actiontype == "ViewItems") {

                        AlertMessages("Update Items", "Successfully updated item", "success");

                    }
                    if (Actiontype == "iteminfo") {
                        $("#groupIteminfo").empty();
                        $(".cleargroupsinfo").css("display", "block");
                        if (response.data.items.length > 0) {
                            var items = response.data.items;
                            var headerspan = '<h4 style:"text-align:center">Item Information</h6>';
                            var table = '<table style="border: 1px solid black" class=table table-bordered><tr><th>Titles</th><th>Access</th><th>Description</th><th>Owner</th><th>url</th><th>Type</th><tr>'
                            var trRow = '';
                            for (var i = 0; i < items.length; i++) {

                                trRow = trRow + '<tr>' +
                                    '<td>' + items[i].title + '</td>' +
                                    '<td>' + items[i].access + '</td>' +
                                    '<td>' + items[i].description + '</td>' +
                                    '<td>' + items[i].owner + '</td>' +
                                    '<td><span>' + items[i].url + '</span></td>' +
                                    '<td>' + items[i].type + '</td>' +
                                    '</tr >';

                            }
                            table = table + trRow + '</table>'
                            $("#groupIteminfo").append(headerspan).append(table);
                        }
                        else {
                            $("#groupIteminfo").append("<span>No item are found</span>");
                        }
                    }
                    if (Actiontype == "AddTags") {
                        _TagsList = response.data.tags;
                        CheckBoxController(_TagsList, "AddTags");
                        //var checkboxNode = '<div class="row sel_Alltags"><span class="" style="display: block; margin: 0 auto;"> <input type=checkbox class="form-check-input selectallTags"/> Select All</span></div><br/>';
                        //var subCheckboxNode = '<div class="row sel_tags">';
                        //for (var i = 0; i < TagsList.length; i++) {
                        //    subCheckboxNode = subCheckboxNode + '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectTags" value= "' + TagsList[i].tag + '"/> <a title=' + TagsList[i].tag + "> <span class=contOverflow>" + TagsList[i].tag + '</span></a></span><br/>'
                        //}
                        //subCheckboxNode = subCheckboxNode + "</div>";
                        //$("#items-control").empty();
                        //var btn = '<div class="tagsSec col-md-12"><div class="form-row d-flex justify-content-end my-5"><input type="text" class="Tagcontent form-control col-md-4 mr-1"/><button id="BtnAdd" class="addTagbtn btn btn-primary">Add tag</button></div></div>';//'<input type="button" value="Add" id="BtnAdd" style="width: 70px;background-color: #c1b7ab;">'
                        //$("#items-control").append(btn).append(checkboxNode).append(subCheckboxNode);
                        //// $("#items-control").append(checkboxNode).append(subCheckboxNode);
                        //$("#itemTableDiv").css("display", "none");
                        //$("#Items_wizard").css("display", "block");
                        //$(".Item_ActionPanel").css("display", "none");
                        //$(".wizard_header")[0].innerText = "Add Tags to Items";
                        //LoadTagsCheckbox();
                        //$("#BtnAdd").click(function (evt) {
                        //    evt.preventDefault();
                        //    var newTagtext = $(".Tagcontent").val();

                        //    var isTagexists = false;
                        //    $(".sel_tags .selectTags").each(function () {
                        //        if ($(this).val().toUpperCase() == newTagtext.toUpperCase()) {
                        //            AlertMessages("Add tags", $(".Tagcontent")[0].value + " tag already exists", "warning");
                        //            isTagexists = true;
                        //            return;
                        //        }
                        //    });
                        //    if (isTagexists)
                        //        return;

                        //    //tempdata.push({ "tag": newTagtext });


                        //    $("#items-control .sel_tags").append('<span class="col-sm-4"><input type="checkbox" class="form-check-input selectTags" value= "' + newTagtext + '"/>' + newTagtext + '</span><br/>');
                        //    //$(".getselecteditems").removeClass("disbaleClass");
                        //    LoadTagsCheckbox();
                        //    AlertMessages("Add tags", $(".Tagcontent")[0].value + " tag added to below list", "success");
                        //    $(".Tagcontent")[0].value = '';

                        //});
                        //HidetoggleItemsTable();
                        Actiontype = 'AddTagstoItems';
                        $(".items_radbtn").css("display", "block")
                        return
                    }
                    if (Actiontype == 'Deleteitem') {
                        var Deleteresponse = response.data.results;
                        var failed = ''; var success = false;
                        for (var i = 0; i < Deleteresponse.length; i++) {
                            if (Deleteresponse[i].success) {
                                success = true;
                            }
                            else {
                                for (var j = 0; j < ItemList.length; j++) {
                                    if (Deleteresponse[i].itemId == ItemList[j].id) {
                                        failed = failed + ItemList[j].title + ",";
                                        break;
                                    }
                                }
                                ;
                            }
                        }
                        if (success) {
                            AlertMessages("Delete Item", "Item deleted successfully", "success");
                        }
                        if (failed) {
                            failed = failed.replace(/,\s*$/, "");
                            AlertMessages("Delete Item", "Unable to delete " + failed + " items", "danger");

                        }
                        $("#displayPopup").remove();
                        fetchAllItems(portalToken);

                    }
                    if (Actiontype == 'MoveItems') {

                        var res = response.data.results;
                        var failed = [];
                        for (var i = 0; i < res.length; i++) {
                            if (res[i].success) {

                            }
                            else {
                                for (var j = 0; j < ItemList.length; j++) {
                                    if (ItemList[j].id == res[i].itemId) {
                                        failed.push(ItemList[i].title);
                                        break;
                                    }
                                }
                            }
                        }

                        if (failed.length == 0) {
                            AlertMessages("Move Item", "successfully moved Items", "success");
                            showSuccessDiv();
                            $(".success_msg")[0].innerText = "Successfully updated items";
                        }
                        else {
                            if (failed.length != selectedItems.length) {
                                AlertMessages("Move Item", "successfully moved Items with errors", "success");
                                // AlertMessages("Move Item", "failed to move items " + failed.join(","), "danger");
                                $(".failure_msg")[0].innerText = "Failed to move items " + failed.join(",");
                                showSuccessDiv();
                            }
                            else {
                                $(".failure_msg")[0].innerText = "Failed to move items " + failed.join(",");
                                showfailuredivDiv();
                            }
                        }


                    }
                    if (Actiontype == 'UpdateSync') {
                        if (count == selectedItems.length) {
                            showSuccessDiv();
                            AlertMessages("Update Sync Capabilities", "Items sync capabilities updated successfully", "success");
                        }
                    }
                    if (Actiontype == 'sharing') {
                        setTimeout(function () {
                            $("#items-control").empty();
                            ItemList = [];
                            ItemParams.start = 1;
                            fetchAllItems(portalToken);
                            AlertMessages("Update Item", "Items updated successfully", "success");
                        }, 100)

                    }
                    if (Actiontype == 'edit') {
                        Actiontype = 'sharing';
                        $(".lds-ring").css("display", "block");
                        shareItems(response.data.id);
                        // fetchAllItems(portalToken);
                    }

                    if (Actiontype == 'ShareItemstoGroups') {
                        if (response.data.notSharedWith.length != 0) {
                            Errlist.push(response.data);
                        }
                        if (count == selectedItems.length) {
                            if (Errlist.length == 0) {
                                AlertMessages("Share Item", "Items shared with groups successfully", "success");
                                showSuccessDiv();
                            }
                            else {
                                if (Errlist.length == selectedItems.length) {
                                    //AlertMessages("Share Item", "Failed to share items with groups", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to share items with groups";
                                    showfailuredivDiv();
                                }
                                else {
                                    AlertMessages("Share Item", "Items shared with groups successfully with errors", "success");
                                    showSuccessDiv();
                                }
                            }


                        }
                    }
                    if (Actiontype == 'UnshareItemsfromGroups') {
                        if (response.data.notUnsharedFrom.length != 0) {
                            Errlist.push(response.data);
                        }
                        if (count == selectedItems.length) {
                            if (Errlist.length == 0) {
                                AlertMessages("Unshare Item", "Items unshared with groups successfully", "success");
                                showSuccessDiv();
                            }
                            else {
                                if (Errlist.length == selectedItems.length) {
                                    AlertMessages("Unshare Item", "Failed to unshare items with groups", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to unshare items with groups";
                                    showfailuredivDiv();
                                }
                                else {
                                    AlertMessages("Unshare Item", "Items unshared with groups successfully with errors", "success");
                                    showSuccessDiv();
                                }
                            }
                        }
                    }
                    if (Actiontype == 'AddTagstoItems') {
                        if (count == selectedItems.length) {
                            AlertMessages("Add Tags", "Tags added successfully", "success");
                            $(".items_radbtn").css("display", "none");
                            showSuccessDiv();
                        }
                    }
                    if (Actiontype == "RemoveTags") {
                        if (count == selectedItems.length) {
                            if (Errlist.length == 0) {
                                AlertMessages("Remove Tags", "Tags removed successfully", "success");
                                showSuccessDiv();
                            }
                            else {
                                if (Errlist.length == selectedItems.length) {
                                    showfailuredivDiv();
                                    AlertMessages("Remove Tags", "Failed to remove Tags", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to remove Tags";
                                }
                                else {
                                    AlertMessages("Remove Tags", "Tags removed with some errors", "success");
                                    if (Errlist.length != selectedItems.length) {
                                        AlertMessages("Remove Tags", "Failed to remove Tags for" + Errlist.join(","), "danger");
                                        $(".failure_msg")[0].innerText = "Failed to remove Tags for" + Errlist.join(",");
                                    }
                                    showSuccessDiv();
                                }
                            }

                        }
                    }
                    if (Actiontype == "AssignOwner") {
                        if (count == selectedItems.length) {
                            $(".success_msg")[0].innerText = "Successfully reassigned item owner";
                            AlertMessages("AssignOwner", "Successfully assigned owner", "success");
                        }
                    }
                    if (Actiontype == "Enable/disablepopup") {
                        if (!response.data.success) {
                            Errlist.push(response.data.id)
                        }
                        if (count == selectedItems.length) {
                            if (Errlist.length != 0) {
                                if (Errlist.length == selectedItems.length) {
                                    showfailuredivDiv();
                                    AlertMessages("Enable/Disable Popup", "Failed to  update items", "danger");
                                    $(".failure_msg")[0].innerText = "Failed to  update items";
                                    return;
                                }
                                else {
                                    var str = [];
                                    for (var m = 0; m < ItemList.length; m++) {
                                        for (var n = 0; n < Errlist.length; n++) {
                                            if (ItemList[m].id == Errlist[n]) {
                                                str.push(ItemList[m].title);
                                                break;
                                            }
                                        }
                                    }
                                    $(".success_msg")[0].innerText = "Successfully updated items";
                                    AlertMessages("Enable/Disable Popup", "Successfully updated items with errors", "success");
                                    if (str.length > 0)
                                        AlertMessages("Enable/Disable Popup", "Failed to  update " + str.join(","), "danger");

                                    showSuccessDiv();
                                }
                            }
                            else {
                                $(".success_msg")[0].innerText = "Successfully updated items";
                                AlertMessages("Enable/Disable Popup", "Successfully updated items", "success");
                                showSuccessDiv();
                            }

                        }

                    }
                    if (Actiontype == "UpdateWebMapServices") {
                        showSuccessDiv();
                        $(".success_msg")[0].innerText = "Successfully updated items";
                        AlertMessages("Update Webmap services", "Successfully updated item", "success");
                    }
                    if (Actiontype == "BulkUpdate") {
                        if (count == selectedItemsList) {
                            showSuccessDiv();
                            $(".success_msg")[0].innerText = "Successfully updated items";
                            AlertMessages("Update Items", "Successfully updated item", "success");
                        }
                    }
                    if (Actiontype == "Importitems") {
                        if (count == selectedItemsList.length) {
                            showSuccessDiv();
                            $(".success_msg")[0].innerText = "Successfully imported items";
                            AlertMessages("Import Items", "Successfully imported items", "success");
                        }
                    }

                }).catch(function (err) {
                    count++
                    console.log(err);
                });

        };
        function shareItems(itemid) {
            url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/shareItems";
            var ShareOptions = {
                org: false,
                items: itemid,
                everyone: false,
                f: "json",
                token: portalToken
            };
            if ($("#Itemaccess")[0].value == "org") {
                ShareOptions.org = true;
                ShareOptions.everyone = false;
            }
            if ($("#Itemaccess")[0].value == "public") {
                ShareOptions.org = false;
                ShareOptions.everyone = true;
            }

            var option = {
                query: ShareOptions,
                responseType: "json",
                method: "post"
            };
            EsriRequest_Item(option);
        }
        $(".saveItems").click(function () {
            if (Actiontype == 'edit') {
                var itemOptions = {
                    title: $(".Item_Name")[0].value,
                    snippet: $(".item_summary")[0].value,
                    tags: $(".Item_Tags")[0].value,
                    access: $("#Itemaccess")[0].value,
                    description: $(".item_Desc")[0].value,
                    typeKeywords: $(".Item_keywords")[0].value,
                    categories: $(".Item_categories")[0].value,
                    f: "json",
                    token: portalToken

                };
                var options = {
                    query: itemOptions,
                    responseType: "json",
                    method: "post"
                };
                $(".lds-ring").css("display", "block");
                EsriRequest_Item(options);
                $(".close").click();
                $(".breadcrumb_Home").click();
                // $("#Item_content").css("display", "none")
                // $("#itemTableDiv").css("display", "block");
                // $("#itemGallery").css("display", "none");
                // $(".Item_ActionPanel").css("display", "block");
            }

        })

        $("#cancelitem").click(function () {
            // $("#Item_content").css("display", "none");
            //$("#itemTableDiv").css("display", "block");
            //$("#itemGallery").css("display", "none");
            //$(".Item_ActionPanel").css("display", "block");
            //$("#Updateitem").css("display", "block");
            //var childElements = $("#itemsForm .form-control");
            //for (var i = 0; i < childElements.length; i++) {
            //    $(childElements[i]).prop('disabled', false);
            //}


        });

        function getItemInformation(itemid) {
            if (Actiontype == "edit" || Actiontype == "view") {
                for (var i = 0; i < ItemList.length; i++) {
                    if (itemid == ItemList[i].id) {
                        $(".Item_Name")[0].value = ItemList[i].title;
                        $(".item_summary")[0].value = ItemList[i].snippet;
                        $(".item_Desc")[0].value = ItemList[i].description;
                        var tags = ItemList[i].tags;
                        $.each(tags, function (index, value) {
                            $('.Item_Tags').tagsinput('add', value);
                            console.log(value);
                        });
                        $("#Itemaccess")[0].value = ItemList[i].access;
                        $(".Item_keywords")[0].value = ItemList[i].typeKeywords;
                        $(".Item_categories")[0].value = ItemList[i].categories;
                        break
                    }
                }

            }
            if (Actiontype == "AddTags") {
                url = Config.portalUrl + "/sharing/rest/community/users/" + itemid + "/tags";
                var queryParams = {
                    f: "json",
                    token: portalToken
                };
                var options = {
                    query: queryParams,
                    responseType: "json"

                };
                EsriRequest_Item(options)
            }
        }

        function createGallery(items) {
            var htmlFragment = "";
            ItemList = items;
            var itemsData = [];
            $("#grdItems").empty();
            items.forEach(function (item) {
                if (item.thumbnail == null || item.thumbnail == undefined) {
                    var thumbnailUrl = "../Images/thumbnail2.png";
                }
                else {
                    var thumbnailUrl = sesstionItem.portalurl + "/sharing/rest/content/items/" + item.id + "/info/" + item.thumbnail + "?token=" + sesstionItem.token;
                }
                var itemclassName = "badge-success";
                if (item.access == "private")
                    itemclassName = "badge-secondary";
                if (item.access == "shared")
                    itemclassName = "badge-warning";
                if (item.access == "org")
                    itemclassName = "badge-primary";
                var itemDescription = item.description;
                if (itemDescription == null)
                    itemDescription = "";
                if (itemDescription.length > 50)
                    itemDescription = itemDescription.substring(0, 50) + "...";

                htmlFragment += '<div class="col-md-4 col-12">' +
                    '<div class="card dt-intro-card image-checkbox Card_list">' +
                    '<div class="OverLay"></div>' +
                    '<input type="checkbox" name="image[]" value="' + item.id + '" />' +
                    '<i class="fa fa-check hidden fa-2x"></i>' +
                    '<div class="card-image">' +
                    '<img class="img-fluid" src=' + thumbnailUrl + ' alt="Mila"></div>' +
                    '<div class="card-stacked"><div class="card-body py-3 pr-7 pl-3">' +
                    '<h4 class="d-inline-block mr-1 mb-0 title_list" title="' + item.title + '">' + item.title + '</h4>' +
                    '<span class="badge ' + itemclassName + ' p-1 mb-3">' + item.access + '</span>' +
                    '<span class="d-block small mb-0 font-weight-300">Type</span>' +
                    '<span class="d-block f-12 font-weight-400 text-dark mb-1">' + item.type + '</span>' +
                    '<span class="d-block small mb-0 font-weight-300">Description</span>' +
                    '<span class="d-block f-12 font-weight-400 text-dark mb-3 description_list" title= "' + item.description + '">' + itemDescription + '</span>' +
                    '<div class="d-inline"><span class="small pull-left font-weight-200">' + new Date(item.created).toLocaleDateString() + '</span> <span class="small pull-right font-weight-200">' + new Date(item.modified).toLocaleDateString() + '</span>' +
                    '</div></div></div></div></div>'

                var itemObj = {
                    Itemid: item.id,
                    ItemName: item.title,
                    thumbnailUrl: item.thumbnail,
                    ItemType: item.type,
                    Access: item.access,
                    Description: item.description,
                    Summary: item.snippet,
                    Owner: item.owner,
                    Protected: item.protected,
                    Tags: item.tags,
                    TypeWords: item.typeKeywords,
                    Url: item.url,
                    AppCategories: item.appCategories,
                    IsOrgitem: item.isOrgItem,
                    Culture: item.culture,
                    Industries: item.industries,
                    Languages: item.languages,
                    Listed: item.listed,
                    AccessInformation: item.accessInformation,
                    Averagerating: item.avgRating,
                    NumberofComments: item.numComments,
                    Numberofviews: item.numViews,
                    Properties: item.properties,
                    CreatedDate: item.created,
                    ModifiedDate: item.modified
                };
                itemsData.push(itemObj);
            });
            document.getElementById("itemGallery").innerHTML = '<div class="row">' + htmlFragment + ' </div>';
            var DateField = function (config) {
                jsGrid.Field.call(this, config);
            };
            $(".image-checkbox").each(function () {
                if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
                    $(this).addClass('image-checkbox-checked');
                }
                else {
                    $(this).removeClass('image-checkbox-checked');
                }
            });
            // sync the state to the input
            $(".image-checkbox").on("click", function (e) {
                $(this).toggleClass('image-checkbox-checked');
                var $checkbox = $(this).find('input[type="checkbox"]');
                $(this).find('.OverLay').toggle();
                $checkbox.prop("checked", !$checkbox.prop("checked"));
                var Itemid = $checkbox[0].value;
                if ($checkbox.prop("checked")) {
                    selectedItems.push(Itemid);
                }
                else {
                    selectedItems = $.grep(selectedItems, function (i) {
                        return i !== Itemid;
                    });
                }
                e.preventDefault();
            });
            $(this).find('i').toggleClass('fa-th-list fa-th')

            DateField.prototype = new jsGrid.Field({
                filterTemplate: function () {
                    var now = new Date();
                    this._fromPicker = $("<input>").datepicker({ dateFormat: "dd/mm/yy", changeMonth: true, changeYear: true, defaultDate: now }).attr('placeholder', 'Select Date');

                    return $("<div>").append(this._fromPicker);
                }, filterValue: function () {
                    return {
                        from: this._fromPicker.datepicker("getDate"),

                    };
                }
            });
            //jsGrid.fields.date = DateField;
            selectedItems = [];
            var selectItem = function (item) {
                $(".cleargroupsinfo").click();
                selectedItems.push(item);
                if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                    $("#selectAllCheckbox").prop("checked", true);
                } else {
                    $("#selectAllCheckbox").prop("checked", false);
                }
            };
            var unselectItem = function (item) {
                $(".cleargroupsinfo").click();
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
            jsGrid.fields.date = DateField;
            $("#grdItems").jsGrid({
                width: "100%",
                height: 'auto',
                filtering: true,
                inserting: false,
                editing: false,
                sorting: true,
                paging: true,
                autoload: true,
                pageSize: $("#pageSize").val(),
                data: itemsData,
                controller: {
                    data: itemsData,
                    loadData: function (filter) {
                        // if ($('#search').val() == "") {
                        $('#Itemsjson').css("display", "none");
                        selectedItems = [];
                        $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                        $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                        if (searchflag == false) {

                            $('#search').val("");
                            return $.grep(this.data, function (item) {
                                if (item.Description == null) {
                                    item.Description = "";

                                }
                                if (item.Summary == null) {
                                    item.Summary = "";

                                }
                                if (item.Protected == undefined) {
                                    item.Protected = "";
                                }
                                if (item.Url == undefined) {
                                    item.Url = "";
                                }
                                if (item.IsOrgitem == undefined) {
                                    item.IsOrgitem = ""
                                } if (item.Culture == null) {
                                    item.Culture = ""
                                }
                                if (filter.Listed == "true") {
                                    filter.Listed = true;

                                }
                                if (filter.Listed == "false") {
                                    filter.Listed = false;
                                }
                                return ((!filter.ItemName || item.ItemName.toUpperCase().indexOf(filter.ItemName.toUpperCase()) >= 0)
                                    && (!filter.ItemType || item.ItemType.toUpperCase().indexOf(filter.ItemType.toUpperCase()) >= 0)
                                    && (!filter.Role || item.Role.toUpperCase().indexOf(filter.Role.toUpperCase()) >= 0)
                                    && (!filter.Access || item.Access.toUpperCase().indexOf(filter.Access.toUpperCase()) >= 0)
                                    && (!filter.Owner || item.Owner.toUpperCase().indexOf(filter.Owner.toUpperCase()) >= 0)
                                    && (!filter.CreatedDate.from || new Date(item.CreatedDate).toDateString() == filter.CreatedDate.from.toDateString())
                                    && (!filter.ModifiedDate.from || new Date(item.ModifiedDate).toDateString() == filter.ModifiedDate.from.toDateString())
                                    //&& (!filter.Tags || item.Tags.map(value => value.toLowerCase()).includes(filter.Tags) == true)
                                    && (!filter.Tags || item.Tags.toString().toUpperCase().indexOf(filter.Tags.toUpperCase()) >= 0)
                                    && (!filter.Description || item.Description.toUpperCase().indexOf(filter.Description.toUpperCase()) >= 0)
                                    && (!filter.Summary || item.Summary.toUpperCase().indexOf(filter.Summary.toUpperCase()) >= 0)
                                    && (!filter.Protected || item.Protected.toUpperCase().indexOf(filter.Protected.toUpperCase()) >= 0)
                                    //&& (!filter.TypeWords || item.TypeWords.map(value => value.toLowerCase()).includes(filter.TypeWords) == true)
                                    && (!filter.TypeWords || item.TypeWords.toString().toUpperCase().indexOf(filter.TypeWords.toUpperCase()) >= 0)
                                    && (!filter.Url || item.Url.toUpperCase().indexOf(filter.Url.toUpperCase()) >= 0)
                                    // && (!filter.AppCategories || item.AppCategories.map(value => value.toLowerCase()).includes(filter.AppCategories) == true)
                                    && (!filter.AppCategories || item.AppCategories.toString().toUpperCase().indexOf(filter.AppCategories.toUpperCase()) >= 0)
                                    && (!filter.IsOrgitem || item.IsOrgitem.toUpperCase().indexOf(filter.IsOrgitem.toUpperCase()) >= 0)
                                    && (!filter.Culture || item.Culture.toUpperCase().indexOf(filter.Culture.toUpperCase()) >= 0)
                                    //&& (!filter.Industries || item.Industries.map(value => value.toLowerCase()).includes(filter.Industries) == true)
                                    && (!filter.Industries || item.Industries.toString().toUpperCase().indexOf(filter.Industries.toUpperCase()) >= 0)
                                    //&& (!filter.Languages || item.Languages.map(value => value.toLowerCase()).includes(filter.Languages) == true)
                                    && (!filter.Languages || item.Languages.toString().toUpperCase().indexOf(filter.Languages.toUpperCase()) >= 0)
                                    && (!filter.Listed || item.Listed == filter.Listed)
                                    && (!filter.AccessInformation || item.AccessInformation.toUpperCase().indexOf(filter.AccessInformation.toUpperCase()) >= 0)
                                    && (!filter.Numberofviews || item.Numberofviews == parseInt(filter.Numberofviews))
                                    && (!filter.Averagerating || item.Averagerating == parseInt(filter.Numberofviews))
                                    && (!filter.NumberofComments || item.NumberofComments == parseInt(filter.Numberofviews))
                                    && (!filter.Properties || item.Properties == parseInt(filter.Properties))
                                );
                            });
                        } else {
                            searchflag = false;
                            return $.grep(this.data, function (item) {
                                return ((!filter.ItemName || item.ItemName.toUpperCase().indexOf(filter.ItemName.toUpperCase()) >= 0)
                                    || (!filter.ItemType || item.ItemType.toUpperCase().indexOf(filter.ItemType.toUpperCase()) >= 0)
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
                        visible: true, width: 30,
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
                            //var thumbnailUrl = sesstionItem.portalurl + "/sharing/rest/content/items/" + item.Itemid + "/info/" + item.thumbnailUrl + "?token=" + sesstionItem.token;

                            var checkboxnode = $("<input>").attr("type", "checkbox").attr("id", item.Itemid).attr({ class: "singleCheckbox mr-2" })
                                .prop("checked", $.inArray(item.firstName, selectedItems) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                            //if (item.thumbnailUrl != null)
                            //    var imagenode = $("<img>").attr("src", thumbnailUrl).attr("class", "dt-avatar mb-0 size-60");
                            //else
                            //    var imagenode = $("<img>").attr("class", "esri-null-image");

                            return $("<span>").append(checkboxnode);//.append(imagenode);
                        },
                        align: "center",
                        sorting: false
                    },
                    {
                        width: 50,
                        itemTemplate: function (_, item) {
                            var thumbnailUrl = sesstionItem.portalurl + "/sharing/rest/content/items/" + item.Itemid + "/info/" + item.thumbnailUrl + "?token=" + sesstionItem.token;

                            if (item.thumbnailUrl != null)
                                var imagenode = $("<img>").attr("src", thumbnailUrl).attr("class", "dt-avatar mb-0 size-30");
                            else
                                var imagenode = $("<img>").attr("class", "esri-null-image");

                            return $("<span>").append(imagenode);
                        },
                        align: "center",
                        sorting: false
                    },
                    {
                        name: "ItemName", title: "Title", type: "text", align: "left", visible: true,
                        itemTemplate: function (_, item) {
                            var $customInfoButton = $("<a>").attr("class", "attrClass").attr("title", item.ItemName).text(item.ItemName)
                                .click(function (e) {
                                    Actiontype = "view";
                                    $(".cleargroupsinfo").click();
                                    getItemInformation(item.Itemid);
                                    $(".Item_label")[0].innerText = "Item information";
                                    breadcrum_Label("Item information");
                                    $("#EditItem").show();
                                    $("#MainCard").hide();
                                    $(".item_footer").css("display", "none");
                                    var childElements = $("#itemsForm .form-control");
                                    for (var i = 0; i < childElements.length; i++) {
                                        $(childElements[i]).prop('disabled', true);
                                    }

                                });

                            return $("<div>").append($customInfoButton);
                        }
                    },
                    {
                        name: "ItemType", title: "Type", type: "text", align: "left", visible: true, width: 150,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.ItemType).text(item.ItemType)
                        }
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
                    {
                        name: "Description", title: "Description", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {

                            return $("<a>").attr("class", "attrClass").attr("title", item.Description).text(item.Description)
                        }
                    },
                    {
                        name: "Summary", title: "Summary", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Summary).text(item.Summary)
                        }
                    },
                    { name: "Owner", title: "Owner", type: "text", align: "left", visible: true },
                    { name: "Protected", title: "Protected", type: "text", align: "left", visible: false },
                    {
                        name: "Tags", title: "Tags", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Tags).text(item.Tags)
                        }
                    },
                    {
                        name: "TypeWords", title: "TypeWords", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.TypeWords).text(item.TypeWords)
                        }
                    },
                    { name: "Url", title: "Url", type: "text", align: "left", visible: false },
                    {
                        name: "AppCategories", title: "App Categories", type: "text", align: "center", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.AppCategories).text(item.AppCategories)
                        }
                    },
                    { name: "IsOrgitem", title: "IsOrgitem", type: "text", align: "left", visible: false },
                    { name: "Culture", title: "Culture", type: "text", align: "left", visible: false },
                    {
                        name: "Industries", title: "Industries", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Industries).text(item.Industries)
                        }
                    },
                    { name: "Languages", title: "Languages", type: "text", align: "left", visible: false },
                    {

                        name: "Listed", type: "select", items: [{ name: "Select", id: "" }, { name: "True", id: "true" }, { name: "False", id: "false" }], valueField: "id", textField: "name", title: "Listed", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Listed).text(item.Listed)
                        }
                    },
                    {
                        name: "AccessInformation", title: "Access Information", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.AccessInformation).text(item.AccessInformation)
                        }
                    },
                    { name: "Averagerating", title: "Average rating", type: "text", align: "left", visible: false },
                    {
                        name: "NumberofComments", title: "Number of Comments", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.NumberofComments).text(item.NumberofComments)
                        }
                    },
                    { name: "Numberofviews", title: "Number of views", type: "text", align: "left", visible: false },
                    {
                        name: "Properties", title: "Properties", type: "text", align: "left", visible: false,
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Numberofviews).text(item.Numberofviews)
                        }
                    },
                    {
                        name: "CreatedDate", title: "Created Date", visible: true, type: "date", align: "center",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    },
                    {
                        name: "ModifiedDate", title: "Modified Date", visible: true, type: "date", align: "center",
                        itemTemplate: function (value) { return new Date(value).toLocaleDateString() }
                    },
                    {
                        type: "control", width: 120, visible: true,
                        editButton: false, deleteButton: false,

                        itemTemplate: function (value, item) {
                            var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                            var TargetUrl = sesstionItem.portalurl + "/home/item.html?id=" + item.Itemid;///+"&token="+portalToken;//   "https://spatial1090.maps.arcgis.com/home/group.html?id=249f51d0af914ab08efca5f614b8821c"
                            var $customviewButton = $("<a>").attr('href', TargetUrl).attr('target', '_blank').attr({ class: "ViewGroup fa fa-eye text-primary mr-2" }).attr({ title: "View Item" })
                                .click(function (e) {
                                    e.stopPropagation();
                                });
                            var $customEditButton = $("<a>").attr({ class: "EditGroup fa fa-edit text-primary mr-2" }).attr({ title: "Edit Item" })
                                .click(function (e) {
                                    Actiontype = "edit";
                                    $(".cleargroupsinfo").click();
                                    url = Config.portalUrl + "/sharing/rest/content/users/" + sesstionItem.username + "/items/" + item.Itemid + "/update";
                                    getItemInformation(item.Itemid);
                                    $(".bootstrap-tagsinput .tag").addClass("badge badge-primary");
                                    $(".bootstrap-tagsinput .tag").removeClass("label label-info");
                                    $("#EditItem").show();
                                    $("#MainCard").hide();
                                    $(".item_footer").css("display", "");
                                    $(".Item_label")[0].innerText = "Edit Item";
                                    breadcrum_Label("Edit Item");
                                    e.stopPropagation();
                                });
                            var $viewItemjson = $("<a>").attr({ class: "EditGroup fa fa-clipboard text-primary mr-2" }).attr({ title: "View ItemJson" })
                                .click(function (e) {
                                    Actiontype = "ViewItemsJson";
                                    ActionType1 = 'edited';
                                    ActionType2 = 'edited'
                                    edit2Count = 0; edit1Count = 0;
                                    _viewitems(item.Itemid);
                                    // $("#Itemsjson").show();
                                    $("#MainCard").hide();
                                    $("#Itemsjson").css("display", "block");
                                    $(".Item_label")[0].innerText = "Edit Item";
                                    //breadcrum_Label("Edit Item");
                                    e.stopPropagation();
                                });
                            var $customItemInfoButton = $("<a>").attr({ class: "GroupItems fa fa-sitemap text-primary mr-2" }).attr({ title: "Item Groups" })
                                .click(function (e) {
                                    Actiontype = "iteminfo";
                                    url = Config.portalUrl + "/sharing/rest/content/items/" + item.Itemid + "/groups";
                                    $(".Groupinfo_title")[0].innerText = "Item Groups";
                                    var queryParams = {
                                        f: "json",
                                        token: portalToken
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json"
                                    };
                                    EsriRequest_GroupItem(options);
                                    $("#EditItem").hide();
                                    e.stopPropagation();
                                });
                            var $customItemDependenciesButton = $("<a>").attr({ class: "GroupUsers fa fa-link text-primary" }).attr({ title: "Item Dependencies" })
                                .click(function (e) {
                                    e.preventDefault();
                                    url = Config.portalUrl + "/sharing/rest/content/items/" + item.Itemid + "/dependencies";
                                    var queryParams = {
                                        f: "json",
                                        token: portalToken
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json"
                                    };
                                    $(".Groupinfo_title")[0].innerText = "Item dependencies";
                                    $("#Itemgroupinfo").empty();
                                    $(".breadcrumb_Home").click();
                                    // $(".cleargroupsinfo").css("display", "block");
                                    esriRequest(url, options).then(function (response) {
                                        $(".breadcrumb_Home").click();
                                        $("#groupinfo").empty();
                                        if (response.data.list.length > 0) {
                                            $("#Itemgroupinfo").empty();
                                            //var headerspan = '<h4 style:"text-align:center">Item Dependencies</h6>';
                                            var table = '<table class="table table-hover mt-0" ><thead class="bg-light p-0"><tr><th scope="col" style="width: 30%">Dependency Type</th><th scope="col" style="width: 30%">ID</th><tr></thead>'
                                            // var table = '<table style="border: 1px solid black" class=table table-bordered><tr><th>Dependency Type</th><th>ID</th><tr>'
                                            var trRow = '';
                                            for (var i = 0; i < response.data.list.length; i++) {
                                                trRow = trRow + '<tr>' +
                                                    '<td class="text-dark">' + response.data.list[i].dependencyType + '</td>' +
                                                    '<td>' + response.data.list[i].id + '</td>' +
                                                    '</tr >';
                                            }
                                            table = table + "<tbody>" + trRow + '</tbody></table>'
                                            $("#Itemgroupinfo").append(table);
                                            $("#MainCard").hide();
                                            $("#GroupInfo").show();
                                            breadcrum_Label("Item Dependencies");
                                        }
                                        else {
                                            AlertMessages("Item dependencies", "No dependencies are found", "warning");
                                            $("#MainCard").show();
                                            $("#GroupInfo").hide();
                                            return;
                                        }
                                    })
                                    e.stopPropagation();
                                });

                            return $("<div>").append($customviewButton).append($customEditButton).append($customItemInfoButton).append($viewItemjson).append($customItemDependenciesButton);
                        },
                        headerTemplate: function (e) {
                            return $("<span>")
                        }
                    }]
            });
            selectedItems = [];

            $("#item_colums_list").empty();
            //$("#grdItems .jsgrid-filter-row").css("display", "none");
            $("#grdItems .fas fa-filter").click(function () { // toggle the filter
                $("#grdItems .jsgrid-filter-row").toggle();
            });
            $("#search").keydown(function (event) {
                searchflag = true;
                var uname = $("#search").val();
                if (uname.length > 1) {
                    $("#grdItems").jsGrid("search", { ItemName: uname, ItemType: uname, Owner: uname, Access: uname }).done(function () { });
                }
                else {
                    $("#grdItems").jsGrid("clearFilter").done(function () { });
                }
            });
            createShowHideColumns("#grdItems", "#item_colums_list", "item_columns");
            $("#items .switch").css("display", "block");
            $(".item-list").click(function () {
                $(".item-gallery").toggle();
                $(".item-list").toggle();
                $("#itemGallery").toggle();
                $("#itemTableDiv").toggle();
                selectedItems = [];

            })
            $("#items .item-gallery").click(function () {
                $(".item-gallery").toggle();
                selectedItems = [];
                $(".item-list").toggle();
                $("#itemGallery").toggle();
                $("#itemTableDiv").toggle();
            })
            $("#pageSize").on('change', function (event) {
                $("#grdItems").jsGrid("option", "pageSize", this.value);
            });
            for (var m = 0; m < ItemList.length; m++) {
                loadItemsData(ItemList, m);
            }

            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
            // $("#item_colums_list input:checkbox").prop('checked', true)
        }
        // document.getElementById("ExportItemCsv").addEventListener("click", function () { //export items to csv
        $("#ExportItemCsv").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Export Items", "Please select atleast one item", "warning");
                return;
            }
            Actiontype = "ExportToCSV";
            breadcrum_Label("Export Items");
            $(".wizard_header")[0].innerText = "Export Items";
            CheckBoxController(ItemParameters, "ExportItems");
        });
        $("#ExportWebmapServices").click(function () {
            Actiontype = "ExportWebMapServices";
            $(".wizard_header")[0].innerText = "Export Webmaps services";
            var selectedWebMaps = [];
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id && ItemList[j].type == "Web Map") {
                        selectedWebMaps.push(ItemList[j]);
                        break;
                    }
                }
            }
            if (selectedWebMaps.length == 0) {
                AlertMessages("Export Webmap Services Url", "Please select atleast one webmap", "warning");
                return
            }

            selectedItemsList = [];
            var selectItem = function (item) {
                selectedItemsList.push(item);
                if ($(".getsubItems").length == $(".getsubItems:checked").length) {
                    $("#selectAllItemCheckbox").prop("checked", true);
                } else {
                    $("#selectAllItemCheckbox").prop("checked", false);
                }
                if (selectedItemsList.length == 0)
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
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
                    $(".getselecteditems").addClass("disbaleClass");
                else {
                    $(".getselecteditems").removeClass("disbaleClass");
                }
            };

            var webmapData = []
            for (var i = 0; i < selectedWebMaps.length; i++) {
                if (selectedWebMaps[i].Iteminfo != null || selectedWebMaps[i].Iteminfo != undefined) {
                    var OprLayers = selectedWebMaps[i].Iteminfo.operationalLayers;
                    for (var j = 0; j < OprLayers.length; j++) {
                        var itemObj = {
                            id: OprLayers[j].id,
                            LayerName: OprLayers[j].title,
                            Url: OprLayers[j].url,
                            Type: OprLayers[j].layerType,
                            Visibility: OprLayers[j].visibility,
                            WebMapName: selectedWebMaps[i].title
                        }
                        webmapData.push(itemObj);
                    }
                }

            }
            if (webmapData.length == 0) {
                AlertMessages("Export Webmap Services Url", "No layers are found", "warning");
                return
            }

            var fields = [
                {
                    name: "",
                    width: 60,
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
                        return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.LayerName)
                            .prop("checked", $.inArray(item.LayerName, selectedItemsList) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                            });
                    },
                    //itemTemplate: function (value, item) {
                    //    var chkbox = $("<input>").attr("value", item.LayerName).attr("type", "checkbox").attr("class", "getGroups");
                    //    return chkbox;
                    //},
                    sorting: false,
                    filtering: false,
                },
                { name: "LayerName", type: "text", title: "Layer Name" },
                { name: "Url", type: "text", title: "Service Url" },
                { name: "Type", type: "text", title: "Layer Type" },
                { name: "Visibility", type: "text", title: "Visibility" },
                { name: "WebMapName", type: "text", title: "WebMap" }
            ]
            breadcrum_Label("Export Webmaps services");
            loadportalGroups(webmapData, fields);
            HidetoggleItemsTable();
        })
        $(".updateWebmapItems").click(function () {
            Actiontype = "UpdateWebMapServices";
            $(".Item_label")[0].innerText = "Manage Webmap Service Urls";

            var selectedWebMaps = [];
            var Urldomains = [];
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id && ItemList[j].type == "Web Map") {
                        selectedWebMaps.push(ItemList[j]);
                        break;
                    }
                }
            }
            if (selectedWebMaps.length == 0) {
                AlertMessages("Export Webmap Services Url", "Please select atleast one webmap", "warning");
                return
            }
            $(".getselecteditems").addClass("disbaleClass");
            $("#items-control").empty();
            var isLayersExists = false;
            var node1 = "<div class='update_Webmap'>" +
                "<div class='form-group row'><label class='col-sm-4 mt-3'>Find Text</label><div class='col-sm-8'><input type='text' list='origServiceUrlList' class='form-control SearchContent' required /></div>" +
                "<datalist id='origServiceUrlList'><option value='https://mafpgisdev.maf.ae'>https://mafpgisdev.maf.ae</option><option value='https://cdn.arcgis.com'>https://cdn.arcgis.com</option></datalist>" +
                "</div > " +
                "<div class='form-group row'><label class='col-sm-4 mt-3'>Replace Text</label><div class='col-sm-8'><input type='text' class='form-control ReplaceContent' required /></div></div>" +
                "<div class='form-group row'><label class='col-sm-12' style='display:none'>Found <span class='Matchedtext' ></span> matches in webmap service urls</label></div>" +
                "<div class='text-center' ><button type='button' class='btn btn-sm btn-primary mr-2 findtext'>Find</button><button type='button' class='btn btn-sm btn-primary mr-2 replaceall'>Replace</button><button type='button' class='btn btn-sm btn-secondary clearall'>Clear</button></div>"
                + "</div><div class='clearfix'></div>"

            var itemnode = '';
            for (var i = 0; i < selectedWebMaps.length; i++) {
                var contentNode = "";
                contentNode = contentNode + "<hr/><div class='contentlist'><div  id= " + selectedWebMaps[i].id + "> <h4>" + selectedWebMaps[i].title + "</h4> </div><div>"
                itemnode = itemnode + contentNode;
                var oprLayers = selectedWebMaps[i].Iteminfo;
                if (oprLayers != null) {
                    if (typeof (oprLayers.operationalLayers) != "undefined") {
                        var oprContent = "<div class='operationlayers'><h6 class='badge bg-primary text-white text-uppercase mb-5'>Operation Layers</h6>";
                        if (oprLayers.operationalLayers.length != 0) {
                            isLayersExists = true;

                            for (var j = 0; j < oprLayers.operationalLayers.length; j++) {

                                if (oprLayers.operationalLayers[j].layerType == "VectorTileLayer") {

                                    var domainurl = oprLayers.operationalLayers[j].styleUrl.split("/");
                                    if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                        Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                    oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.operationalLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title=" + oprLayers.operationalLayers[j].styleUrl + " id= " + selectedWebMaps[i].id + "_" + oprLayers.operationalLayers[j].id + " value=" + oprLayers.operationalLayers[j].styleUrl + " name=" + oprLayers.operationalLayers[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly ></div></div>"

                                }
                                else {

                                    var domainurl = oprLayers.operationalLayers[j].url.split("/");
                                    if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                        Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                    oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.operationalLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title=" + oprLayers.operationalLayers[j].url + " id= " + selectedWebMaps[i].id + "_" + oprLayers.operationalLayers[j].id + " value=" + oprLayers.operationalLayers[j].url + " name=" + oprLayers.operationalLayers[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly ></div></div>"
                                }


                            }
                            oprContent = oprContent + "</div>";

                        }
                        else {
                            oprContent = oprContent + "<div>No operational layers are found</div></div>";
                        }
                        itemnode = itemnode + oprContent;
                    }
                    if (typeof (oprLayers.baseMap) != "undefined") {
                        var basemapContent = "<div class='basemapLayers'><h6  class='badge bg-primary text-white text-uppercase mb-5' >BaseMap Layers</h6>";
                        for (var j = 0; j < oprLayers.baseMap.baseMapLayers.length; j++) {

                            if (oprLayers.baseMap.baseMapLayers[j].layerType == "VectorTileLayer") {

                                var domainurl = oprLayers.baseMap.baseMapLayers[j].styleUrl.split("/");
                                if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                    Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + oprLayers.baseMap.baseMapLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' id= " + selectedWebMaps[i].id + "_" + oprLayers.baseMap.baseMapLayers[j].id + " value=" + oprLayers.baseMap.baseMapLayers[j].styleUrl + " name=" + oprLayers.baseMap.baseMapLayers[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly></div></div>"

                            }

                            else {
                                var domainurl = oprLayers.baseMap.baseMapLayers[j].url.split("/");
                                if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                    Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + oprLayers.baseMap.baseMapLayers[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' id= " + selectedWebMaps[i].id + "_" + oprLayers.baseMap.baseMapLayers[j].id + " value=" + oprLayers.baseMap.baseMapLayers[j].url + " name=" + oprLayers.baseMap.baseMapLayers[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly></div></div>"
                            }


                        }
                        basemapContent = basemapContent + "</div>";
                        itemnode = itemnode + basemapContent;
                    }
                    if (typeof (oprLayers.tables) != "undefined") {
                        var TableContent = "<div class='TableLayers'><h6 class='badge bg-primary text-white text-uppercase mb-5'>Tables</h6>";
                        if (oprLayers.tables.length != 0) {
                            for (var j = 0; j < oprLayers.tables.length; j++) {

                                if (oprLayers.tables[j].layerType == "VectorTileLayer") {
                                    var domainurl = oprLayers.tables[j].styleUrl.split("/");
                                    if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                        Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                    TableContent = TableContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.tables[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title= " + oprLayers.tables[j].styleUrl + " id= " + selectedWebMaps[i].id + "_" + oprLayers.tables[j].id + " value=" + oprLayers.tables[j].styleUrl + " name=" + oprLayers.tables[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly></div></div>"
                                }
                                else {
                                    var domainurl = oprLayers.tables[j].url.split("/");
                                    if (Urldomains.indexOf(domainurl[0] + "//" + domainurl[2]) == -1)
                                        Urldomains.push(domainurl[0] + "//" + domainurl[2])
                                    TableContent = TableContent + "<div class='form-group row'><label class='col-sm-4 mt-3'>" + oprLayers.tables[j].title + "</label><div class='col-sm-8'><input type='url' class='form-control' title= " + oprLayers.tables[j].url + " id= " + selectedWebMaps[i].id + "_" + oprLayers.tables[j].id + " value=" + oprLayers.tables[j].url + " name=" + oprLayers.tables[j].title.replace(/\s/g, '') + " webmapId=" + selectedWebMaps[i].id + " disabled readonly></div></div>"
                                }


                            }
                            TableContent = TableContent + "</div>";

                        }
                        else {
                            TableContent = TableContent + "<div>No tables are found</div></div>";
                        }
                        itemnode = itemnode + TableContent;
                    }
                }
                itemnode = itemnode + "</div>";
            }

            if (!isLayersExists) {
                AlertMessages("Update webmap services", "No layers are found in selected webmap", "warning");
                return;
            }


            $("#items-control").append(node1).append(itemnode);
            breadcrum_Label("Manage Webmap Service Urls")
            var opt = '';
            for (var i = 0; i < Urldomains.length; i++) {
                opt = opt + "<option value=" + Urldomains[i] + ">" + Urldomains[i] + "</option>";
            }
            selectedItemsList = [];
            $("#origServiceUrlList").empty().append(opt);
            $(".getselectedItem").addClass("disbaleClass");
            if (Urldomains.length == 0) {
                $(".operationlayers").empty(); $(".TableLayers").empty();
                $("#items-control").append("<span>No Layers found for replacing</span>");
                $(".getselectedItem").removeClass("disbaleClass");
                $(".Updated_content").css("display", "none");
                $(".update_Webmap button").prop("disabled", true);
            }
            $(".Matchedtext")[0].innerText = 0;
            HidetoggleItemsTable();
            $(".findtext").click(function () {
                var searchstring = $(".SearchContent")[0].value;
                if (searchstring == '') {
                    AlertMessages("Find text", "please enter text for searching", 'warning');
                    return;
                }
                var isStringExists = true;
                $(".contentlist input[type=url]").each(function (item) {
                    if ($(this).val().indexOf(searchstring) != -1) {
                        $(this).css("background", '#5baaff');
                        isStringExists = false;
                    }
                })
                if (isStringExists) {
                    AlertMessages("Find text", "No matches are found", 'warning');
                    return;
                }
            });
            $(".replaceall").click(function () {
                //selectedItemsList = [];
                if ($(".ReplaceContent")[0].value == '') {
                    AlertMessages("Replace text", "please enter text for replacing", 'warning');
                    return;
                }
                var searchstring = $(".SearchContent")[0].value;
                $(".contentlist input[type=url]").each(function (item) {
                    if ($(this).val().indexOf(searchstring) != -1) {
                        $(this).css("background", '#5baaff');
                        var oldurl = $(this).val();
                        var replacedcontent = $(this).val().replace($(".SearchContent")[0].value, $(".ReplaceContent")[0].value);
                        $("#" + this.id)[0].value = replacedcontent;
                        $(this)[0].title = replacedcontent;
                        //selectedItemsList.push({ "id": this.id.replace(($(this).attr("webmapId") + "_"), ''), "newUrl": replacedcontent, "url": oldurl, "name": this.name, "webmapId": $(this).attr("webmapId") });
                        var textmatchFound = false;
                        for (var i = 0; i < selectedItemsList.length; i++) {
                            if (selectedItemsList[i].id == this.id.replace(($(this).attr("webmapId") + "_"), '')) {
                                selectedItemsList[i].newUrl = replacedcontent;
                                $(".getselecteditems").removeClass("disbaleClass");
                                AlertMessages("Replace text", "Successfully replaced text", 'success');
                                textmatchFound = true;
                                break;
                            }
                        }
                        if (!textmatchFound) {
                            selectedItemsList.push({ "id": this.id.replace(($(this).attr("webmapId") + "_"), ''), "newUrl": replacedcontent, "url": oldurl, "name": this.name, "webmapId": $(this).attr("webmapId") });
                            $(".getselecteditems").removeClass("disbaleClass");
                            AlertMessages("Replace text", "Successfully replaced text", 'success');
                        }
                    }
                })


            });
            $(".clearall").click(function () {
                $(this).css("background", '');
                for (var i = 0; i < selectedItemsList.length; i++) {
                    $("#" + selectedItemsList[i].webmapId + "_" + selectedItemsList[i].id)[0].value = selectedItemsList[i].url;
                    $("#" + selectedItemsList[i].webmapId + "_" + selectedItemsList[i].id).css("background", '');
                    $("#" + selectedItemsList[i].webmapId + "_" + selectedItemsList[i].id)[0].title = selectedItemsList[i].url;
                }
                $(".getselecteditems").addClass("disbaleClass");
                selectedItemsList = [];
            })

        });

        $(".FindServiceItems").click(function () {
            Actiontype = "FindServices";
            $(".Item_label")[0].innerText = "Manage Service Urls";

            var selectedWebMaps = [];
            var Urldomains = [];            
            
            $(".getselecteditems").addClass("disbaleClass");
            $("#items-control").empty();
            var isLayersExists = false;
            var node1 = "<div class='update_Webmap'>" +
                "<div class='form-group row'><label class='col-sm-4 mt-3'>Find Text</label><div class='col-sm-8'><input type='text' list='origServiceUrlList' class='form-control SearchContent' required /></div>" +
               // "<datalist id='origServiceUrlList'><option value='https://mafpgisdev.maf.ae'>https://mafpgisdev.maf.ae</option><option value='https://cdn.arcgis.com'>https://cdn.arcgis.com</option></datalist>" +
                "</div > " +
               // "<div class='form-group row'><label class='col-sm-4 mt-3'>Replace Text</label><div class='col-sm-8'><input type='text' class='form-control ReplaceContent' required /></div></div>" +
                "<div class='form-group row'><label class='col-sm-12' style='display:none'>Found <span class='Matchedtext' ></span> matches in webmap service urls</label></div>" +
                "<div class='text-center' ><button type='button' class='btn btn-sm btn-primary mr-2 findtext'>Find</button><button type='button' class='btn btn-sm btn-secondary clearall'>Clear</button></div>"
                + "</div><div class='clearfix'></div><div id ='matchedcontent'></div>"
            $("#items-control").append(node1);
            var itemnode = '';
            breadcrum_Label("Manage Service Urls")
          
            
            HidetoggleItemsTable();
            $(".findtext").click(function () {
               // $("#items-control").empty();
                $("#matchedcontent").empty();
                var searchstring = $(".SearchContent")[0].value;
                if (searchstring == '') {
                    AlertMessages("Find text", "please enter text for searching", 'warning');
                    return;
                }

                var portalItems = dojo.clone(ItemList) ;

                for (var i = 0; i < portalItems.length; i++) {
                   
                    if (portalItems[i].type == "Web Map") {                       //ItemsData      
                        var matchedUrl = [];
                        var iteminfo;

                        for (var j = 0; j < ItemsData.length; j++) {

                            if (ItemsData[j].id == portalItems[i].id) {
                                iteminfo = ItemsData[j].data;
                                break;
                            }
                        }

                        if (typeof (iteminfo.baseMap) != "undefined") {                           
                            var basemaplayers = iteminfo.baseMap.baseMapLayers;
                            for (var m = 0; m < basemaplayers.length; m++) {

                                if (basemaplayers[m].layerType == "VectorTileLayer") {
                                    var layername = basemaplayers[m].title;
                                    var layerurl = basemaplayers[m].styleUrl;

                                    if (layerurl.indexOf(searchstring) != -1) {

                                        matchedUrl.push({ "name": layername, "url": layerurl, "type": "BaseMap", "layerType": basemaplayers[m].layerType });
                                }

                                   // basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + layername + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + layerurl +" disabled readonly></div></div>"
                                }

                                else {
                                    var layername = basemaplayers[m].title;
                                    var layerurl = basemaplayers[m].url;
                                    if (layerurl.indexOf(searchstring) != -1) {
                                        matchedUrl.push({ "name": layername, "url": layerurl, "type": "BaseMap", "layerType": basemaplayers[m].layerType });
                                    }

                                }
                            }
                            


                        }

                        if (typeof (iteminfo.operationalLayers) != "undefined") {  
                            var oprlayers = iteminfo.operationalLayers;
                            for (var m = 0; m < oprlayers.length; m++) {

                                if (oprlayers[m].layerType == "VectorTileLayer") {
                                    var layername = oprlayers[m].title;
                                    var layerurl = oprlayers[m].styleUrl;
                                    matchedUrl.push({ "name": layername, "url": layerurl, "type": "BaseMap", "layerType": basemaplayers[m].layerType });
                                    if (layerurl.indexOf(searchstring) != -1) {
                                        matchedUrl.push({ "name": layername, "url": layerurl, "type": "Operational", "layerType": oprlayers[m].layerType });
                                    }
                                    
                                }

                                else {
                                    var layername = oprlayers[m].title;
                                    var layerurl = oprlayers[m].url;

                                    if (oprlayers[m].layerType=="GroupLayer") {

                                        var sublayers = oprlayers[m].layers;
                                        for (var c = 0; c < sublayers.length; c++) {

                                            layername = sublayers[c].title;
                                            layerurl = sublayers[c].url;
                                            if (layerurl.indexOf(searchstring) != -1) {
                                                matchedUrl.push({ "name": layername, "url": layerurl, "type": "Operational", "layerType": oprlayers[m].layerType });
                                            }

                                        }
                                    }
                                    else {
                                        if (typeof(layerurl) !="undefined") {
                                            if (layerurl.indexOf(searchstring) != -1) {
                                                matchedUrl.push({ "name": layername, "url": layerurl, "type": "Operational", "layerType": oprlayers[m].layerType });
                                            }
                                        }
                                        
                                    }

                                   
                                    
                                }
                            }
                            

                        }

                        var basemapContent = '';
                        var oprContent = '';
                        var itemnode = '';
                        if (matchedUrl.length > 0) {
                            var itemname = portalItems[i].title + "_" + portalItems[i].id + "(" + portalItems[i].type + ")";
                            var itemid = portalItems[i].id;
                            var contentNode = "";
                            contentNode = contentNode + "<hr/><div class='contentlist'><div  id= " + itemid + "> <h4>" + itemname + "</h4> </div><div>"
                            itemnode = itemnode + contentNode;
                            for (var m = 0; m < matchedUrl.length; m++) {

                                if (matchedUrl[m].type == "BaseMap") {
                                    if (basemapContent == '') {
                                        basemapContent = "<div class='basemapLayers'><h6  class='badge bg-primary text-white text-uppercase mb-5' >BaseMap Layers</h6>";
                                        basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"
                                       
                                    }
                                    else {

                                        basemapContent = basemapContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"
                                    }
                                    

                                }
                                else {
                                    if (oprContent == '') {
                                        oprContent = "<div class='operationlayers'><h6 class='badge bg-primary text-white text-uppercase mb-5'>Operation Layers</h6>";
                                        oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"
                                        
                                    }
                                    else {

                                        oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"
                                    }
                                }

                            }

                            if (basemapContent != '') {
                                basemapContent = basemapContent + "</div>";
                                itemnode = itemnode + basemapContent;
                            }
                            if (oprContent != '') {
                                oprContent = oprContent + "</div>";
                                itemnode = itemnode + oprContent;
                            }
                            itemnode = itemnode + "</div>";
                            $("#matchedcontent").append(itemnode);
                        }

                    }
                    if (false) {
                        var matchedUrl = [];
                        var layername = portalItems[i].title;
                        var layerurl;
                        if (typeof (portalItems[i].url) != "undefined") {
                            layerurl = portalItems[i].url;
                        }
                        else {
                            layerurl = portalItems[i].styleUrl;
                        }
                        var oprContent = "";
                        if (typeof (layerurl) != "undefined") {
                            if (layerurl.indexOf(searchstring) != -1) {
                                matchedUrl.push({ "name": layername, "url": layerurl, "type": "Operational" });
                                var itemname = portalItems[i].title + "_" + portalItems[i].id + "(" + portalItems[i].type + ")";
                                var itemid = portalItems[i].id;
                                var contentNode = "";
                                contentNode = contentNode + "<hr/><div class='contentlist'><div  id= " + itemid + "> <h4>" + itemname + "</h4> </div><div>"
                                itemnode = itemnode + contentNode;
                                for (var m = 0; m < matchedUrl.length; m++) {                                   
                                        if (oprContent == '') {
                                            oprContent = "<div class='operationlayers'><h6 class='badge bg-primary text-white text-uppercase mb-5'>Operation Layers</h6>";
                                            oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"

                                        }
                                        else {

                                            oprContent = oprContent + "<div class='form-group row'><label class='col-sm-4'>" + matchedUrl[m].name + "</label><div class='col-sm-8'><input type='url' class='form-control id='+   value=" + matchedUrl[m].url + " disabled readonly></div></div>"
                                        }                                   

                                }
                               
                                if (oprContent != '') {
                                    oprContent = oprContent + "</div>";
                                    itemnode = itemnode + oprContent;
                                }
                                itemnode = itemnode + "</div>";
                                $("#items-control").append(itemnode);

                            }
                        }
                    }
                   
                }

              
            });
          
            $(".clearall").click(function () {
                $("#matchedcontent").empty();
            })

        });


        function CheckBoxController(data, Label) {
            $('input[name="rad"]').click(function () {
                var $radio = $(this);
                $radio.siblings('input[name="userinvite"]').data('waschecked', false);
            });

            //    var checkboxNode = '<div class="row sel_Allchkbox"><span class="col-sm-12"> <input type=checkbox class="form-check-input selectallFields"/> Select All</span></div><br/>';

            var checkboxNode = ' <div class="form-row sel_Allchkbox">' +
                '<div class="col-md-4 text-center1" style="position:absolute1;bottom:-16px" >' +
                '<div class="custom-control custom-checkbox mb-0">' +
                '<input type="checkbox" id="customcheckboxInline5"  name="customcheckboxInline1" class="custom-control-input selectallFields" />' +
                '<label class="custom-control-label" for="customcheckboxInline5">Select All</label> </div></div>' +

                '<div class="col-md-4 text-center1 itemradio_btn"></div>' +
                '<div class="col-md-4 text-center1 ItemTags_btn"></div>' +

                '</div > <hr class="mb-0 pb-0">';




            var subCheckboxNode = '<div class="form-row mt-4 sel_Fields">';
            for (var i = 0; i < data.length; i++) {
                if (Label == "ExportItems") {
                    // subCheckboxNode = subCheckboxNode + '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectFields" value= "' + data[i].Key + '"/>' + data[i].Name + '</span><br/>'

                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].Key + '" name = "' + data[i].Key + '" class="custom-control-input selectFields" value= ' + data[i].Key + '>'
                        + '<label class="custom-control-label" for="' + data[i].Key + '"> <span class="contOverflow">' + data[i].Name + '</span></label></div ></div>'

                }

                else if (Label == "AddTags") {
                    // subCheckboxNode = subCheckboxNode + '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectFields" value= "' + data[i].tag + '"/> <a title= ' + data[i].tag + "> <span class=contOverflow>" + data[i].tag + '</span></a></span><br/>'
                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].tag + '" name = "' + data[i].tag + '" class="custom-control-input selectFields" value= ' + data[i].tag + '>'
                        + '<label class="custom-control-label" for="' + data[i].tag + '"> <span class="contOverflow">' + data[i].tag + '</span></label></div ></div>'


                }
                else {
                    // subCheckboxNode = subCheckboxNode + '<span class="col-sm-4"><input type="checkbox" class="form-check-input selectFields" value= "' + data[i] + '"/> <a title=' + data[i] + "> <span class=contOverflow>" + data[i] + '</span></a></span><br/>'
                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i] + '" name = "' + data[i] + '" class="custom-control-input selectFields" value= ' + data[i] + '>'
                        + '<label class="custom-control-label" for="' + data[i] + '"><span class="contOverflow">' + data[i] + '</span></label></div ></div>'

                }
            }
            subCheckboxNode = subCheckboxNode + "</div>";
            $("#items-control").empty();
            $("#items-control").append(checkboxNode).append(subCheckboxNode);//itemRadNode
            $(".itemradio_btn").append(itemRadNode);
            HidetoggleItemsTable();
            if (Label == "AddTags") {
                var button = '<div class="tagsSec col-md-12"><div class="form-row d-flex justify-content-end"><input type="text" class="Tagcontent form-control form-control-sm col-md-4 mr-1"/> <button class="addTagbtn btn btn-primary btn-sm">Add tag</button></div></div>'
                $(".ItemTags_btn").append(button);
            }

            $(".addTagbtn").click(function (e) {

                e.preventDefault();
                var newTagtext = $(".Tagcontent")[0].value;
                if (newTagtext == "") {
                    AlertMessages("Tags", "Please enter tag", "warning");
                    return;
                }
                if (newTagtext.indexOf("<") != -1 || newTagtext.indexOf(">") != -1) {
                    AlertMessages("Tags", "Tag  cannot contain any of these characters:< or >.", "warning");
                    return;
                }
                var tagexists = false;
                $(".sel_Fields .selectFields").each(function () {
                    if ($(this).val().toUpperCase() == newTagtext.toUpperCase()) {
                        AlertMessages("Add tags", $(".Tagcontent")[0].value + " tag already exists", "warning");
                        tagexists = true;
                        return;
                    }
                });
                if (tagexists)
                    return;
                _TagsList.push({ "tag": newTagtext });
                CheckBoxController(_TagsList, "AddTags");
                AlertMessages("Add tags", $(".Tagcontent")[0].value + " tag added to below list", "success");
                $(".Tagcontent")[0].value = '';
            });
            $(".getselecteditems").addClass("disbaleClass");
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
                    $(".getselecteditems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselecteditems").removeClass("disbaleClass");
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
                if (selectedItemsList.length == 0) {
                    $(".getselecteditems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselecteditems").removeClass("disbaleClass");
                }

            })
        }
        // document.getElementById("ExportitemJson").addEventListener("click", function () { //export items to json
        $("#ExportitemJson").click(function () {
            if (selectedItems.length == 0) {
                AlertMessages("Export Items", "Please select atleast one item", "warning");
                return;
            }
            Actiontype = "ExportToJson";
            breadcrum_Label("Export Items");
            $(".wizard_header")[0].innerText = "Export Items";
            CheckBoxController(ItemParameters, "ExportItems");
        });
        $(".getselecteditems").click(function () {
            count = 0;
            $('#selected_items').empty();
            $("#selected_items_list").empty();
            showseletecteditems();
            $(".selected-content").css("display", "block");
            if (Actiontype == 'AddTagstoItems' || Actiontype == "RemoveTags" || Actiontype == "ExportToCSV" || Actiontype == "ExportToJson" || Actiontype == "ExportWebMapServices" || Actiontype == "AssignOwner") {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    //var list = document.createElement("li");
                    //list.className = "group-item-list";
                    var label = selectedItemsList[i];
                    //list.textContent = label;
                    //$('#selected_items').append(list);                
                    var htmlContent = '<div class="dt-widget__item">' +
                        //  '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + label + '</a>'

                    $('#selected_items').append(htmlContent);
                }
                $(".itemcount")[0].innerText = selectedItemsList.length;

                if (Actiontype == "ExportToCSV" || Actiontype == "ExportToJson")
                    $(".fs-title-content")[0].innerText = "Exporting Fields";
                else if (Actiontype == "ExportWebMapServices")
                    $(".fs-title-content")[0].innerText = "Exporting Webmap services";
                else if (Actiontype == "AssignOwner")
                    $(".fs-title-content")[0].innerText = "Assign item owner";
                else
                    $(".fs-title-content")[0].innerText = "Selected Tags";

            }
            else if (Actiontype == "Enable/disablepopup") {
                if ($(".displaypopup")[0].value == "false")
                    var text = "EnablePopup";
                else
                    var text = "DisablePopup"

                // var list = document.createElement("li");
                //list.className = "group-item-list";
                //list.textContent = text;
                //$('#selected_items').append(list);

                var htmlContent = '<div class="dt-widget__item">' +
                    // '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                    '<div class="dt-widget__info text-truncate">' +
                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + text + '</a>'
                $('#selected_items').append(htmlContent);

                $(".fs-title-content")[0].innerText = "Enable/Disable Webmap Popup";
                $(".itemcount")[0].innerText = '1';
            }
            else if (Actiontype == "UpdateWebMapServices") {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    //var list = document.createElement("li");
                    //list.className = "group-item-list";
                    //list.textContent = selectedItemsList[i].name + ":" + selectedItemsList[i].newUrl;
                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate" title=' + selectedItemsList[i].newUrl + '>' + selectedItemsList[i].name + ":<br/>" + selectedItemsList[i].newUrl + '</a>'
                    $('#selected_items').append(htmlContent);
                    // $('#selected_items').append(list);
                }
                $(".fs-title-content")[0].innerText = "New service urls for selected webmap";
                $(".itemcount")[0].innerText = selectedItemsList.length;
            }
            else if (Actiontype == 'MoveItems') {
                // var list = document.createElement("li");
                //list.className = "group-item-list";
                for (var i = 0; i < folderList.length; i++) {
                    if ($("#FoldersList")[0].value == folderList[i].id) {
                        var name = folderList[i].title;
                    }
                }
                selectedItemsList = [];
                selectedItemsList.push(name);
                //list.textContent = name;
                var htmlContent = '<div class="dt-widget__item">' +
                    '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                    '<div class="dt-widget__info text-truncate">' +
                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + name + '</a>'
                $('#selected_items').append(htmlContent);
                $(".itemcount")[0].innerText = selectedItemsList.length;
                //$('#selected_items').append(list);
                $(".fs-title-content")[0].innerText = "Selected folder list";
            }
            else if (Actiontype == 'UpdateSync') {
                // var list = document.createElement("li");
                // list.className = "group-item-list";
                // list.textContent = $("#items-control select")[0].value;
                $(".itemcount")[0].innerText = "1";
                //$('#selected_items').append(list);
                var htmlContent = '<div class="dt-widget__item">' +
                    '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                    '<div class="dt-widget__info text-truncate">' +
                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + $("#items-control select")[0].value + '</a>'
                $('#selected_items').append(htmlContent);
                $(".fs-title-content")[0].innerText = "Selected Sync Capabilities";
            }
            else if (Actiontype == "BulkUpdate") {
                var formdata = $("#bulkItemform").serializeArray();
                for (var i = 0; i < formdata.length; i++) {
                    if (formdata[i].value.trim() != "") {
                        //var list = document.createElement("li");
                        //list.className = "group-item-list";
                        //list.textContent = formdata[i].name + " : " + formdata[i].value;
                        //$('#selected_items').append(list);
                        var htmlContent = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + formdata[i].name + " : " + formdata[i].value + '</a>'
                        $('#selected_items').append(htmlContent);
                    }
                }
                $(".fs-title-content")[0].innerText = "Selected item parameters";
                $(".itemcount")[0].innerText = $('#selected_items')[0].childNodes.length;
            }

            else if (Actiontype == "Importitems") {//selected-content
                $(".importContent").removeClass("col-md-6").addClass("col-md-12");
                for (var i = 0; i < selectedItemsList.length; i++) {
                    //var list = document.createElement("li");
                    //list.className = "group-item-list";
                    //list.textContent = selectedItemsList[i];
                    //$('#selected_items').append(list);
                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + selectedItemsList[i] + '</a>'
                    $('#selected_items').append(htmlContent);
                }
                $(".itemcount")[0].innerText = selectedItemsList.length;
                $(".fs-title-content")[0].innerText = "Imported items list";
                $(".selected-content").css("display", "none");
            }
            else if (Actiontype == 'AddLayerstoWebmap') {
                for (var k = 0; k < selectedItemsList.length; k++) {
                    var list = document.createElement("li");
                    list.className = "group-item-list";
                    list.textContent = selectedItemsList[k].name + ":" + selectedItemsList[k].url;
                    $('#selected_items').append(list);
                }
                $(".itemcount")[0].innerText = selectedItemsList.length;
                $(".fs-title-content")[0].innerText = "Added service list";
            }
            else {
                for (var i = 0; i < selectedItemsList.length; i++) {
                    groupsList.forEach(function (group) {
                        if (group.id == selectedItemsList[i]) {
                            //var list = document.createElement("li");
                            //list.className = "group-item-list";
                            //list.textContent = group.title;
                            //$('#selected_items').append(list);
                            var htmlContent = '<div class="dt-widget__item">' +
                                '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                                '<div class="dt-widget__info text-truncate">' +
                                '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + group.title + '</a>'
                            $('#selected_items').append(htmlContent);
                        }
                    });
                }
                $(".itemcount")[0].innerText = selectedItemsList.length;
                $(".fs-title-content")[0].innerText = "Selected groups list";
            }

        });
        function showseletecteditems() { // prepare selected items list
            for (var i = 0; i < selectedItems.length; i++) {
                for (var j = 0; j < ItemList.length; j++) {
                    if (selectedItems[i] == ItemList[j].id && Actiontype != "ExportWebMapServices") {
                        // var list = document.createElement("li");
                        var label = ItemList[j].title;
                        //list.className = "group-item-list";
                        //list.textContent = label;
                        // $('#selected_items_list').append(list);
                        var htmlContent = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + label + '</a>'
                        $('#selected_items_list').append(htmlContent);
                        break;
                    }
                    if (selectedItems[i] == ItemList[j].id && Actiontype == "ExportWebMapServices" && ItemList[j].type == "Web Map") {
                        var list = document.createElement("li");
                        var label = ItemList[j].title;
                        // list.className = "group-item-list";
                        // list.textContent = label;
                        // $('#selected_items_list').append(list);
                        var htmlContent = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="https://via.placeholder.com/150x150" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + label + '</a>'
                        $('#selected_items_list').append(htmlContent);
                        break;
                    }
                }
            }
            $(".Itemscount")[0].innerText = $('#selected_items_list')[0].childNodes.length;
        };

        function ShowtoggleItemsTable() {
            $(".item_colums_list").css("display", "block");
            $("#Items_wizard").css("display", "none");
            $("#itemTableDiv").css("display", "block");
            $(".Item_ActionPanel").css("display", "block");
            $("#wizard_itemstab").css("display", 'block');
            $("#wizard_Successtab").css("display", 'none');
            $("#wizard_itemstab").css("opacity", "1");
            $("#wizard_Successtab").css("opacity", "0");
            $(".cleargroupsinfo").click();
            //$("#wizard_confirmtab").css({ "display": "none", "opacity": "0" });
            //$("#wizard_itemstab").css({ "display": "block", "opacity": "1" });
            $("#SelectItems").addClass("active");
            $("#Finish").removeClass("active");
            $("#MainCard").show();
            $("#Wizard_Items").hide();
            $("#Confirm").removeClass("active");
        };
        function HidetoggleItemsTable() {
            //$("#itemTableDiv").css("display", "none");
            //$("#Items_wizard").css("display", "block");
            //$(".Item_ActionPanel").css("display", "none")
            $("#wizard_Successtab").css("display", "none");
            $("#wizard_Successtab").css("opacity", "0");
            $("#wizard_itemstab").css("display", "block");
            $("#wizard_itemstab").css("opacity", "1");
            // $(".cleargroupsinfo").click();
            $("#MainCard").hide();
            $("#Wizard_Items").show();
            //$("#wizard_confirmtab").css({ "display": "none", "opacity": "0" });
            //$("#wizard_itemstab").css({ "display": "block", "opacity": "1" });
            $("#SelectItems").addClass("active");
            $("#Finish").removeClass("active");
            $("#Confirm").removeClass("active");
        };
        $("#ReturnHome").click(function () {
            ShowtoggleItemsTable();
            ItemList = [];
            $(".Item_ActionPanel").css("display", "block");
            ItemParams.start = 1;
            fetchAllItems();
            $(".importContent").removeClass("col-md-12").addClass("col-md-6");
            selectedItems = [];
            selectedItemsList = [];
            $("#loader").css("display", "block");
            $("#migrate-success").css("display", "none");
            $("#migrate-fail").css("display", "none");
            $("#MainCard").show();
            $("#Wizard_Items").hide();
            current = 1
            setProgressBar(current);
            $("#itemGallery").css("display", "none");
        })
        function showSuccessDiv() {
            $("#loader").css("display", "none");
            $("#migrate-success").css("display", "block");
            $("#migrate-fail").css("display", "none");

        };
        function showfailuredivDiv() {
            $("#loader").css("display", "none");
            $("#migrate-success").css("display", "none");
            $("#migrate-fail").css("display", "block");
        };
    });
}