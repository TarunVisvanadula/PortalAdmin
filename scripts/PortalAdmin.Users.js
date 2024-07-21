//var commonutils = new CommonUtils();
var PortalGroups = [];
includeHeader();
includeMenu('Users');
loadUsers();
var searchflag = false;
function loadUsers() {
    require([
        "esri/identity/IdentityManager",
        "esri/request",
        "esri/identity/OAuthInfo",
        "esri/config"

    ], function (esriId, esriRequest, OAuthInfo, esriConfig) {
        if (sessionStorage.getItem("Accesskey") == null || sessionStorage.getItem("Accesskey") == "null" || sessionStorage.getItem("Accesskey") == undefined) {
            signOutCredentials(esriId);
        }

        var sesstionItem = JSON.parse(sessionStorage.getItem("Accesskey"));

        //if (sesstionItem.hostName != "")
        if (sesstionItem.PKIandIWFLogin)
            esriConfig.request.trustedServers.push(sesstionItem.hostName);
        var portalToken = sesstionItem.token;
        $("#personalizedPanel").css("display", "block");


        var selectedItemsList = [];
        var selectedUsers = []; var temparray = []; var groupList = []; var requestList = [];
        var count = 0; var errcount = 0;
        var usersList;
        var rolesData; var customroles = [];
        var url;
        var usergroups = []; var userLicenseList = [];
        var ErrList = [];
        var importedDate;
        var userradioButtons = $(".users_radbtn");
        var Bulkupdatenode = $("#UserCapabilities"); var current = 1;
        $("#Wizard_Users").hide();
        $(".bootstrap-tagsinput").addClass("form-control");
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
                $("#GroupInfo").hide();
                $("#EditUser").hide();
                $("#MainCard").show();
                var childElements = $("#usersForm .form-control");
                for (var i = 0; i < childElements.length; i++) {
                    $(childElements[i]).prop('disabled', false);
                }
                $(".import_usr").removeClass('col-md-12').addClass('col-md-6');

            });

            $(".breadcrumb_Home").click(function () {
                $(".breadcrumb .active").remove();
                $("#ReturnHome").click();
                $("#radionode").css("display", "none");
            })
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
        if (sesstionItem.type == "PortalforArcgis") {
            Config.portalUrl = sesstionItem.portalurl;
        }

        if (sesstionItem.type == "Arcgisonline") {
            Config.portalUrl = sesstionItem.portalurl;
        }
        if (typeof (localStorage.getItem("Pagenavigation")) != "undefined" && typeof (localStorage.getItem("Pagenavigation")) != "null") {
            var searchedtext = localStorage.getItem("Pagenavigation");
            if (searchedtext == "Create User") {

                createUser();
            };
            localStorage.removeItem("Pagenavigation");
        }
        var userParameters = [ // exporting array options
            { Name: "User Name", Key: "username", exportLabel: "username" },
            { Name: "ID", Key: "id", exportLabel: "id" },
            { Name: "Full Name", Key: "fullName", exportLabel: "fullname" },
            { Name: "Available Credits", Key: "availableCredits", exportLabel: "availableCredits" },
            { Name: "Email", Key: "email", exportLabel: "email" },
            { Name: "Assigned credits", Key: "assignedCredits", exportLabel: "assignedCredits" },
            { Name: "First Name", Key: "firstName", exportLabel: "firstname" },
            { Name: "Last Name", Key: "lastName", exportLabel: "lastname" },
            { Name: "Description", Key: "description", exportLabel: "description" },
            { Name: "Idp Username", Key: "idpUsername", exportLabel: "idpUsername" },
            { Name: "Favourite Group", Key: "favGroupId", exportLabel: "favGroupId" },
            { Name: "Last Login", Key: "lastLogin", exportLabel: "lastLogin" },
            { Name: "Access", Key: "access", exportLabel: "access" },
            { Name: "Role", Key: "role", exportLabel: "role" },
            { Name: "License Type", Key: "userLicenseTypeId", exportLabel: "userLicenseType" },
            { Name: "Tags", Key: "tags", exportLabel: "tags" },
            { Name: "Culture", Key: "culture", exportLabel: "culture" },
            { Name: "Region", Key: "region", exportLabel: "region" },
            { Name: "Created Date", Key: "created", exportLabel: "created" },
            { Name: "Modified Date", Key: "modified", exportLabel: "modified" },
            { Name: "Provider", Key: "provider", exportLabel: "provider" },
            { Name: "User Type", Key: "userType", exportLabel: "userType" }

        ];
        // $(".bootstrap-tagsinput").addClass("form-control")
        $(".lds-ring").css("display", "block");
        fetchAllRoles();
        //fetchAllUsers();
        fetchAllGroups();
        if (sesstionItem.type == "Arcgisonline") {
            fetchAllUsertypes();
        }
        fetchPortalGroups();
        //getFavItems();
        function getFavItems() { // fetch all users
            var url = "https://www.arcgis.com/sharing/rest/content/groups/0270953bc1844ab08ec0cc72e2442318/search";

            var queryParams = {
                token: portalToken,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    console.log(response.data);

                }).catch(function (err) {
                    console.log(err);
                });
        };
        function ValidateUserName(username, UserCreateOptions) {

            var v_url = Config.portalUrl + "/sharing/rest/community/checkUsernames";
            var queryParams = {
                token: portalToken,
                usernames: username,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(v_url, options)
                .then(function (response) {
                    console.log(response.data);
                    var existingusername = [];
                    errcount = 0;
                    var usernames = response.data.usernames;
                    for (var i = 0; i < usernames.length; i++) {
                        if (usernames[i].requested != usernames[i].suggested) {
                            existingusername.push(usernames[i].requested);
                        }
                    }
                    if (existingusername.length != 0) {
                        AlertMessages("UserName", existingusername.join(",") + " already exists", "warning");
                        if (existingusername.length == username.split(",").length) {
                            if (Actiontype == "importUser") {
                                $(".closeModal").click();
                            }
                            return;
                        }
                    }
                    var options = UserCreateOptions;
                    if (Actiontype != "importUser") {
                        var options = UserCreateOptions.query;
                        options.responseType = UserCreateOptions.responseType;
                    }
                    errcount = 0;
                    if (Actiontype == "importUser") {
                        //$('#defaul-modal').modal('toggle');
                        $(".closeModal").click();
                        var filterusers = [];
                        for (var m = 0; m < temparray.length; m++) {
                            if (existingusername.join(",").indexOf(temparray[m].username) == -1) {
                                filterusers.push(temparray[m])
                            }
                        }
                        temparray = filterusers;
                        getGroupList(filterusers, options);
                        breadcrum_Label("Import Users");
                    }
                    else {
                        //if (sesstionItem.type == "PortalforArcgis") {

                        _AjaxRequest_users(options, "Create User");
                        // EsriRequest_users(UserCreateOptions);
                        //  }
                        // else {
                        //   ValidatePassword(options);
                        // }
                    }

                }).catch(function (err) {
                    console.log(err);
                });
        }
        function ValidatePassword(UserCreateOptions) {
            var v_url = Config.portalUrl + "/sharing/rest/portals/checkPasswordStrength";
            var queryParams = {
                token: portalToken,
                password: $(".userPassword")[0].value,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json",
                method: "post"
            };
            errcount = 0;
            esriRequest(v_url, options)
                .then(function (response) {
                    console.log(response.data);
                    if (response.data.longEnough && response.data.enoughLetter && response.data.enoughDigit) {
                        _AjaxRequest_users(options, "Create User");
                    }
                    else {
                        AlertMessages("Password", "Password must contain  atleast 1 number(0-9) and may not be less than 8 characters", "Warning");
                        return
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        }
        function LoadBulkupdateContols() {
            $("#userrole").empty();
            $("#Bulkuserroles").empty();
            if (rolesData.length > 0) {
                var option = document.createElement('option');
                option.value = "";
                option.textContent = "Select role";
                $(option).attr("selected", true);
                //  $("#Bulkuserroles").append(option);
                $("#userrole").append(option);
                for (var i = 0; i < rolesData.length; i++) {
                    var suboption = document.createElement('option');
                    suboption.value = rolesData[i].id;
                    suboption.textContent = rolesData[i].name;
                    $("#userrole").append(suboption);
                }
                var option1 = document.createElement('option');
                option1.value = "";
                option1.textContent = "Select role";
                $(option1).attr("selected", true);
                $("#Bulkuserroles").append(option1);
                for (var i = 0; i < rolesData.length; i++) {
                    var suboption = document.createElement('option');
                    suboption.value = rolesData[i].id;
                    suboption.textContent = rolesData[i].name;
                    $("#Bulkuserroles").append(suboption);
                }

            }
            //console.log("hi")

        };
        function fetchGroupUsers(groupId) { // fetch all users
            var url = Config.portalUrl + "/sharing/rest/community/groups/" + groupId + "/userlist";

            var queryParams = {
                token: portalToken,
                f: "json"
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    // console.log(response.data);
                    var groupid = response.url.split("/");
                    for (var i = 0; i < groupList.length; i++) {
                        //if (groupList[i].id == groupid) {
                        if (groupid.indexOf(groupList[i].id) != -1) {
                            var userlist = response.data.users;
                            groupList[i].groupmembers = []
                            for (var j = 0; j < userlist.length; j++) {
                                groupList[i].groupmembers.push(userlist[j].username);
                            }
                            break;
                        }
                    }
                    //usergroups.push(response.data.results);
                }).catch(function (err) {
                    console.log(err);
                });
        };
        var userresponse = [];
        var queryParams = {
            token: portalToken,
            f: "json",
            start: 1,
            num: 100,
            excludeSystemUsers: true
        };

        function fetchAllUsers() { // fetch all users
            var url = Config.portalUrl + "/sharing/rest/portals/self/users";

            var options = {
                query: queryParams,
                responseType: "json"
            };
            esriRequest(url, options)
                .then(function (response) {
                    var userlist = [];
                    $(".lds-ring").css("display", "none");
                    var users = response.data.users;
                    if (users.length != 0) {

                        for (var i = 0; i < users.length; i++) {

                            userresponse.push(users[i]);
                        }
                        queryParams.start = userresponse.length + 1;
                        fetchAllUsers()
                    }
                    else {
                        for (var i = 0; i < userresponse.length; i++) {

                            userlist.push(userresponse[i].username);
                        }
                        loadUsers_jsgrid(userresponse);
                    }



                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllGroups() {
            usergroups = [];
            var queryParams = {
                q: 'owner:' + sesstionItem.username, //'orgid:' + sesstionItem.portalid,
                token: portalToken,
                searchUserName: sesstionItem.username,
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
                    groupList = [];
                    //console.log(response);
                    var groups = response.data.results;
                    for (var i = 0; i < groups.length; i++) {
                        if (groups[i].owner == sesstionItem.username) {
                            groupList.push(groups[i]);
                            fetchGroupUsers(groups[i].id);
                        }
                    }

                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchPortalGroups() {
            PortalGroups = [];
            var queryParams = {
                q: 'owner:' + sesstionItem.username,
                token: portalToken,
                searchUserName: sesstionItem.username,
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

                    PortalGroups = response.data.results;


                }).catch(function (err) {
                    console.log(err);
                });
        };
        function fetchAllUsertypes() {
            $("#userLicense").empty();
            var useroptions = {
                f: "json",
                token: portalToken,
                responseType: "json"
            }
            try {
                $.ajax({
                    url: Config.portalUrl + "/sharing/rest/portals/self/userLicenseTypes",
                    crossDomain: true,
                    data: useroptions,
                    xhrFields: {
                        withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                    },
                    success: function (data, textStatus, jqXHR) {
                        userLicenseList = [];
                        var response = data;
                        if (typeof (response) == "string")
                            response = JSON.parse(data);
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            $(".User-Lic").css("display", "none");
                        }
                        else {
                            userLicenseList = response.userLicenseTypes;
                            if (userLicenseList != null || userLicenseList != undefined) {
                                if (userLicenseList.length > 0) {
                                    $(".User-Lic").css("display", "block");
                                    var option = "<option value=>Select License</opion>";
                                    for (var i = 0; i < userLicenseList.length; i++) {
                                        option = option + "<option value=" + userLicenseList[i].id + ">" + userLicenseList[i].name + "</option>"
                                    }
                                    $("#userLicense").append(option);
                                }

                            }
                            if (userLicenseList.length == 0) {
                                $(".User-Lic").css("display", "none");
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

        };
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
                    customroles = response.data.roles.concat(customroles);
                    LoadBulkupdateContols();
                    fetchAllUsers();

                }).catch(function (err) {
                    console.log(err);
                });
        };
        //  document.getElementById("sign-out").addEventListener("click", function () {
        $("#sign-out").click(function () {
            signOutCredentials(esriId);
            sessionStorage.setItem("Accesskey", 'Invalid token');
        });
        $("#ImportUsersCsv").click(function () {
            $("#uploadItemForm p")[0].innerText = "Drag your files here or click in this area.";
            $("#inputGroupFile01").val('').clone(true);
            $("#defaul-modal").show();

        });
        $("#ImportUsersJson").click(function () {
            $("#inputGroupFile01").val('').clone(true);
            $("#defaul-modal").show();

        });

        $(".createNewUser").click(function () {

            createUser();
        })
        function createUser() {
            $(".clearUserinfo").click();
            $('.UserTags').tagsinput('removeAll');
            $(".User_label")[0].innerText = "Create User";
            breadcrum_Label("Create User")
            $("#EditUser").show();
            $("#MainCard").hide();
            $(".usr_footer").css("display", "");
            Actiontype = "createuser";
            $(".pass_sec").css("display", "");
            var childElements = $("#usersForm .form-control");
            clearInputFields(childElements);
            var childElements = $("#usersForm .form-control");
            for (var i = 0; i < childElements.length; i++) {
                $(childElements[i]).prop('disabled', false).prop('readonly', false);
            }
            url = Config.portalUrl + "/sharing/rest/portals/self/invite";
            $(".usrType").css("display", "");
            if (sesstionItem.type == "PortalforArcgis") {
                $(".User-Lic").css("display", "none");
                $(".usrType").css("display", "none");
            }

        };
        $('#UserName').on('keypress', function (e) {

            var message;
            message = "Update user";
            if (Actiontype == "createuser")
                message = "Create User"
            if (e.which >= 32 && e.which <= 47 || e.which >= 58 && e.which <= 64 || e.which >= 91 && e.which <= 96 || e.which >= 1231 && e.which <= 126) {

                if (e.which == 45 || e.which == 46 || e.which == 64 || e.which == 95) {

                }
                else {
                    AlertMessages(message, "Username may only contain  alphanumeric characters or any of the following: @-._", "warning");
                    return;
                }
            }
        });
        $("#cancelUser").click(function () {
            $("#grdUsers").css("display", "block");
            $(".clearUserinfo").click();
            $(".UserActions").css("display", "block");
            $("#UserItemList").css("display", "none");
            $("#SaveUser").css("display", "block");
            $(".pass_sec").css("display", "none");
            $(".head_Actions").css("display", "block");
            var childElements = $("#UserItemList .form-control");
            for (var i = 0; i < childElements.length; i++) {
                $(childElements[i]).prop('disabled', false);
            }


        })

        $("#SaveUser").click(function () {
            temparray = [];
            var message;
            message = "Update user";
            if (Actiontype == "createuser")
                message = "Create User"
            var formData = $("#usersForm").serializeArray();

            if (Actiontype == "createuser") {
                for (var i = 0; i < formData.length; i++) {
                    if (sesstionItem.type == "PortalforArcgis") {
                        if (formData[i].value == "" && formData[i].name != "usertype") {
                            AlertMessages(message, "Please enter " + formData[i].name, "warning");
                            return
                        }
                    }
                    else {
                        if (formData[i].value == "") {
                            AlertMessages(message, "Please enter " + formData[i].name, "warning");
                            return
                        }
                    }
                }

                var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if (!regex.test($(".useremail")[0].value)) {
                    AlertMessages("Invalid Email", "Please enter valid email", 'danger');
                    return;
                }
                var Userlist = {
                    "invitations": []
                };
                if ($(".userName")[0].value.length < 6) {
                    AlertMessages("Username", "Please enter username with more than 6 characters", 'warning');
                    return;
                }
                var useroptions = {
                    email: $(".useremail")[0].value,
                    firstname: $(".userFirstname")[0].value,
                    lastname: $(".userlastname")[0].value,
                    username: $(".userName")[0].value,
                    password: $(".userPassword")[0].value,
                    role: $("#userrole").val(),
                    access: $("#Useraccess").val(),
                    fullname: $(".userFirstname")[0].value + " " + $(".userlastname")[0].value,
                    userCreditAssignment: -1,
                    applyActUserDefaults: false

                }
                if (sesstionItem.type == "1PortalforArcgis") {
                    var Userlist = [];
                    var useroptions = {
                        username: $(".userName")[0].value,
                        password: $(".userPassword")[0].value,
                        firstname: $(".userFirstname")[0].value,
                        lastname: $(".userlastname")[0].value,
                        email: $(".useremail")[0].value,
                        role: $("#userrole").val(),
                        level: '2',
                        provider: 'arcgis',
                        f: 'json',
                        token: portalToken,
                        responseType: "json",
                        method: "post"
                    }
                }

                if (sesstionItem.type == "Arcgisonline" && userLicenseList.length > 0) {
                    useroptions.userLicenseType = $("#userLicense").val();
                    useroptions.userType = $("#userType").val();
                }
                Userlist.invitations.push(useroptions);
                var options = {
                    query: { "invitationList": JSON.stringify(Userlist), f: "json", token: portalToken },
                    responseType: "json",
                    method: "post"
                };
                temparray.push({ username: $(".userName")[0].value, userType: $("#userType").val(), access: $("#Useraccess").val(), description: $(".UserDesc")[0].value, tags: $(".UserTags")[0].value });
                console.log("Creation Data:", useroptions);
                var reg = new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/);
                if (!reg.test($(".userPassword")[0].value)) {
                    AlertMessages("Password strength", "Password should contain atleast one special character,number and may not be less than 8 characters", "danger");
                    return
                }
                ValidateUserName($(".userName")[0].value, options)

            }
            if (Actiontype == "edit") {
                $("#userType").css("display", "block");
                if (sesstionItem.type != "Arcgisonline") {
                    $("#userType").css("display", "none");
                }
                for (var i = 0; i < formData.length; i++) {
                    if (sesstionItem.type == "PortalforArcgis") {
                        if (formData[i].value == "" && formData[i].name != "password" && formData[i].name != "usertype") {
                            AlertMessages(message, "Please enter " + formData[i].name, "warning");
                            return
                        }
                    }
                    else {
                        if (formData[i].value == "" && formData[i].name != "password") {
                            AlertMessages(message, "Please enter " + formData[i].name, "warning");
                            return
                        }
                    }

                }

                var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if (!regex.test($(".useremail")[0].value)) {
                    AlertMessages("Invalid Email", "Please enter valid email", 'danger');
                    return;
                }
                var useroptions = {
                    email: $(".useremail")[0].value,
                    firstName: $(".userFirstname")[0].value,
                    lastName: $(".userlastname")[0].value,
                    role: $("#userrole").val(),
                    access: $("#Useraccess").val(),
                    description: $(".UserDesc")[0].value,
                    tags: $(".UserTags")[0].value,
                    f: "json",
                    token: portalToken,
                    responseType: "json",
                    method: "post"
                }
                if (sesstionItem.type != "PortalforArcgis") {
                    if (userLicenseList.length > 0)
                        useroptions.userLicenseType = $("#userLicense").val();
                    useroptions.userType = $("#userType").val();
                }
                errcount = 0;
                _AjaxRequest_users(useroptions, "Update User");
            }
        })
        function getGroupList(JsonData, options) {
            var groupArray = [];
            $("#radionode").css("display", "none");
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
            if (Actiontype == "InviteusertoGroups" || Actiontype == "UnInviteuserfromGroups") {

                for (var i = 0; i < JsonData.length; i++) {
                    var GroupObj = {
                        id: JsonData[i].id,
                        Title: JsonData[i].title,
                        Access: JsonData[i].access,
                        Owner: JsonData[i].owner,
                        CreatedOn: new Date(JsonData[i].created).toLocaleDateString(),
                        ModifiedOn: new Date(JsonData[i].modified).toLocaleDateString(),
                    };
                    groupArray.push(GroupObj);
                }
                $("#GroupItemsContol").empty();
                if (Actiontype == "InviteusertoGroups") {
                    $("#radionode").css("display", "block");
                    $("#radionode").append(userradioButtons);
                    $(".users_radbtn").css("display", "block").css("position", "").addClass("mb-2");
                    $(".users_radbtn .title1")[0].innerText = "Add without inviting";
                    $(".users_radbtn .title2")[0].innerText = "Send invitation";
                }
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
                    }
                    ,
                    {
                        name: "Title", type: "text", title: 'Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Title).text(item.Title)
                        }
                    },
                    {
                        name: "Access", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Access).text(item.Access)
                        }
                    },
                    {
                        name: "Owner", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Owner).text(item.Owner)
                        }
                    },
                    {
                        name: "CreatedOn", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.CreatedOn).text(item.CreatedOn)
                        }
                    },
                    {
                        name: "ModifiedOn", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.ModifiedOn).text(item.ModifiedOn)
                        }
                    }
                ]
                if (groupArray.length == 0) {
                    AlertMessages("Invite Users", "No User Groups Found", "warning");
                    return;
                }
                loadGroupsItems(groupArray, fields);
                if (Actiontype != "InviteusertoGroups") {
                    breadcrum_Label("Uninvite Users from Groups")
                }
                else {
                    breadcrum_Label("Invite Users to Groups");
                }
                $("#MainCard").hide();
                $("#Wizard_Users").show();
                HideUserTable();
            }
            if (Actiontype == "importUser") {
                var importedContent = []
                for (var i = 0; i < JsonData.length; i++) {
                    importedContent.push(JsonData[i]);
                }
                Actiontype = "importUser"
                var fields = [

                    {
                        name: "username", type: "text", title: 'User Name',

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
                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.username)
                                .prop("checked", $.inArray(item.username, selectedItemsList) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        }




                        //itemTemplate: function (_, item) {
                        //    return $("<a>").attr("class", "attrClass").attr("title", item.username).text(item.username)
                        //}
                    },
                    {
                        name: "username", type: "text", title: "Username",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.username).text(item.username)
                        }
                    },
                    {
                        name: "email", type: "text", title: "Email",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.email).text(item.email)
                        }
                    },
                    {
                        name: "firstName", type: "text", title: "First Name",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.firstName).text(item.firstname)
                        }
                    },
                    {
                        name: "lastName", type: "text", title: "Last Name",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.lastName).text(item.lastname)
                        }
                    },
                    {
                        name: "role", type: "text", title: "Role",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.role).text(item.role)
                        }
                    },
                    {
                        name: "userType", type: "text", title: "Usertype",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.role).text(item.userType)
                        }
                    },
                ]
                loadGroupsItems(importedContent, fields);
                $(".wizard_header")[0].innerText = "Imported User information";
                HideUserTable();
                $(".getselectetitems").removeClass("disbaleClass");


            }
            if (Actiontype == "Pending Users") {
                var userarray = [];
                for (var i = 0; i < JsonData.length; i++) {
                    var userobj = {
                        username: JsonData[i].username,
                        fullName: JsonData[i].fullName,
                        firstName: JsonData[i].firstName,
                        lastName: JsonData[i].lastName,
                        Modified: new Date(JsonData[i].modified).toLocaleDateString(),
                    };
                    userarray.push(userobj);
                }
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
                                    }
                                    else {
                                        $('.getsubItems').each(function () {
                                            this.checked = false;
                                            unselectItem($(this)[0].id);
                                        });
                                        selectedItemsList = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.username)
                                .prop("checked", $.inArray(item.username, selectedItemsList) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                });
                        },
                        align: "center",
                        width: 50,
                        sorting: false
                    },
                    {
                        name: "username", type: "text", title: 'User Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.username).text(item.username)
                        }
                    },
                    {
                        name: "fullName", type: "text", title: 'Full Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.fullName).text(item.fullName)
                        }
                    },
                    {
                        name: "firstName", type: "text", title: 'First Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.firstName).text(item.firstName)
                        }
                    },
                    {
                        name: "lastName", type: "text", title: 'Last Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.lastName).text(item.lastName)
                        }
                    },
                    {
                        name: "ModifiedOn", type: "text",
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.Modified).text(item.Modified)
                        }
                    }
                ]
                loadGroupsItems(userarray, fields);
                $(".wizard_header")[0].innerText = "Pending Users information";
                HideUserTable();
            }
            if (Actiontype == "User invites") {
                var userarray = [];

                var selectItem1 = function (item) {
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
                var unselectItem1 = function (item) {

                    selectedItemsList = $.grep(selectedItemsList, function (i) {
                        if (i.targetId == item.targetId && i.username == item.username) { }
                        else
                            return i

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




                for (var i = 0; i < JsonData.length; i++) {
                    var groupTitle = '';
                    for (var k = 0; k < PortalGroups.length; k++) {
                        if (JsonData[i].targetId == PortalGroups[k].id) {
                            groupTitle = PortalGroups[k].title;
                            break;
                        }
                    }
                    var userobj = {
                        username: JsonData[i].username,
                        groupname: groupTitle,
                        targetId: JsonData[i].targetId,
                        role: JsonData[i].role,
                        InvitedBy: JsonData[i].fromUsername.username,
                        received: new Date(JsonData[i].received).toLocaleDateString(),
                    };
                    userarray.push(userobj);
                }
                $("#GroupItemsContol").empty();
                var fields = [
                    {
                        headerTemplate: function () {
                            return $("<input>").attr("type", "checkbox").attr("id", "selectAllItemCheckbox")
                                .on("change", function () {
                                    selectedItemsList = [];
                                    if (this.checked) { // check select status
                                        $('.getsubItems').each(function () {
                                            this.checked = true;
                                            selectItem1({ targetId: $(this)[0].id, username: $(this)[0].name });
                                        });
                                    }
                                    else {
                                        $('.getsubItems').each(function () {
                                            this.checked = false;
                                            unselectItem({ targetId: $(this)[0].id, username: $(this)[0].name });
                                        });
                                        selectedItemsList = [];
                                    }
                                });
                        },
                        itemTemplate: function (_, item) {
                            return $("<input>").attr("type", "checkbox").attr("class", "getsubItems").attr("id", item.targetId).attr("name", item.username)
                                .prop("checked", $.inArray(item.username, selectedItemsList) > -1)
                                .on("change", function () {
                                    $(this).is(":checked") ? selectItem1({ targetId: $(this)[0].id, username: $(this)[0].name }) : unselectItem1({ targetId: $(this)[0].id, username: $(this)[0].name });
                                });
                        },
                        align: "center",
                        width: 50,
                        sorting: false
                    },
                    {
                        name: "username", type: "text", title: 'User Name',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.username).text(item.username)
                        }
                    },
                    {
                        name: "groupname", type: "text", title: 'Invited Group',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.groupname).text(item.groupname)
                        }
                    },
                    {
                        name: "targetId", type: "text", title: 'Invited Group id',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.targetId).text(item.targetId)
                        }
                    },
                    {
                        name: "role", type: "text", title: 'Role',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.role).text(item.role)
                        }
                    },
                    {
                        name: "InvitedBy", type: "text", title: 'Invited By',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.InvitedBy).text(item.InvitedBy)
                        }
                    },
                    {
                        name: "received", type: "text", title: 'Received Date',
                        itemTemplate: function (_, item) {
                            return $("<a>").attr("class", "attrClass").attr("title", item.received).text(item.received)
                        }
                    }
                ]
                loadGroupsItems(userarray, fields);
                $("#UserLabels")[0].innerText = "Delete Users Invitations";
                HideUserTable();
            }
        }
        function breadcrum_Label(label) {
            $(".breadcrumb").append('<li class="active breadcrumb-item">' + label + '</li>')

        }
        function loadGroupsItems(Itemdata, Fields) {
            $(".Sub_page_size").css("display", "none");

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
            $(".getsubItems").click(function () {
                //alert("hi");
                if ($(this)[0].checked) {
                    selectedItemsList.push($(this).val());
                }
                else {
                    var removeItem = $(this).val();
                    selectedItemsList = jQuery.grep(selectedItemsList, function (value) {
                        return value != removeItem;
                    });
                }
                if (selectedItemsList.length == 0) {
                    $(".getselectetitems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselectetitems").removeClass("disbaleClass");
                }

            });
            $("#pageSize_child").on('change', function (event) {
                $("#GroupItemsContol").jsGrid("option", "pageSize", this.value);
            });
            $("#GroupItemsContol").css("width", "auto");
        }
        $(".UsersBulkUpdate").click(function () {
            if (selectedUsers.length == 0) {
                AlertMessages("Update", "Please select user for updating", "warning");
                return;
            }
            Actiontype = 'Bulkupdate';
            count = 0;
            $(".wizard_header")[0].innerText = "Bulk Update";
            breadcrum_Label("Update Users")
            $(".getselectetitems").addClass("disbaleClass");
            $("#GroupItemsContol").empty();
            $("#GroupItemsContol").append(Bulkupdatenode);
            $("#UserCapabilities").css("display", "block");
            HideUserTable();
            $(function () {
                $('#UserCapabilities input:text').keyup(validateButton);
                $('#UserCapabilities select').change(validateButton);
                function validateButton() {
                    var validation = true;
                    $('#UserCapabilities input:text, #UserCapabilities select').each(function () {
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
            $("#Wizard_Users").show();
            $("#MainCard").hide();
        })
        $(".Firstpreview").click(function () {
            ShowUserTable();
            count = 0;
            $("#Wizard_Users").hide();
            setProgressBar(1);
            $("#UserCapabilities").css('display', 'none');
            $(".getselectetitems").removeClass("disbaleClass");
            $(".users_radbtn").css("display", "none");
        });
        $(".DeletePendingUser").click(function () {
            Actiontype = "Pending Users"
            url = Config.portalUrl + "/sharing/rest/community/users";
            var queryParams = {
                q: "lastLogin:- 1",// AND orgid:" + sesstionItem.portalid,
                token: portalToken,
                f: "json",
                sortField: "username",
                sortOrder: "asc"
            };
            var options = {
                query: queryParams,
                responseType: "json"
            };
            EsriRequest_users(options)

        })
        $(".DeleteInvitation").click(function () {
            var invitationlist = [];
            if (selectedUsers.length == 0) {
                AlertMessages("Invitations", "Please select user for deleting invitations", "warning");
                return;
            }
            Actiontype = "User invites"
            for (var i = 0; i < selectedUsers.length; i++) {
                var url = Config.portalUrl + "/sharing/rest/community/users/" + selectedUsers[i] + "/invitations";
                var queryParams = {
                    token: portalToken,
                    f: "json"
                };
                var options = {
                    query: queryParams,
                    responseType: "json"
                };
                count = 0;
                esriRequest(url, options)
                    .then(function (response) {
                        count++;
                        invitationlist = invitationlist.concat(response.data.userInvitations);
                        if (count == selectedUsers.length) {
                            if (invitationlist.length == 0) {
                                AlertMessages("Invitations", "No pending invitations are found", "warning");
                                return
                            }
                            getGroupList(invitationlist);
                            breadcrum_Label("Delete invitations")
                            count = 0;
                            console.log(invitationlist);
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
            }

        });
        $(".Invitetogroups").click(function () {
            if (selectedUsers.length == 0) {
                AlertMessages("Invite", "Please select user for adding to groups", "warning");
                return;
            }
            Actiontype = 'InviteusertoGroups';
            count = 0;
            getGroupList(groupList);
        })
        $(".Uninvitefromgroups").click(function () {
            if (selectedUsers.length == 0) {
                AlertMessages("Uninvite", "Please select user for removing from groups", "warning");
                return;
            }
            Actiontype = 'UnInviteuserfromGroups';
            count = 0;
            temparray = [];
            for (var i = 0; i < groupList.length; i++) {
                for (var j = 0; j < selectedUsers.length; j++) {
                    if (groupList[i].groupmembers.indexOf(selectedUsers[j]) != -1) {

                        temparray.push(groupList[i]);
                        break

                    }
                }
            }
            if (temparray.length == 0) {
                AlertMessages("Uninvite Users", "No groups Found", "warning");
                return;
            }
            getGroupList(temparray);
        })
        $(".AddTagstoUsers").click(function (e) {
            if (selectedUsers.length == 0) {
                AlertMessages("Tags", "Please select user for adding tags", "warning");
                return;
            }
            Actiontype = 'AddTags';
            count = 0;
            selectedItemsList = [];
            getUserInformation(sesstionItem.username);
            breadcrum_Label("Add Tags to User");
            HideUserTable();
            $(".users_radbtn").css("display", "block");
            $(".users_radbtn .title1")[0].innerText = "Add to Tags";
            $(".users_radbtn .title2")[0].innerText = "Replace Tags";
        });
        $(".RemoveTagsfromUsers").click(function (e) {
            if (selectedUsers.length == 0) {
                AlertMessages("Tags", "Please select user for removing tags", "warning");
                return;
            }

            Actiontype = 'RemoveTags';
            count = 0;
            temparray = [];
            var str = '';
            var Tags = []
            for (var i = 0; i < selectedUsers.length; i++) {
                for (var j = 0; j < usersList.length; j++) {
                    if (selectedUsers[i] == usersList[j].username) {
                        if (usersList[j].tags.length == 1) {
                            temparray.push({ "username": usersList[j].username, "Tags": usersList[j].tags.join(",") })
                            str = str + usersList[j].username + ",";
                        }
                        Tags = usersList[j].tags.concat(Tags);
                    }
                }
            }
            if (str != '') {
                str = str.replace(/,\s*$/, "");
                AlertMessages("Remove Tags", str + " has only single tag,please select user with multiple tags", "warning");
                return;
            }
            if (Tags.length == 0) {
                AlertMessages("Remove Tags", "No Tags are found for removing", "warning");
                return;
            };
            var uniqueNames = [];
            $.each(Tags, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            Tags = uniqueNames;
            breadcrum_Label("Remove Tags from User");
            CheckBoxController(Tags, "Remove Tags")
            var seen = {};
            $('.sel_tags span').each(function () { // filtering duplicate items
                var txt = $(this).text();
                if (seen[txt])
                    $(this).remove();
                else
                    seen[txt] = true;
            });
            $(".users_radbtn").css("display", "none");
        });

        $("#uploadUsers1").click(function (evt) {
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
            if (regex.test($("#inputGroupFile01").val().toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var JsonData;
                        if ($("#inputGroupFile01")[0].files[0].type != "application/json") {
                            JsonData = JSON.parse(csvJSON(e.target.result));
                        }
                        if ($("#inputGroupFile01")[0].files[0].type == "application/json") {
                            JsonData = JSON.parse(e.target.result);
                        }
                        temparray = JsonData;
                        var requiredfields = ["firstname", "lastname", "email", "username", "role", "userType", "userLicenseType", "access"];
                        if (sesstionItem.type == "PortalforArcgis") {
                            requiredfields = ["firstname", "lastname", "email", "username", "role", "access"];
                        }

                        var validStr = [];
                        var importedUsers = [];
                        Actiontype = "importUser";
                        for (var i = 0; i < JsonData.length; i++) {
                            for (var j = 0; j < requiredfields.length; j++) {
                                if (typeof (JsonData[i][requiredfields[j]]) != "undefined") {
                                    if (requiredfields[j] == "username")
                                        importedUsers.push(JsonData[i][requiredfields[j]]);
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
                            AlertMessages("Import users", validStr, "danger");
                            return
                        }
                        ValidateUserName(importedUsers.join(","))


                    }
                    reader.readAsText($("#inputGroupFile01")[0].files[0]);
                } else {
                    AlertMessages("", "This browser does not support HTML5.", "danger");
                }
            } else {
                AlertMessages("File Upload", "Please upload a valid CSV or JSON file.", "danger");
            }
        });

        $("#ExportUsersCsv").click(function () { // export users to csv 
            Actiontype = "ExportUserCsv";
            if (selectedUsers.length == 0) {

                AlertMessages("Export user", "Please select user for exporting", "warning");
                return

            }
            breadcrum_Label("Export Users");
            CheckBoxController(userParameters, "Export Users");
        });
        $("#ExportUsersJson").click(function () { // export users to Json     
            Actiontype = "ExportUserJson";
            if (selectedUsers.length == 0) {
                AlertMessages("Export user", "Please select user for exporting", "warning");
                return;
            }
            breadcrum_Label("Export Users");
            CheckBoxController(userParameters, "Export Users");
        });
        $("#ExportRolesCsv").click(function () { // export roles to csv  
            Actiontype = "ExportRolesCsv";
            if (customroles.length == 0) {
                AlertMessages("Export roles", "No custom roles are found for exporting", "warning");
                return;
            }
            breadcrum_Label("Export Roles");
            CheckBoxController(customroles, "Export roles");

        });
        function SelectedUserrole() {
            var roles = [];
            if (selectedUsers.length > 0) { // get selected user roles
                for (var i = 0; i < selectedUsers.length; i++) {
                    for (var j = 0; j < usersList.length; j++) {
                        if (selectedUsers[i] == usersList[j].username) {
                            for (var k = 0; k < rolesData.length; k++) {
                                if (rolesData[k].id = usersList[j].role) {
                                    roles.push(rolesData[k]);
                                    break;
                                }

                            }

                        }
                    }

                }
                //var result = roles.reduce((unique, o) => {
                //    if (!unique.some(obj => obj.name === o.name)) {
                //        unique.push(o);
                //    }
                //    return unique;
                //}, []);

            }
            return result;
        }
        $("#ExportRolesJson").click(function () {  // export roles to Json     
            Actiontype = "ExportRolesJson";
            if (customroles.length == 0) {
                AlertMessages("Export roles", "No custom roles are found for exporting", "warning");
                return;
            }
            breadcrum_Label("Export Roles");
            CheckBoxController(customroles, "Export roles");
        });
        $(".DeleteUsers").click(function () {
            if (selectedUsers.length == 0) {
                AlertMessages("Delete User", "Please select atleast one user", "warning");
                return;
            }
            Actiontype = "DeleteUser";
            count = 0;
            const swalWithBootstrapButtons = swal.mixin({
                confirmButtonClass: 'btn btn-success mb-2',
                cancelButtonClass: 'btn btn-danger mr-2 mb-2',
                buttonsStyling: false,
            });
            errcount = 0;
            swalWithBootstrapButtons({
                title: 'Delete User',
                text: "Do you want to delete selected users?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No!',
                reverseButtons: true
            }).then(function (result) {
                if (result.value) {
                    for (var i = 0; i < selectedUsers.length; i++) {
                        for (var j = 0; j < usersList.length; j++) {
                            if (selectedUsers[i] == usersList[j].username) {
                                url = Config.portalUrl + "/sharing/rest/community/users/" + usersList[j].username + "/delete";
                                var options = {
                                    token: portalToken,
                                    f: "json",
                                    responseType: "json",
                                    method: "post"
                                };
                                _AjaxRequest_users(options, "Delete User")
                            }
                        }
                    }
                } else if (
                    // Read more about handling dismissals
                    result.dismiss === swal.DismissReason.cancel
                ) {

                }
            });

        })
        function CheckBoxController(data, Label) {
            $('input[name="rad"]').click(function () {
                var $radio = $(this);
                $radio.siblings('input[name="userinvite"]').data('waschecked', false);
            });
            temparray = data;
            $("#Wizard_Users").show();
            $("#GroupInfo").hide();
            $("#EditUser").hide();
            $("#MainCard").hide();
            var checkboxNode = ' <div class="form-row sel_Allchkbox">' +
                '<div class="col-md-4 text-center1" >' +
                '<div class="custom-control custom-checkbox mb-0" style="position:absolute;bottom:0px">' +
                '<input type="checkbox" id="customcheckboxInline5"  name="customcheckboxInline1" class="custom-control-input selectallFields" />' +
                '<label class="custom-control-label" for="customcheckboxInline5">Select All</label> </div></div>' +

                '<div class="col-md-4 text-center1 userradio_btn"></div>' +
                '<div class="col-md-4 text-center1 userTags_btn"></div>' +

                '</div > <hr class="mb-0 pb-0">';


            var subCheckboxNode = '<div class="form-row mt-4 sel_Fields">';
            for (var i = 0; i < data.length; i++) {
                if (Label == "Export Users") {

                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].Key + '" name = "' + data[i].Key + '" class="custom-control-input selectFields" value= ' + data[i].Key + '>'
                        + '<label class="custom-control-label" for="' + data[i].Key + '"> <span class="contOverflow">' + data[i].Name + ' </span> </label></div ></div>'

                }
                else if (Label == "Export roles") {

                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id ="' + data[i].name + '" name = "' + data[i].id + '" class="custom-control-input selectFields" value= ' + data[i].id + '>'
                        + '<label class="custom-control-label" for="' + data[i].name + '"> <span class="contOverflow">' + data[i].name + '</span></label></div></div>'

                }
                else if (Label == "Add Tags") {

                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i].tag + '"  name = "' + data[i].tag + '"  class="custom-control-input selectFields" value= ' + data[i].tag + '>'
                        + '<label class="custom-control-label" for="' + data[i].tag + '"> <span class="contOverflow">' + data[i].tag + '</span> </label></div></div>'

                }
                else {

                    subCheckboxNode = subCheckboxNode + '<div class="col-md-4 col-sm-9 "><div class="custom-control custom-checkbox mb-1">' +
                        '<input type = "checkbox" id = "' + data[i] + '"  name = "' + data[i] + '"  class="custom-control-input selectFields" value= "' + data[i] + '">'
                        + '<label class="custom-control-label" for="' + data[i] + '"> <span class="contOverflow">' + data[i] + ' </span></label></div></div>'

                }
            }
            subCheckboxNode = subCheckboxNode + "</div>";
            $("#GroupItemsContol").empty();
            if (Label == "Add Tags") {
                var button = '<div class="tagsSec col-md-12"><div class="form-row d-flex justify-content-end"><input type="text" class="Tagcontent form-control form-control-sm col-md-4 mr-1"/> <button id="CreatenewTag" class="addTagbtn btn btn-primary btn-sm">Add tag</button></div></div>'

            }
            $("#GroupItemsContol").append(checkboxNode).append(subCheckboxNode);
            $(".wizard_header")[0].innerText = Label;
            $(".userTags_btn").append(button);
            HideUserTable();
            Checkboxclickevent();
            $("#CreatenewTag").click(function (evt) {
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
                temparray.push({ "tag": newTagtext });
                CheckBoxController(temparray, "Add Tags")
                AlertMessages("Add tags", $(".Tagcontent")[0].value + " tag added to below list", "success");
                $(".Tagcontent")[0].value = '';

            });
            $(".getselectetitems").addClass("disbaleClass");
            $(".userradio_btn").append(userradioButtons);
            $("#GroupItemsContol").removeClass("jsgrid");
            $(".userradio_btn").removeClass("mb-2");
        }

        function Checkboxclickevent() {
            $(".sel_Allchkbox").click(function (evt) {  // check or uncheck all checkbox
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
                    //validating tags removal               
                    if (Actiontype == 'RemoveTags') {
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
                //selectallFields
                if (selectedItemsList.length == 0) {
                    $(".getselectetitems").addClass("disbaleClass");
                }
                if (selectedItemsList.length != 0) {
                    $(".getselectetitems").removeClass("disbaleClass");
                    //validating tags removal   
                    if (Actiontype == 'RemoveTags') {
                        var RemovalFlag = validateTagsRemoval();
                        if (!RemovalFlag) {
                            $(".getselectetitems").addClass("disbaleClass");
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
            for (var i = 0; i < selectedUsers.length; i++) {
                for (var k = 0; k < usersList.length; k++) {
                    if (selectedUsers[i] == usersList[k].username) {
                        var tagcount = 0;
                        for (var m = 0; m < tags.length; m++) {
                            if (usersList[k].tags.indexOf(tags[m]) != -1) {
                                tagcount++;
                            }
                        }
                        if (tagcount == usersList[k].tags.length) {
                            ErrList.push(usersList[k].username);
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

        function getUserExportData() {//prepare exporting user data
            var users = []; //usersList
            if (selectedUsers.length > 0) {
                for (var i = 0; i < selectedUsers.length; i++) {
                    for (var j = 0; j < usersList.length; j++) {
                        if (selectedUsers[i] == usersList[j].username) {
                            users.push(usersList[j]);
                            break;
                        }
                    }

                }
            }
            if (users.length == 0) {
                users = usersList;
            }
            var exportData = [];

            for (var j = 0; j < users.length; j++) {
                var exportoptions = {};
                for (var k = 0; k < selectedItemsList.length; k++) {
                    for (var m = 0; m < userParameters.length; m++) {
                        if (userParameters[m].Key == selectedItemsList[k]) {

                            if (typeof (users[j][selectedItemsList[k]]) == "object") {
                                exportoptions[userParameters[m].exportLabel] = (users[j][userParameters[m].Key] != null) ? users[j][userParameters[m].Key].join(" ") : null;
                            }
                            else {
                                if (userParameters[m].Key == "created" || userParameters[m].Key == "modified" || userParameters[m].Key == "lastLogin") {
                                    exportoptions[userParameters[m].exportLabel] = new Date(users[j][userParameters[m].Key]).toLocaleDateString()
                                }
                                else {
                                    exportoptions[userParameters[m].exportLabel] = users[j][userParameters[m].Key];
                                }

                            }
                            break;
                        }
                    }
                }
                exportData.push(exportoptions);
            }
            return exportData;

        };

        function getUserInformation(userid) {
            if (Actiontype == 'view' || Actiontype == "edit") {
                if (userLicenseList.length > 0)
                    $(".User-Lic").css("display", "block");
                if (sesstionItem.type == "PortalforArcgis") {
                    $(".User-Lic").css("display", "none");
                }
                for (var i = 0; i < usersList.length; i++) {
                    if (userid == usersList[i].username) {
                        $(".userName")[0].value = usersList[i].username;
                        $(".useremail")[0].value = usersList[i].email;
                        $(".userFirstname")[0].value = usersList[i].firstName;
                        $(".userlastname")[0].value = usersList[i].lastName;
                        $("#userrole")[0].value = usersList[i].role;
                        $("#Useraccess")[0].value = usersList[i].access;
                        if (sesstionItem.type != "PortalforArcgis") {
                            if (userLicenseList.length > 0)
                                $("#userLicense")[0].value = usersList[i].userLicenseTypeId;
                            $("#userType")[0].value = usersList[i].userType;
                        }

                        $(".UserDesc")[0].value = usersList[i].description;
                        var tags = usersList[i].tags;

                        $.each(tags, function (index, value) {
                            $('.UserTags').tagsinput('add', value);
                        });
                        break;
                    }
                }
            }
            else {
                $("#loader").css("display", "inline-block");
                if (Actiontype == "AddTags")
                    url = Config.portalUrl + "/sharing/rest/community/users/" + sesstionItem.username + "/tags";

                var queryParams = {
                    f: "json",
                    token: portalToken
                };
                var options = {
                    query: queryParams,
                    responseType: "json"

                };
                EsriRequest_users(options);
            }
        };
        function ShowUserTable() {
            $("#GroupInfo").hide();
            $("#EditUser").hide();
            $("#MainCard").show();
            $("#Wizard_Users").hide();
            $("#wizard_itemstab").css("display", 'block');
            $("#wizard_Successtab").css("display", 'none');
            $("#wizard_Successtab").css("opacity", "0");
            $("#wizard_itemstab").css("opacity", "1");
            $("#SelectItems").addClass("active");
            $("#Confirm").removeClass("active");
            $("#Finish").removeClass("active");
            $(".Sub_page_size").css("display", "none");
            setProgressBar(1);
        };
        function HideUserTable() {
            $("#GroupInfo").hide();
            $("#EditUser").hide();
            $("#MainCard").hide();
            $("#Wizard_Users").show();
            $("#wizard_itemstab").css("display", '');
            $("#wizard_Successtab").css("opacity", "0");
            $("#wizard_itemstab").css("opacity", "1");
            $("#SelectItems").addClass("active");
            $("#Confirm").removeClass("active");
            $("#Finish").removeClass("active");
            setProgressBar(1);
        };
        $("#ReturnHome").click(function () {
            $(".lds-ring").css("display", "block");
            usersList = [];
            current = 1;
            setProgressBar(current);
            $("#grdUsers").empty();
            $(".failure_msg")[0].innerText = "Failed to update Users";
            $("#migrate-success").css("display", "none");
            $("#migrate-fail").css("display", "none");
            $(".selectedusersdiv").css("display", "block");
            ErrList = [];
            temparray = [];
            fetchAllUsers();
            ShowUserTable();
            $("#GroupInfo").hide();
            $("#EditUser").hide();
            $("#MainCard").show();
            $("#Wizard_Users").hide();
            $(".import_usr").removeClass('col-md-12').addClass('col-md-6');
        });
        $("#saveUseroptions").click(function () {
            count = 0;
            $(".success_msg")[0].innerText = "Successfully Updated Users";
            $("#loader").css("display", "inline-block");
            if (Actiontype == 'ExportRolesCsv' || Actiontype == "ExportRolesJson") {
                count = 0;
                var data = [];
                for (var i = 0; i < rolesData.length; i++) {
                    for (var j = 0; j < selectedItemsList.length; j++) {
                        if (rolesData[i].id == selectedItemsList[j]) {

                            var options = {
                                id: rolesData[i].id,
                                Name: rolesData[i].name,
                                Description: rolesData[i].description,
                                CreatedDate: new Date(rolesData[i].created).toLocaleDateString(),
                                ModifiedDate: new Date(rolesData[i].modified).toLocaleDateString()
                            }
                            options.Privilages = rolesData[i].privileges.join("&")
                            data.push(options);
                            break
                        }
                    }
                }
                if (Actiontype == 'ExportRolesCsv') {
                    DownloadCsv("PortalRoles", data);
                    showSuccessDiv();
                }
                if (Actiontype == 'ExportRolesJson') {
                    data = JSON.stringify(data, null, "\t");
                    DownloadJson("PortalRoles", data);
                    showSuccessDiv();
                }
                AlertMessages("Export Roles", "Successfully exported Roles", "success");
                $(".success_msg")[0].innerText = "Successfully Exported Roles";
            }
            if (Actiontype == 'ExportUserCsv' || Actiontype == 'ExportUserJson') {
                var data = getUserExportData();
                if (Actiontype == 'ExportUserCsv') {
                    DownloadCsv("PortalUsers", data);
                    showSuccessDiv();
                }
                else {
                    data = JSON.stringify(data, null, "\t");
                    DownloadJson("PortalUsers", data);
                    showSuccessDiv();
                }
                AlertMessages("Export Users", "Successfully exported Users", "success");
                $(".success_msg")[0].innerText = "Successfully Exported Users";
            }
            if (Actiontype == 'AddTags' || Actiontype == "RemoveTags") {
                var tags = selectedItemsList;
                ErrList = [];
                for (var i = 0; i < selectedUsers.length; i++) {
                    for (var k = 0; k < usersList.length; k++) {
                        if (selectedUsers[i] == usersList[k].username) {
                            url = Config.portalUrl + "/sharing/rest/community/users/" + usersList[k].username + "/update";
                            if (Actiontype == "RemoveTags") {
                                var tagcount = 0;
                                for (var m = 0; m < tags.length; m++) {
                                    if (usersList[k].tags.indexOf(tags[m]) != -1) {
                                        tagcount++;
                                    }
                                }
                                if (tagcount == usersList[k].tags.length) {
                                    ErrList.push(usersList[k].username);
                                }
                                var tagslist = []
                                for (var m = 0; m < tags.length; m++) {
                                    if (usersList[k].tags.indexOf(tags[m]) > 0) {
                                        usersList[k].tags.splice(usersList[k].tags.indexOf(tags[m]), 1)
                                    }
                                }
                                tagslist = usersList[k].tags;
                            }
                            if (Actiontype == "AddTags") {
                                if ($(".addTagsrad")[0].checked) {
                                    var tagslist = tags.concat(usersList[k].tags);
                                }
                                else { // if choosen replace tags
                                    var tagslist = tags;
                                }
                            }
                            var useroption = {
                                tags: tagslist.join(","),
                                f: "json",
                                token: portalToken
                            };
                            var options = {
                                tags: tagslist.join(","),
                                f: "json",
                                token: portalToken,
                                responseType: "json",
                                method: "post"
                            };
                            if (Actiontype == 'AddTags') {
                                _AjaxRequest_users(options, "Add Tags");
                            }
                            if (Actiontype == 'RemoveTags') {
                                _AjaxRequest_users(options, "Remove Tags");
                            }
                        }
                    }
                }
            }
            if (Actiontype == 'InviteusertoGroups' || Actiontype == 'UnInviteuserfromGroups') {
                var usernamelist = [];
                for (var i = 0; i < selectedItemsList.length; i++) {
                    if (Actiontype == 'InviteusertoGroups') {
                        if ($(".ReplaceTagsrad")[0].checked)//$(".useinvitation")[0].checked)
                            url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItemsList[i] + "/invite";
                        else
                            url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItemsList[i] + "/addUsers";
                    }
                    if (Actiontype == 'UnInviteuserfromGroups')
                        url = Config.portalUrl + "/sharing/rest/community/groups/" + selectedItemsList[i] + "/removeUsers";
                    var userOptions = {
                        users: selectedUsers.join(","),
                        f: "json",
                        token: portalToken
                    };
                    var options = {
                        query: userOptions,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_users(options);
                    $(".users_radbtn").css("display", "none");

                }
            }
            if (Actiontype == "Bulkupdate") {
                UpdateBulk();
            }
            if (Actiontype == "importUser") {
                var JsonData = temparray;

                url = Config.portalUrl + "/sharing/rest/portals/self/invite";
                var Userlist = {
                    "invitations": []
                };
                var requiredfields = ["firstname", "lastname", "email", "username", "role", "userType", "userLicenseType", "access"];
                if (sesstionItem.type != "Arcgisonline") {
                    var requiredfields = ["firstname", "lastname", "email", "username", "role", "access"];
                }
                for (var i = 0; i < JsonData.length; i++) {
                    var useroptions = {
                        password: "Tarun@1994",
                        userCreditAssignment: -1,
                        applyActUserDefaults: false

                    }
                    for (var j = 0; j < requiredfields.length; j++) {
                        var info = JsonData[i][requiredfields[j]];

                        useroptions[requiredfields[j]] = (info != null && info != undefined) ? JsonData[i][requiredfields[j]].trim() : "";
                    }
                    useroptions.fullname = useroptions.firstname + " " + useroptions.lastname;
                    temparray = JsonData;
                    Userlist.invitations.push(useroptions)
                }
                var options = {
                    invitationList: JSON.stringify(Userlist),
                    f: "json",
                    token: portalToken,
                    responseType: "json",
                    method: "post"
                };
                count = 0;
                _AjaxRequest_users(options, "Import Users");
            }
            if (Actiontype == "Pending Users") {
                Actiontype = "Delete pending user";
                for (var j = 0; j < selectedItemsList.length; j++) {
                    url = Config.portalUrl + "/sharing/rest/community/users/" + selectedItemsList[j] + "/delete";
                    var queryParams = {
                        token: portalToken,
                        f: "json"
                    };
                    var options = {
                        query: queryParams,
                        responseType: "json",
                        method: "post"
                    };
                    _AjaxRequest_users(options, "Delete Pending User");
                }

            }
            if (Actiontype == "User invites") {
                for (var j = 0; j < selectedItemsList.length; j++) {
                    url = Config.portalUrl + "/sharing/rest/community/users/" + selectedItemsList[j].username + "/invitations/" + selectedItemsList[j].targetId + "/decline";
                    var queryParams = {
                        token: portalToken,
                        f: "json"
                    };
                    var options = {
                        query: queryParams,
                        responseType: "json",
                        method: "post"
                    };
                    EsriRequest_users(options);
                }
            }
        })

        function loadUsers_jsgrid(results) {
            var usersData = [];
            var users = results;
            usersList = users;
            var rolesinfo = [{ name: "Select", id: "" }]
            for (var i = 0; i < rolesData.length; i++) {
                rolesinfo.push({ name: rolesData[i].name, id: rolesData[i].name });
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
                    return $("<div>").append(this._fromPicker);
                },
                filterValue: function () {
                    return {
                        from: this._fromPicker.datepicker("getDate"),

                    };
                }
            });

            jsGrid.fields.date = DateField;

            if (typeof (users) != "undefined") {

                for (var i = 0; i < users.length; i++) {
                    if (users[i].email != "support@esri.com" && users[i].email != "system_publisher@change.me") {
                        var userObj = {
                            userid: users[i].username,
                            UserName: users[i].username,
                            Description: users[i].description,
                            UserType: users[i].userType,
                            UserLicenseTypeId: users[i].userLicenseTypeId,
                            Tags: users[i].tags,
                            Access: users[i].access,
                            Level: users[i].level,
                            Role: users[i].role,
                            Email: users[i].email,
                            FirstName: users[i].firstName,
                            LastName: users[i].lastName,
                            FullName: users[i].fullName,
                            Provider: users[i].provider,
                            Region: users[i].region,
                            CreatedDate: users[i].created,
                            LastLogin: users[i].lastLogin //(new Date(users[i].lastLogin).toLocaleDateString() == "1/1/1970") ? "Not yet logined" : new Date(users[i].lastLogin).toLocaleDateString()
                        };
                        for (var j = 0; j < rolesData.length; j++) {
                            if (users[i].role == rolesData[j].id) {
                                userObj.Role = rolesData[j].name
                                break
                            }
                        }
                        usersData.push(userObj);
                    }
                }
            }
            if (usersData.length > 0) {
                $("#grdUsers").jsGrid({
                    width: "100%",
                    height: "auto",
                    filtering: true,
                    inserting: false,
                    editing: false,
                    sorting: true,
                    paging: true,
                    autoload: true,
                    pageSize: $("#pageSize").val(),
                    data: usersData,
                    controller: {
                        data: usersData,
                        loadData: function (filter) {
                            selectedUsers = [];

                            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
                            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
                            if (searchflag == false) {
                                $('#search').val("");

                                return $.grep(this.data, function (item) {
                                    if (item.Description == null) { item.Description = ""; }
                                    return ((!filter.UserName || item.UserName.toUpperCase().indexOf(filter.UserName.toUpperCase()) >= 0)
                                        && (!filter.UserType || item.UserType.toUpperCase().indexOf(filter.UserType.toUpperCase()) >= 0)
                                        && (!filter.Role || item.Role.toUpperCase().indexOf(filter.Role.toUpperCase()) >= 0)
                                        && (!filter.Description || item.Description.toUpperCase().indexOf(filter.Description.toUpperCase()) >= 0)
                                        && (!filter.Level || item.Level.toUpperCase().indexOf(filter.Level.toUpperCase()) >= 0)
                                        && (!filter.CreatedDate.from || new Date(item.CreatedDate).toDateString() == filter.CreatedDate.from.toDateString())
                                        && (!filter.LastLogin.from || new Date(item.LastLogin).toDateString() == filter.LastLogin.from.toDateString())
                                        //&& (!filter.Tags || item.Tags.map(value => value.toLowerCase()).includes(filter.Tags) == true)
                                        && (!filter.Tags || item.Tags.toString().toUpperCase().indexOf(filter.Tags.toUpperCase()) >= 0)
                                        && (!filter.Email || item.Email.toUpperCase().indexOf(filter.Email.toUpperCase()) >= 0)
                                        && (!filter.FirstName || item.FirstName.toUpperCase().indexOf(filter.FirstName.toUpperCase()) >= 0)
                                        && (!filter.LastName || item.LastName.toUpperCase().indexOf(filter.LastName.toUpperCase()) >= 0)
                                        && (!filter.FullName || item.FullName.toUpperCase().indexOf(filter.FullName.toUpperCase()) >= 0)
                                        && (!filter.Provider || item.Provider.toUpperCase().indexOf(filter.Provider.toUpperCase()) >= 0)
                                        && (!filter.Region || item.Region.toUpperCase().indexOf(filter.Region.toUpperCase()) >= 0)
                                        && (!filter.userLicenseTypeId || item.userLicenseTypeId.toUpperCase().indexOf(filter.userLicenseTypeId.toUpperCase()) >= 0)
                                        && (!filter.Access || item.Access == filter.Access));
                                });
                            } else {
                                searchflag = false;
                                return $.grep(this.data, function (item) {
                                    return ((!filter.UserName || item.UserName.toUpperCase().indexOf(filter.UserName.toUpperCase()) >= 0)
                                        || (!filter.UserType || item.UserType.toUpperCase().indexOf(filter.UserType.toUpperCase()) >= 0)
                                        || (!filter.Role || item.Role.toUpperCase().indexOf(filter.Role.toUpperCase()) >= 0)
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
                                return $("<input>").attr("type", "checkbox").attr("class", "singleCheckbox").attr("id", item.userid)
                                    .prop("checked", $.inArray(item.UserName, selectedUsers) > -1)
                                    .on("change", function () {
                                        $(this).is(":checked") ? selectItem($(this)[0].id) : unselectItem($(this)[0].id);
                                    });
                            },
                            align: "center",
                            width: 50,
                            sorting: false
                        },
                        {
                            name: "UserName", type: "text", title: "User Name", align: "left", visible: true,
                            itemTemplate: function (_, item) {
                                var $customViewButton = $("<a>").attr("class", "attrClass").attr("title", item.UserName).text(item.UserName)
                                    .click(function (e) {
                                        Actiontype = "view";
                                        $(".User_label")[0].innerText = "User Information";
                                        breadcrum_Label("User Information");
                                        getUserInformation(item.userid);

                                        var childElements = $("#usersForm .form-control");
                                        for (var i = 0; i < childElements.length; i++) {

                                            $(childElements[i]).prop('disabled', true);
                                        }
                                        $(".usr_footer").css("display", "none");
                                        $(".pass_sec").css("display", "none");
                                        $("#MainCard").css("display", "none");
                                        $("#EditUser").show();
                                    });
                                return $("<div>").append($customViewButton);
                            }
                        },
                        {
                            name: "Description", title: "Description", type: "text", align: "left", visible: true,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.Description).text(item.Description)
                            }
                        },
                        {
                            name: "UserType", type: "select", items: [{ name: "Select", id: "" }, { name: "arcgisonly", id: "arcgisonly" }, { name: "both", id: "both" }],
                            valueField: "id", textField: "name", title: "User Type", align: "left", visible: true,class:"multiselect"
                        },

                        { name: "UserLicenseTypeId", type: "text", title: "License Type", align: "left", visible: false },
                        {
                            name: "Tags", type: "text", align: "center", visible: false,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.Tags).text(item.Tags)
                            }
                        },
                        {
                            //name: "Access", type: "text", align: "center", visible: true,
                            name: "Access", type: "select", items: [{ name: "Select", id: "" }, { name: "Public", id: "public" }, { name: "Private", id: "private" }, { name: "Shared", id: "shared" }, { name: "Org", id: "org" }], valueField: "id", textField: "name", title: "Access", align: "left", visible: true,
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
                        { name: "Level", type: "text", align: "left", visible: true },
                        {
                            name: "Role", type: "select", items: rolesinfo, valueField: "id", textField: "name", title: "Role", align: "center", visible: true
                        },
                        {
                            name: "Email", type: "text", align: "left", visible: false,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.Email).text(item.Email)
                            }
                        },
                        {
                            name: "FirstName", title: "First Name", type: "text", align: "left", visible: false,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.FirstName).text(item.FirstName)
                            }
                        },
                        {
                            name: "LastName", title: "Last Name", type: "text", align: "left", visible: false,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.LastName).text(item.LastName)
                            }
                        },
                        {
                            name: "FullName", title: "Full Name", type: "text", align: "left", visible: false,
                            itemTemplate: function (_, item) {
                                return $("<a>").attr("class", "attrClass").attr("title", item.FullName).text(item.FullName)
                            }
                        },
                        {
                            name: "Provider", type: "select", items: [{ name: "Select", id: "" }, { name: "Arcgis", id: "arcgis" }, { name: "Enterprise", id: "enterprise" }], valueField: "id", textField: "name", title: "Provider", align: "left", visible: false

                        },
                        { name: "Region", type: "text", align: "left", visible: false },
                        {
                            name: "CreatedDate", type: "date", title: "Created Date", align: "center", visible: true,

                        },
                        {
                            name: "LastLogin", type: "date", title: "Last Login", align: "center", visible: true,
                            itemTemplate: function (value) {
                                var lastLogin = new Date(value).toLocaleDateString();
                                if (lastLogin == "1/1/1970") {
                                    return "Not yet logined";
                                }
                                return new Date(value).toLocaleDateString()
                            }
                        },

                        {
                            type: "control", width: 120, visible: true,
                            editButton: false, deleteButton: false,

                            itemTemplate: function (value, item) {
                                var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                                var TargetUrl = sesstionItem.portalurl + "/home/user.html?user=" + item.UserName;
                                var $customviewButton = $("<a>").attr("title", "View User").attr('href', TargetUrl).attr('target', '_blank').attr({ class: "Viewuser fa fa-eye text-primary" })
                                    .click(function (e) {

                                        e.stopPropagation();
                                    });

                                var $customUserEditButton = $("<a>").attr("title", "Edit User").attr({ class: "EditUser fa fa-edit text-primary" })
                                    .click(function (e) {
                                        Actiontype = "edit";
                                        $(".User_label")[0].innerText = "Edit User";
                                        breadcrum_Label("Edit User")
                                        $('.UserTags').tagsinput('removeAll');
                                        url = Config.portalUrl + "/sharing/rest/community/users/" + item.UserName + "/update";
                                        getUserInformation(item.userid);
                                        $(".bootstrap-tagsinput .tag").addClass("badge badge-primary");
                                        $(".bootstrap-tagsinput .tag").removeClass("label label-info");
                                        if (sesstionItem.type == "PortalforArcgis") {
                                            $(".usrType").css("display", "none");
                                        }
                                        $("#MainCard").css("display", "none");
                                        $(".clearUserinfo").click();
                                        $("#EditUser").show();
                                        $(".usr_footer").css("display", "");
                                        $(".pass_sec").css("display", "none");
                                        e.stopPropagation();
                                    });
                                var $customItemInfoButton = $("<a>").attr({ class: "Usergroups fa fa-sitemap text-primary" }).attr("title", "View User Groups ")
                                    .click(function (e) {
                                        $("#Usergroupinfo").empty();
                                        var hasgroup = false;
                                        var table = '<table class="table table-hover mt-0" ><thead class="p-0" style="background-color:#f9f9f9 !important"><tr><th scope="col" style="width: 30%">Titles</th><th scope="col" style="width: 30%">Access</th><th scope="col" style="width: 30%">Description</th><th scope="col" style="width: 30%">Owner</th><th scope="col" style="width: 30%">Created Date</th><th scope="col" style="width: 30%">Modified Date</th><tr></thead>'
                                        var groups = [];
                                        for (var i = 0; i < groupList.length; i++) {
                                            if (groupList[i].groupmembers.indexOf(item.userid) != -1) {

                                                groups.push(groupList[i]);
                                            }
                                        }
                                        if (groups.length == 0) {
                                            hasgroup = true;
                                            AlertMessages("User Groups", "No groups information is found", "warning");
                                            return;
                                        }
                                        var trRow = '';


                                        for (var k = 0; k < groups.length; k++) {
                                            var desc = '';
                                            if (groups[k].description != null && groups[k].description != undefined && groups[k].description != "null") {
                                                desc = groups[k].description;
                                            }

                                            trRow = trRow + '<tr>' +
                                                '<td class="text-dark">' + groups[k].title + '</td>' +
                                                '<td>' + groups[k].access + '</td>' +
                                                '<td>' + desc + '</td>' +
                                                '<td>' + groups[k].owner + '</td>' +
                                                '<td><span>' + new Date(groups[k].created).toLocaleDateString() + '</span></td>' +
                                                '<td>' + new Date(groups[k].modified).toLocaleDateString() + '</td>' +
                                                '</tr >';
                                        }


                                        table = table + '<tbody>' + trRow + '</tbody> </table>'
                                        $("#Usergroupinfo").append(table);//Groups Information
                                        breadcrum_Label("Groups Information");
                                        if (hasgroup)
                                            $("#Usergroupinfo").append("<span>No groups information is found</span>");
                                        $(".clearUserinfo").css("display", "block");
                                        $("#GroupInfo").show();
                                        $("#MainCard").hide()
                                        e.stopPropagation();
                                    });
                                var $customGroupUsersButton = $("<button>").attr({ class: "GroupUsers btn-info fa fa-users" })
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
                                var $customDeleteButton = $("<button>").attr({ class: "deleteGroup fa fa-trash-alt" })
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

                                return $("<div>").append($customviewButton).append($customUserEditButton).append($customItemInfoButton);//.append($customGroupUsersButton);
                            },
                            headerTemplate: function (e) {
                                return $("<div>").append($("<span>"));
                            }

                        }
                    ]
                });
                $(".clearUserinfo").click(function () {
                    $("#Usergroupinfo").empty();
                    $(".clearUserinfo").css("display", "none");
                });
                $("#search").keydown(function (event) {
                    searchflag = true
                    var uname = $("#search").val();
                    if (uname.length > 1) {
                        $("#grdUsers").jsGrid("search", { UserName: uname, UserType: uname, Role: uname, Access: uname }).done(function () { });
                    }
                    else {
                        $("#grdUsers").jsGrid("clearFilter").done(function () { });
                    }
                });

                var selectItem = function (item) {
                    $(".clearUserinfo").click();
                    selectedUsers.push(item);
                    if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                        $("#selectAllCheckbox").prop("checked", true);
                    } else {
                        $("#selectAllCheckbox").prop("checked", false);
                    }
                };
                var unselectItem = function (item) {
                    $(".clearUserinfo").click();
                    selectedUsers = $.grep(selectedUsers, function (i) {
                        return i !== item;
                    });
                    if (selectedUsers.length == 0) {
                        $('#selectAllCheckbox').attr('checked', false);
                    }
                    if ($(".singleCheckbox").length == $(".singleCheckbox:checked").length) {
                        $("#selectAllCheckbox").prop("checked", true);
                    } else {
                        $("#selectAllCheckbox").prop("checked", false);
                    }
                };
                $("#user_colums_list").empty();
                createShowHideColumns("#grdUsers", "#user_colums_list", "user_columns");
                $("#export_users").css("display", "block");

            }
            $("#pageSize").on('change', function (event) {
                $("#grdUsers").jsGrid("option", "pageSize", this.value);
            });
            $(".jsgrid-filter-row input:text").addClass("form-control").addClass("form-control-sm");
            $(".jsgrid-filter-row select").addClass("custom-select").addClass("custom-select-sm");
        }
        function ShowSelectedUsers() {
            $('#selected_users').empty();
            for (var i = 0; i < selectedUsers.length; i++) {
                var htmlContent = '<div class="dt-widget__item">' +
                    '<div class="dt-widget__info text-truncate">' +
                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + selectedUsers[i] + '</a>'
                $('#selected_users').append(htmlContent);

            }
        }
        $(".getselectetitems").click(function () {
            count = 0;
            $('#selected_items').empty();
            $(".selectedusersdiv").css("display", "block");
            var label;
            if (Actiontype == 'AddTags' || Actiontype == "RemoveTags" || Actiontype == 'ExportUserCsv' || Actiontype == 'ExportUserJson') {
                selectedItemsList = [];
                $(".sel_Fields input:checkbox:checked").each(function () {
                    selectedItemsList.push($(this).val());

                    var Value = $(this).val();
                    if (Actiontype == "ExportUserCsv" || Actiontype == "ExportUserJson") {
                        label = "Selected exporting fields";
                        for (var m = 0; m < userParameters.length; m++) {
                            if (userParameters[m].Key == Value) {
                                Value = userParameters[m].Name;
                                break;
                            }
                        }
                    }

                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + Value + '</a>'

                    $('#selected_items').append(htmlContent);

                })
                $(".itemcount")[0].innerText = selectedItemsList.length
                if (Actiontype == 'AddTags')
                    label = "Selected tags  for adding"
                if (Actiontype == "RemoveTags") {
                    label = "Selected tags  for removing";
                }
                if (Actiontype == "ExportRolesCsv" || Actiontype == "ExportRolesJson") {
                    label = "Selected roles for exporting"
                }

                $("#wizard_confirmtab .fs-title1")[0].innerText = label
            }
            else if (Actiontype == 'ExportRolesCsv' || Actiontype == "ExportRolesJson") {
                selectedItemsList = [];
                $(".import_usr").addClass('col-md-12').removeClass('col-md-6');
                $(".sel_Fields input:checkbox:checked").each(function () {
                    for (var i = 0; i < customroles.length; i++) {
                        if (customroles[i].id == $(this).val())
                            var roleLabel = customroles[i].name;
                    }
                    var htmlContent = '<div class="dt-widget__item">' +
                        '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="/images/150x150.png" alt="User"></div>' +
                        '<div class="dt-widget__info text-truncate">' +
                        '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + roleLabel + '</a>'
                    $('#selected_items').append(htmlContent);
                    selectedItemsList.push($(this).val());

                })
                $(".itemcount")[0].innerText = selectedItemsList.length;
                $(".selectedusersdiv").css("display", "none");

                if (Actiontype == "ExportRolesCsv" || Actiontype == "ExportRolesJson") {
                    label = "Selected roles for exporting"
                }
                $("#wizard_confirmtab .fs-title1")[0].innerText = label
            }
            else if (Actiontype == 'InviteusertoGroups' || Actiontype == 'UnInviteuserfromGroups') {

                selectedItemsList = $.grep(selectedItemsList, function (value) {
                    return value != "on";
                });

                for (var i = 0; i < selectedItemsList.length; i++) {
                    var Itemid = selectedItemsList[i];
                    for (var j = 0; j < groupList.length; j++) {
                        if (groupList[j].id == Itemid) {


                            var htmlContent = '<div class="dt-widget__item">' +
                                '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="/images/150x150.png" alt="User"></div>' +
                                '<div class="dt-widget__info text-truncate">' +
                                '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + groupList[j].title + '</a>'
                            $('#selected_items').append(htmlContent);

                        }
                    }
                }
                $(".itemcount")[0].innerText = selectedItemsList.length
                $("#wizard_confirmtab .fs-title1")[0].innerText = "Selected groups for removing users"
                if (Actiontype == 'InviteusertoGroups') {
                    $("#wizard_confirmtab .fs-title1")[0].innerText = "Selected groups for inviting users"
                }
            }
            else if (Actiontype == 'importUser') {
                $(".import_usr").addClass('col-md-12').removeClass('col-md-6');
                $(".selectedusersdiv").css("display", "none");
                for (var j = 0; j < selectedItemsList.length; j++) {
                    if (selectedItemsList[j] != "on") {
                        var htmlContent = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="/images/150x150.png" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate">' + selectedItemsList[j] + '</a>'
                        $('#selected_items').append(htmlContent);
                    }
                }
                $(".itemcount")[0].innerText = $('#selected_items')[0].childNodes.length;
                $("#wizard_confirmtab .fs-title1")[0].innerText = "Importing Users"
            }
            else if (Actiontype == "Bulkupdate") {
                var formdata = $("#bulkUserform").serializeArray();
                var node = '';
                for (var j = 0; j < formdata.length; j++) {
                    if (formdata[j].value != "" && formdata[j].name.toUpperCase() != "ROLE") {
                        node = '<div class="dt-widget__item">' +
                            '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="/images/150x150.png" alt="User"></div>' +
                            '<div class="dt-widget__info text-truncate">' +
                            '<a href="javascript:void(0)" class="dt-widget__title text-truncate"><b>' + formdata[j].name + '</b>:' + formdata[j].value + '</a>'
                        $('#selected_items').append(node);
                    }
                    else if (formdata[j].value != "" && formdata[j].name.toUpperCase() == "ROLE") {
                        for (var k = 0; k < rolesData.length; k++) {
                            if (formdata[j].value == rolesData[k].id) {
                                node = '<div class="dt-widget__item">' +
                                    '<div class="dt-widget__img"><img class="dt-avatar size-35"  src="/images/150x150.png" alt="User"></div>' +
                                    '<div class="dt-widget__info text-truncate">' +
                                    '<a href="javascript:void(0)" class="dt-widget__title text-truncate"><b>' + formdata[j].name + '</b>:' + rolesData[k].name + '</a>'
                                $('#selected_items').append(node);
                                break;
                            }
                        }
                    }
                }

                $(".itemcount")[0].innerText = $('#selected_items')[0].childNodes.length;//formdata.length
                $("#wizard_confirmtab .fs-title1")[0].innerText = "Selected parameters for updating"
            }
            else if (Actiontype == "Pending Users" || Actiontype == "User invites") {
                if (selectedItemsList.indexOf("on") != -1)
                    selectedItemsList.splice(selectedItemsList.indexOf("on"), 1);
                for (var i = 0; i < selectedItemsList.length; i++) {
                    var Itemid = selectedItemsList[i];
                    if (Actiontype == "User invites") {
                        for (var m = 0; m < PortalGroups.length; m++) {
                            if (Itemid.targetId == PortalGroups[m].id)
                                Itemid = PortalGroups[m].title;
                        }
                    }
                    var list = document.createElement("li");
                    list.className = "group-item-list";
                    list.textContent = Itemid;
                    $('#selected_items').append(list);

                }
                $(".itemcount")[0].innerText = selectedItemsList.length
                if (Actiontype == "User invites") {
                    var listForRemove = [];
                    var listOfUniqe = [];
                    $('#selected_items li').each(function () {

                        var text = $(this).text().trim();

                        if (listOfUniqe.indexOf(text) === -1)
                            listOfUniqe.push(text);
                        else
                            listForRemove.push($(this));
                    });

                    $(listForRemove).each(function () { $(this).remove(); });
                    $(".itemcount")[0].innerText = listOfUniqe.length;
                }

                if (Actiontype == "User invites")
                    $("#wizard_confirmtab .fs-title1")[0].innerText = "User Invitations"
                else
                    $("#wizard_confirmtab .fs-title1")[0].innerText = "Delete Pending Users"

            }
            else if (Actiontype == "User invites1") {
                if (selectedItemsList.indexOf("on") != -1)
                    selectedItemsList.splice(selectedItemsList.indexOf("on"), 1);
                for (var i = 0; i < selectedItemsList.length; i++) {
                    for (var j = 0; j < groupList[j].length; j++) {
                        if (groupList[j].id == selectedItemsList[i]) {
                            var list = document.createElement("li");
                            list.className = "group-item-list";
                            list.textContent = groupList[j].name;
                            $('#selected_items').append(list);
                        }
                    }
                }
                $(".itemcount")[0].innerText = selectedItemsList.length;
                $("#wizard_confirmtab .fs-title1")[0].innerText = "Delete Invitations"

            }
            ShowSelectedUsers();
            $(".usrcount")[0].innerText = selectedUsers.length;
        });


        function EsriRequest_users(options) {
            try {
                esriRequest(url, options)
                    .then(function (response) {
                        count++
                        url = "";
                        if (Actiontype == 'Bulkupdate') {
                            if (count == requestList.length) {
                                AlertMessages("Update Users", "Users updated successfully", "success");
                                showSuccessDiv();
                            }
                        }
                        if (Actiontype == 'AddTags') {
                            CheckBoxController(response.data.tags, "Add Tags");
                            $("#loader").css("display", "none");
                        }
                        if (Actiontype == "InviteusertoGroups") {
                            if (typeof (response.data.notAdded) != "undefined")
                                ErrList = ErrList.concat(response.data.notAdded);
                            if (count == selectedItemsList.length) {
                                var uniqueNames = [];
                                $.each(ErrList, function (i, el) {
                                    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                                });
                                ErrList = uniqueNames;
                                if (ErrList.length != 0) {
                                    var notaddedList = ErrList; var messagestr = '';
                                    for (var i = 0; i < notaddedList.length; i++) {
                                        if (notaddedList[i] != sesstionItem.username) {
                                            messagestr = messagestr + notaddedList[i] + ","
                                        }
                                    }



                                    if (ErrList.length == selectedUsers.length && ErrList.indexOf(sesstionItem.username) != -1) {
                                        $(".failure_msg")[0].innerText = "Failed to invite users";
                                        showfailureDiv();
                                    }
                                    else if (ErrList.length != selectedUsers.length && ErrList.length != 0 && ErrList.indexOf(sesstionItem.username) != -1) {
                                        AlertMessages("Invite users", "Successfully invited user with some errors", "success");
                                        showSuccessDiv();
                                    }
                                    else {
                                        AlertMessages("Invite users", "Invited users successfully", "success");
                                        showSuccessDiv();
                                    }
                                }
                                else {
                                    AlertMessages("Invite users", "Invited users successfully", "success");
                                    showSuccessDiv();
                                }

                                for (var m = 0; m < groupList.length; m++) {
                                    fetchGroupUsers(groupList[m].id);
                                }
                            }
                        }
                        if (Actiontype == "UnInviteuserfromGroups") {
                            ErrList = ErrList.concat(response.data.notRemoved);
                            if (count == selectedItemsList.length) {
                                var uniqueNames = [];
                                $.each(ErrList, function (i, el) {
                                    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                                });
                                ErrList = uniqueNames;
                                if (ErrList.length != 0 && selectedUsers.length == ErrList.length) {
                                    var notremovedList = ErrList; var messagestr = '';
                                    if (ErrList.length == 1 && ErrList[0] == sesstionItem.username) {
                                        $(".failure_msg")[0].innerText = "Unable to remove group owner:" + sesstionItem.username + " from selected groups";
                                        showfailureDiv();
                                    }
                                    for (var i = 0; i < notremovedList.length; i++) {
                                        if (notremovedList[i] != sesstionItem.username) {
                                            messagestr = messagestr + notremovedList[i] + ","
                                        }
                                    }

                                    if (messagestr != '') {
                                        messagestr = messagestr.replace(/,\s*$/, "");
                                        AlertMessages("Uninvite users from groups", "Unable to remove " + messagestr + " from groups", "danger");
                                        $(".failure_msg")[0].innerText = "Unable to remove " + messagestr + " from groups"
                                        showfailureDiv()
                                    }

                                }
                                else {
                                    AlertMessages("Uninvite users", "Removed users successfully", "success");
                                    showSuccessDiv();
                                }
                            }
                            for (var m = 0; m < groupList.length; m++) {
                                fetchGroupUsers(groupList[m].id);
                            }
                        }
                        if (Actiontype == 'AddUsertags') {
                            if (count == selectedUsers.length) {
                                AlertMessages("Add Tags", "Added Tags successfully", "success");
                                $(".users_radbtn").css("display", "none");
                                showSuccessDiv();
                            }
                        }
                        if (Actiontype == 'RemoveUsertags') {
                            if (count == selectedUsers.length) {
                                if (ErrList.length != 0) {
                                    AlertMessages("Remove Tags", "Failded to remove tags from " + ErrList.join(","), "danger");
                                    $(".failure_msg")[0].innerText = "Faied to remove tags from " + ErrList.join(",");
                                    if (ErrList.length == selectedUsers.length) {

                                        showfailureDiv();
                                    }
                                    else {
                                        AlertMessages("Remove Tags", "Removed Tags successfully", "success");
                                        showSuccessDiv();
                                    }

                                }

                                else {
                                    AlertMessages("Remove Tags", "Removed Tags successfully", "success");
                                    showSuccessDiv();
                                }

                            }
                        }
                        if (Actiontype == 'DeleteUser') {
                            if (count == selectedUsers.length)
                                AlertMessages("Delete User", "User deleted successfully", "success");
                            fetchAllUsers();

                        }
                        if (Actiontype == "updateuser") {
                            if (count == temparray.length) {
                                AlertMessages("Import users", "Imported users Successfully", "success");
                            }
                        }
                        if (Actiontype == "edit") {
                            AlertMessages("Update users", "Updated users Successfully", "success");
                            fetchAllUsers();
                            ShowUserTable();
                        }
                        if (Actiontype == "updateCreateduser") {
                            AlertMessages("Create users", "Created users Successfully", "success");
                            ShowUserTable();
                            fetchAllUsers();
                        }
                        if (Actiontype == "importUser" || Actiontype == "createuser") {
                            count = 0;
                            $(".selectedusersdiv").css("display", "block");
                            if (response.data.notInvited.length == temparray.length) {
                                AlertMessages("User creation", "Unable to create users", "danger");
                                $(".failure_msg")[0].innerText = "Unable to create user";
                                ShowUserTable();
                                return;
                            }
                            if (Actiontype == "createuser") {
                                Actiontype = "updateCreateduser";
                                for (var i = 0; i < temparray.length; i++) {
                                    url = Config.portalUrl + "/sharing/rest/community/users/" + temparray[i].username + "/update";
                                    var queryParams = {
                                        userType: temparray[i].userType,
                                        access: temparray[i].access,
                                        description: temparray[i].description,
                                        tags: temparray[i].tags,
                                        token: portalToken,
                                        f: "json"
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json",
                                        method: "post"
                                    };
                                    EsriRequest_users(options);
                                }
                            }
                            else
                                Actiontype = "updateuser";

                        }
                        if (Actiontype == "Pending Users") {
                            if (response.data.results.length == 0) {
                                AlertMessages("Pending Users", "No pending users found", "warning");
                                return
                            }
                            else {
                                breadcrum_Label("Delete Pending User");
                                getGroupList(response.data.results);
                            }
                        }
                        if (Actiontype == "Delete pending user") {
                            AlertMessages("Delete pending users", "Deleted users Successfully", "success");
                            showSuccessDiv();
                        }
                        if (Actiontype == "User invites") {
                            if (count == selectedItemsList.length) {
                                AlertMessages("Delete Users Invitations", "Successfully Deleted Invitations ", "success");
                                showSuccessDiv();
                            }
                        }

                    }).catch(function (err) {
                        count++;
                        $(".selectedusersdiv").css("display", "block");
                        console.log(err);
                        AlertMessages("User", err.message, "danger");
                        $(".failure_msg")[0].innerText = err.message;
                        $("#loader").css("display", "none");
                        showfailureDiv();
                        return;
                    });
            } catch (e) {
                console.log(e);
            }


        };

        function _AjaxRequest_users(options, Label) {
            try {
                $.ajax({
                    url: url,
                    type: "POST",
                    crossDomain: true,
                    data: options,
                    cache: false,
                    xhrFields: {
                        withCredentials: (sesstionItem.PKIandIWFLogin) ? true : false
                    },
                    success: function (data, textStatus, jqXHR) {
                        count++;
                        var response = data;
                        if (typeof (response) == "string")
                            response = JSON.parse(response);
                        if (typeof (response.error) != "undefined" && typeof (response.error) != "null") {
                            errcount++;
                            if (Actiontype == "createuser" || Actiontype == "edit" || Actiontype == "Bulkupdate" || Actiontype == "importUser") {

                                if (Actiontype == "createuser") {
                                    $(".failure_msg")[0].innerText = "Failed to create user";
                                    AlertMessages(Label, response.error.message, "danger");
                                }
                                else if (Actiontype == "importUser") {
                                    $(".failure_msg")[0].innerText = "Failed to create user";
                                    AlertMessages(Label, response.error.message, "danger");
                                    $(".failure_msg")[0].innerText = response.error.message;
                                }
                                else {
                                    AlertMessages(Label, response.error.message, "danger");
                                    $(".failure_msg")[0].innerText = response.error.message;
                                    $("#displayPopup").remove();
                                }
                            }
                            if (Actiontype == "Bulkupdate" && count == requestList.length) {
                                AlertMessages(Label, response.error.message, "danger");
                                $(".failure_msg")[0].innerText = response.error.message;
                            }
                            else {
                                if (count == selectedUsers.length)
                                    AlertMessages(Label, response.error.message, "danger");
                                $(".failure_msg")[0].innerText = response.error.message;

                            }
                            showfailureDiv();
                            $("#displayPopup").remove();
                            return;
                        }
                        else if (Actiontype == "createuser") {
                            if (response.notInvited.length == temparray.length) {
                                AlertMessages("Create User", "Unable to create users", "danger");
                                ShowUserTable();
                                return;
                            }
                            else {
                                Actiontype = "updateCreateduser";
                                for (var i = 0; i < temparray.length; i++) {
                                    url = Config.portalUrl + "/sharing/rest/community/users/" + temparray[i].username + "/update";
                                    var queryParams = {
                                        userType: temparray[i].userType,
                                        access: temparray[i].access,
                                        description: temparray[i].description,
                                        tags: temparray[i].tags,
                                        token: portalToken,
                                        f: "json"
                                    };
                                    var options = {
                                        query: queryParams,
                                        responseType: "json",
                                        method: "post"
                                    };
                                    EsriRequest_users(options);
                                }
                            }

                        }
                        else if (Actiontype == "edit") {
                            AlertMessages("Update users", "Updated users Successfully", "success");
                            fetchAllUsers();
                            ShowUserTable();
                            $(".breadcrumb_Home").click();
                        }
                        else if (Actiontype == "importUser") {
                            if (response.notInvited.length == temparray.length) {
                                AlertMessages(Label, "Unable to create users", "danger");
                                $(".failure_msg")[0].innerText = "Unable to create users";
                                showfailureDiv();

                                $(".err-msg .success-msg")[0].innerText = "Failed to create user"
                                return;
                            }
                            else {
                                if (response.notInvited.length > 0)
                                    AlertMessages(Label, "Imported users with some errors", "success");
                                else {
                                    AlertMessages(Label, "Imported users successfully", "success");
                                }
                                showSuccessDiv();
                            }

                        }
                        else if (Actiontype == 'AddTags') {
                            if (count == selectedUsers.length) {
                                AlertMessages("Add Tags", "Added Tags successfully", "success");
                                showSuccessDiv();
                                $(".users_radbtn").css("display", "none");
                            }
                        }
                        else if (Actiontype == 'RemoveTags') {
                            if (count == selectedUsers.length) {
                                if (ErrList.length != 0) {
                                    AlertMessages("Remove Tags", "Failded to remove tags from " + ErrList.join(","), "danger");
                                    $(".failure_msg")[0].innerText = "Failded to remove tags from " + ErrList.join(",");
                                    if (ErrList.length == selectedUsers.length) {
                                        showfailureDiv();
                                    }
                                    else {
                                        AlertMessages("Remove Tags", "Removed Tags successfully", "success");
                                        showSuccessDiv();
                                    }

                                }

                                else {
                                    AlertMessages("Remove Tags", "Removed Tags successfully", "success");
                                    showSuccessDiv();
                                }

                            }
                        }
                        else if (Actiontype == "Bulkupdate") {
                            if (count == requestList.length) {
                                AlertMessages("Update user", "Successfully updated users", "success");
                                showSuccessDiv();
                            }
                        }
                        else {
                            if (errcount > 0 && count == selectedUsers.length) {
                                AlertMessages("Delete users", "Successfully deleted users with errors ", "success");
                                fetchAllUsers();
                                ShowUserTable();
                                $("#displayPopup").remove();
                            }
                            if (errcount == 0 && count == selectedUsers.length) {
                                AlertMessages("Delete users", "Successfully deleted users ", "success");
                                fetchAllUsers();
                                ShowUserTable();
                                $("#displayPopup").remove();
                                selectedUsers = [];
                            }

                        }
                    },
                    error: function (data, textStatus, jqXHR) {
                        count++;
                        if (Actiontype == "createuser") {
                            AlertMessages(Label, "Error creating user", "danger");
                            return;
                        }
                        if (count == selectedUsers) {
                            showfailureDiv()
                        }
                        console.log(jqXHR.responseText);
                    }
                });
            } catch (e) {
                console.log(e);
                showfailureDiv();
            }
        }


        function UpdateBulk() {
            requestList = [];
            var usernamelist = [];
            var Url;
            for (var i = 0; i < selectedUsers.length; i++) {
                for (var j = 0; j < usersList.length; j++) {
                    if (usersList[j].username == selectedUsers[i]) {
                        usernamelist.push(usersList[j].username);
                        break
                    }
                }
            }
            if ($("#Bulkuserroles").val() != "") {
                Url = Config.portalUrl + "/sharing/rest/portals/self/updateuserrole";
                var queryParams = {
                    role: $("#Bulkuserroles").val(),
                    token: portalToken,
                    f: "json",
                    user: usernamelist.join(","),
                    responseType: "json",
                    method: "post"
                };
                requestList.push({ v_url: Url, Options: queryParams })
            }
            if ($("#BulkUseraccess").val() != "" || $("#BulkuserType").val() != "" || $(".BulkUserDesc")[0].value != "") {
                for (var i = 0; i < usernamelist.length; i++) {
                    Url = Config.portalUrl + "/sharing/rest/community/users/" + usernamelist[i] + "/update";
                    var queryParams = {
                        token: portalToken,
                        f: "json",
                        responseType: "json",
                        method: "post"
                    };
                    if ($("#BulkUseraccess").val() != "") { queryParams.access = $("#BulkUseraccess").val() }
                    if ($(".BulkUserDesc")[0].value != "") { queryParams.description = $(".BulkUserDesc")[0].value }
                    if ($("#BulkuserType").val() != "") { queryParams.userType = $("#BulkuserType").val() }
                    requestList.push({ v_url: Url, Options: queryParams })
                }
            }
            if ($(".Bulkusercredits")[0].value != '') {
                var assignCred = [];
                for (var i = 0; i < usernamelist.length; i++) {
                    assignCred.push({ "username": usernamelist[i], "credits": JSON.parse($(".Bulkusercredits")[0].value) })
                }
                var queryParams = {
                    userAssignments: JSON.stringify(assignCred),
                    token: portalToken,
                    f: "json",
                    responseType: "json",
                    method: "post"
                };
                Url = Config.portalUrl + "/sharing/rest/portals/self/assignUserCredits";
                requestList.push({ v_url: Url, Options: queryParams })
            }
            if ($("#Bulkuseractivation").val() != '') {
                for (var i = 0; i < usernamelist.length; i++) {
                    var queryParams = {
                        user: usernamelist[i],
                        token: portalToken,
                        f: "json",
                        responseType: "json",
                        method: "post"
                    };
                    Url = Config.portalUrl + "/sharing/rest/community/users/" + usernamelist[i] + "/" + $("#Bulkuseractivation").val();
                    requestList.push({ v_url: Url, Options: queryParams })
                }
            }
            if ($("#BulkuserLevel").val() != '') {
                Url = Config.portalUrl + "/sharing/rest/portals/self/updateUserLevel";
                var queryParams = {
                    user: usernamelist.join(","),
                    token: portalToken,
                    level: JSON.parse($("#BulkuserLevel").val()),
                    f: "json",
                    responseType: "json",
                    method: "post"
                };
                requestList.push({ v_url: Url, Options: queryParams })
            }
            count = 0; errcount = 0;
            for (var i = 0; i < requestList.length; i++) {
                url = requestList[i].v_url;
                _AjaxRequest_users(requestList[i].Options, "Bulk Update");
            }
        }

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
    })


}