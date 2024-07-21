var portalUrl = "https://gis3.smartgeoapps.com/portal/sharing/rest/";
generateToken();


function generateToken() {
    var username = "GISUSER";
    var password = "$GISUSER@2019$";

    var token = "";
    //var username = "srini375";
    //var password = "spatial@1234";
    var url = portalUrl + 'generateToken/';
    var params = { 'f': 'pjson', 'username': username, 'password': password, 'referer': 'http://localhost:2015' };
    $.ajax({
        url: url,
        data: params,
        error: function (err) {
            console.log(err);
            alert("Unable to generate the token");
        },
        success: function (data) {
            console.log(data);
            token = JSON.parse(data).token;
            if (token !== null || token !== "")
                 fetchPortalUsers(token);
        },
        type: 'POST'
    });
}
function fetchPortalUsers(clienttoken) {
    var url = portalUrl + 'community/users';
    // var url = portalUrl +'portals/self/users'
    //url = "https://spatial1090.maps.arcgis.com/portal/sharing/rest/portals/self/users";
    url = "https://gis3.smartgeoapps.com/portal/sharing/rest/portals/self/users";
    //var params = { 'f': 'pjson', 'token': token, 'culture': 'en', 'q': 'orgid:0123456789ABCDEF' };
    var params = { 'start': 1, 'num': 10, 'sortField': 'fullname', 'sortOrder': 'asc', 'excludeSystemUsers': true, 'f': 'json', 'token': clienttoken };
    //var params = {};
    var usersData = [];
    $.ajax({
        url: url,
        data: params,
        error: function (err) {
            console.log(err);
            alert("Unable to generate the token");
        },
        success: function (data) {
            //console.log(JSON.parse(data));
            var users = data.users;
            for (var i = 0; i < users.length; i++) {
                var userObj = {
                    UserName: users[i].username,
                    FirstName: users[i].firstName,
                    LastName: users[i].lastName,
                    FullName: users[i].fullName,
                    Thumbnail: users[i].thumbnail,
                    CreatedDate: UtctoString(users[i].created),
                    Email: users[i].email,
                    Access: users[i].access,
                    Level: users[i].level,
                    Role: users[i].role,
                    LastLogin: UtctoString(users[i].lastLogin)
                };
                usersData.push(userObj);
            }
            if (usersData.length > 0) {
              //  null;
                loadResults(usersData);
            }

        }
    });
}
/*global $ */
function loadResults(usersData) {
    'use strict';
    var $grid = $("#grdUsers");
    var initDate = function (elem) {
        $(elem).datepicker({
            dateFormat: 'm/d/yy',
            autoSize: true,
            changeYear: true,
            changeMonth: true,
            showButtonPanel: true,
        });
      },
        numberTemplate = {
            formatter: 'number', align: 'right', sorttype: 'number', 
            searchoptions: { sopt: ['eq', 'ne', 'lt', 'le', 'gt', 'ge', 'nu', 'nn', 'in', 'ni'] }
        },
        dateTemplate = {
            width: 100, align: 'center', sorttype: 'date',
            formatter: 'date', formatoptions: { srcformat: 'U/1000', newformat: "m/d/Y" }, datefmt: 'm/d/Y',
            searchoptions: { sopt: ['eq', 'ne', 'lt', 'le', 'gt', 'ge'], dataInit: initDate }
        };
       

    $grid.jqGrid({
        datatype: 'local',
        data: usersData,
        colModel: [
            {
                name: "Thumbnail", label: "Thumbnail",
                search: false, width: 60, align: 'center',
                fixed: true,
                formatter: function (value) {
                    if (value != null)
                        return "<img style='height:30px;width:30px;border:1px solid;border-radius:50%' src='" + value + "'>";
                    else
                        return "<img style='height:30px;width:30px;border:1px solid;border-radius:50%' src='../../../Images/user.png' />";
                }
            },
            {
                name: "UserName", label: "User Name", width: 150,
                searchoptions: {
                    sopt: ['cn'],
                    dataInit: function (elem) {
                        $(elem).autocomplete({
                            source: getUniqueNames('UserName'),
                            delay: 0,
                            minLength: 0,
                            select: function () {
                                $('#grdUsers')[0].triggerToolbar();
                            }
                        });
                    }
                }
            },
            { name: "FirstName", label: "First Name", width: 100 },
            { name: "LastName", label: "Last Name", width: 100 },
            { name: "FullName", label: "Full Name", width: 150 },
            { name: "Email", label: "Email", width: 200 },
            {
                name: "CreatedDate", label: "Created Date", width: 120,
                searchoptions: { sopt: ['eq', 'ne', 'lt', 'le', 'gt', 'ge'], dataInit: initDate }
            },
            {
                name: "LastLogin", label: "Last Login", width: 120,
                searchoptions: { sopt: ['eq', 'ne', 'lt', 'le', 'gt', 'ge'], dataInit: initDate }
            },
            {
                name: "Level", label: "Level", width: 100,
                stype: "select",
                searchoptions: {
                    value: ": All;1:1;2:2;3:3"
                }
            },
            { name: "Role", label: "Role", width: 120 }
        ],
        rowNum: 10,
        rowList: [5, 10, 20],
        pager: '#pager',
        gridview: true,
        rownumbers: true,
        autoencode: true,
        ignoreCase: true,
        sortname: 'UserName',
        viewrecords: true,
        sortorder: 'desc',
        height: '100%',
        shrinkToFit: false,
        forceFit: true,
        caption: 'Users List of Portal Admin'
    }).jqGrid("filterToolbar").jqGrid('setGridWidth', '1000');
    $grid.jqGrid('navGrid', '#pager', { refreshstate: 'current', add: false, edit: false, del: false });
    $.extend(true, $.ui.multiselect, {
        locale: {
            addAll: 'Make all visible',
            removeAll: 'Hidde All',
            itemsCount: 'Avlialble Columns'
        }
    });
    $.extend(true, $.jgrid.col, {
        width: 450,
        modal: true,
        msel_opts: { dividerLocation: 0.5 },
        dialog_opts: {
            minWidth: 470,
            show: 'blind',
            hide: 'explode'
        }
    });
    $grid.jqGrid('navButtonAdd', '#pager', {
        caption: "Show/Hide Columns",
        buttonicon: "ui-icon-calculator",
        title: "Choose columns",
        onClickButton: function () {
            $(this).jqGrid('columnChooser');
        }
    });
}

getUniqueNames = function (columnName) {
    var texts = $("#grdUsers").jqGrid('getCol', columnName), uniqueTexts = [],
        textsLength = texts.length, text, textsMap = {}, i;
    for (i = 0; i < textsLength; i++) {
        text = texts[i];
        if (text !== undefined && textsMap[text] === undefined) {
            // to test whether the texts is unique we place it in the map.
            textsMap[text] = true;
            uniqueTexts.push(text);
        }
    }
    return uniqueTexts;
}
UtctoString = function (val) {
    var date = new Date(val);
    return date.toLocaleDateString();
}