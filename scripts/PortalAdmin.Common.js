
//class CommonUtils {
//constructor() {

//    this.portalUrl = '';
//}
Config = {
    portalUrl:'',
    //appId: 'q244Lb8gDRgWQ8hM',
    referer: 'http://localhost:62423',
    arcGisOnline: "https://www.arcgis.com",
    appId: '6yFMhSFOgY90I5l5',//'iV4CzRAJ6Gdc9WmL',
    //referer:'https://portaladmin.ispatialtec.com' //'https://aiapps.smartgeoapps.com',
    //arcGisOnline: "https://www.arcgis.com"
    //esriConfig.request.trustedServers.push("https://gis3.smartgeoapps.com");
};
//logMessages = true;
//WebserviceUrl = "http://localhost/PortalAdmin_WS/Logging.asmx/";
WebserviceUrl = "https://aiapps.smartgeoapps.com/WABWidgets/ProtalAdminWS/Logging.asmx/";
logSuccessMsg = true;
logFailureMsg = true;

function AlertMessages(title, alertmessage, alerttype) {

    if (alerttype == "danger")
        alerttype = "error";
    swal({
        position: 'top-end',
        type: alerttype,
        timer: 5000,
        title: title,
        text: alertmessage
    });

};



function signOutCredentials(esriId) {
    esriId.destroyCredentials();
    localStorage.setItem("esriJSAPIOAuth", "");
    sessionStorage.setItem("esriJSAPIOAuth", "");
    sessionStorage.setItem("Accesskey", "null");
    window.location.href = "../views/PortalAdmin.html";
};

function includeMenu(item) {
    var z, i, elmnt, file, xhttp;
    var currentWidget = this;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("menu-include-html");
        if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                        var node = $(".dt-sidebar__container .Actionitem .dt-side-nav__text")
                        for (var i = 0; i < node.length; i++) {
                            $($(node[i])[0].parentNode).removeClass('active');
                            $($(node[i])[0].parentNode.parentNode).removeClass('selected');
                            if ($(node[i])[0].innerText.toUpperCase() == item.toUpperCase()) {
                                $($(node[i])[0].parentNode).addClass("active");
                                $($(node[i])[0].parentNode.parentNode).addClass("selected");
                            }
                        }
                    }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /*remove the attribute, and call this function once more:*/
                    elmnt.removeAttribute("menu-include-html");
                    currentWidget.includeMenu();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
        }
    }
};
function includeHeader() {
    var z, i, elmnt, file, xhttp;
    var currentWidget = this;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("header-include-html");
        if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;

                    }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /*remove the attribute, and call this function once more:*/
                    elmnt.removeAttribute("header-include-html");
                    currentWidget.includeHeader();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
        }
    }
};
function includeMenu(item) {
    var z, i, elmnt, file, xhttp;
    var currentWidget = this;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("menu-include-html");
        if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                        var node = $(".dt-sidebar__container .Actionitem .dt-side-nav__text")
                        for (var i = 0; i < node.length; i++) {
                            $($(node[i])[0].parentNode).removeClass('active');
                            $($(node[i])[0].parentNode.parentNode).removeClass('selected');
                            if ($(node[i])[0].innerText.toUpperCase() == item.toUpperCase()) {
                                $($(node[i])[0].parentNode).addClass("active");
                                $($(node[i])[0].parentNode.parentNode).addClass("selected");
                            }
                        }
                    }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /*remove the attribute, and call this function once more:*/
                    elmnt.removeAttribute("menu-include-html");
                    currentWidget.includeMenu();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
        }
    }
};
function includeHeader() {
    var z, i, elmnt, file, xhttp;
    var currentWidget = this;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("header-include-html");
        if (file) {
            /*make an HTTP request using the attribute value as the file name:*/
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;

                    }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /*remove the attribute, and call this function once more:*/
                    elmnt.removeAttribute("header-include-html");
                    currentWidget.includeHeader();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /*exit the function:*/
            return;
        }
    }
};


  function  LogMessages(options, logMessages) {
        console.log(options,JSON.stringify(options));
        if (logMessages) {//contentType: "text/plain; charset=utf-8",
            //var url1 = "https://aiapps.smartgeoapps.com/WABWidgets/ProtalAdminWS/Logging.asmx/LogMessages?userName=" + username + "&portalUrl=" + Portal + "&message=" + message + "&isSendEmail=" + isSendEmail+"";
            var url1 = WebserviceUrl+"LogMessages";
            try {
                $.ajax({
                    type: "POST",
                    url: url1,
                    crossDomain: true,
                    data: JSON.stringify(options),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (r) {
                        console.log(r.d);
                    },
                    error: function (r) {
                        console.log(r.responseText);
                    },
                    failure: function (r) {
                        console.log(r.responseText);
                    }
                });
            }
            catch (e) {
                console.log(e);
            }
        }
    };


function clearInputFields(childElements) {
    for (var i = 0; i < childElements.length; i++) {
        var child = childElements[i];
        if (child) {
            switch (child.type) {
                case 'text':
                //case 'submit':
                case 'password':
                case 'file':
                case 'email':
                case 'date':
                    //case 'number':
                    child.value = '';
                case 'checkbox':
                case 'radio':
                    child.checked = false;
                case 'select-one': child.selectedIndex = 0;
            }
        }
    }
};
function csvJSON(csv) {

    var lines = csv.split("\n");

    var result = [];

    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        if (lines[i].length > 0) {
            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = currentline[j];
            }

            result.push(obj);
        }
    }
    return JSON.stringify(result);
};
function csvjsonConverter(csvdata, delimiter) {
    let arrmatch = [];
    let array = [[]];
    let quotevals = "";
    let jsonarray = [];
    let k = 0;
    let regexp = new RegExp(("(\\" + delimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        "([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
    while (arrmatch = regexp.exec(csvdata)) {
        let delimitercheck = arrmatch[1];
        if ((delimitercheck !== delimiter) && delimitercheck.length) {
            array.push([]);
        }
        if (arrmatch[2]) {
            quotevals = arrmatch[2].replace('""', '\"');
        }
        else {
            quotevals = arrmatch[3];
        }
        array[array.length - 1].push(quotevals);
    }
    for (let i = 0; i < array.length - 1; i++) {
        jsonarray[i - 1] = {};
        for (let j = 0; j < array[i].length && j < array[0].length; j++) {
            let key = array[0][j];
            jsonarray[i - 1][key] = array[i][j]
        }
    }
    for (k = 0; k < jsonarray.length; k++) {
        let jsonobject = jsonarray[k];
        for (let prop in jsonobject) {
            if (!isNaN(jsonobject[prop]) && jsonobject.hasOwnProperty(prop)) {
                jsonobject[prop] = +jsonobject[prop];
            }
        }
    }
    let formatjson = JSON.stringify(jsonarray, null, 2);
    return formatjson;
};

//function DownloadCsv(filename, JSONData) {
//    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
//    var CSV = '';
//    var row = "";
//    //This loop will extract the label from 1st index of on array
//    for (var index in arrData[0]) {
//        //Now convert each value to string and comma-seprated
//        row += index + ',';
//    }
//    row = row.slice(0, -1);
//    //append Label row with line break
//    CSV += row + '\r\n';
//    for (var i = 0; i < arrData.length; i++) {
//        var row = "";
//        for (var index in arrData[i]) {
//            //row += '"' + arrData[i][index] + '",';
//            row += arrData[i][index] + ',';
//        }
//        row.slice(0, row.length - 1);
//        row.slice(0, row.length - 1);
//        row.slice(0, row.length - 1);
//        //add a line break after each row
//        CSV += row + '\r\n';
//    }
//    if (CSV == '') {
//        alert("Invalid data");
//        return;
//    }
//    //Generate a file name
//    var fileName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
//    //Initialize file format you want csv or xls
//    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
//    var link = document.createElement("a");
//    link.href = URL.createObjectURL(new Blob([CSV], { type: "application/octet-stream" }));
//    link.download = fileName + ".csv";
//    document.body.appendChild(link);
//    link.click();
//};

//function DownloadJson(filename, jsondata) {
//    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsondata);
//    let exportFileDefaultName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + '.json';
//    let linkElement = document.createElement('a');
//    linkElement.setAttribute('href', dataUri);
//    linkElement.setAttribute('download', exportFileDefaultName);
//    linkElement.click();
//};
function DownloadCsv(filename, JSONData) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    var row = "";
    //This loop will extract the label from 1st index of on array
    for (var index in arrData[0]) {
        //Now convert each value to string and comma-seprated
        row += index + ',';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    CSV += row + '\r\n';
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            //row += '"' + arrData[i][index] + '",';
            row += arrData[i][index] + ',';
        }
        row.slice(0, row.length - 1);
        row.slice(0, row.length - 1);
        row.slice(0, row.length - 1);
        //add a line break after each row
        CSV += row + '\r\n';
    }
    if (CSV == '') {
        alert("Invalid data");
        return;
    }
    //Generate a file name
    var fileName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
    var blob = new Blob([CSV], { type: "attachment/csv;charset=utf-8" });
    var anchor = document.createElement("a");
    if (window.navigator.msSaveBlob) { // IE
        window.navigator.msSaveBlob(new Blob([CSV]), fileName + ".csv");
    } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox

        var url = URL.createObjectURL(blob);
        anchor.setAttribute("href", url);
        anchor.setAttribute("download", filename + ".csv");
        anchor.style.visibility = 'hidden';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } else { // Chrome

        anchor.href = URL.createObjectURL(new Blob([CSV], { type: "attachment/csv;charset=utf-8" }));
        anchor.download = fileName + ".csv";
        document.body.appendChild(anchor);
        anchor.click();
    }



};

function DownloadJson(filename, jsondata) {
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsondata);
    let exportFileDefaultName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + '.json';
    var link = document.createElement("a");
    var anchor = document.createElement("a");
    if (window.navigator.msSaveBlob) { // IE
        window.navigator.msSaveBlob(new Blob([jsondata]), exportFileDefaultName);
    } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
        //var url = URL.createObjectURL(blob);
        link.setAttribute("href", dataUri);
        link.setAttribute("download", exportFileDefaultName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } else { // Chrome

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
};

function AlertMessagesinclone(title, alertmessage, alerttype) {
    if (alerttype == "danger")
        alerttype = "error";
    var item = undefined;
    if (alerttype != "warning" || alerttype != "error") {
        item = 2000;
    }
    swal({
        position: 'top-end',
        type: alerttype,
        title: title,
        timer: item,
        text: alertmessage
    });


};
function createShowHideColumns(tableId, ColumnsListID, ColumnID) {
    var temparray = [];
    var fields = $(tableId).jsGrid("option", "fields");
    var select = document.createElement("select");
    select.name = "columns";
    select.id = ColumnID;
    select.multiple = "multiple";
    fields.forEach(function (field) {
        if (field.name) {
            var option = document.createElement("option");
            option.value = field.name;
            option.text = (field.title != null) ? field.title : field.name;
            temparray.push({ visible: field.visible, name: field.name })
            select.appendChild(option);
        }
    });
    var label = document.createElement("label");
    label.innerHTML = ""
    label.htmlFor = "";
    $(ColumnsListID).append(label).append(select);
    $('#' + ColumnID).multiselect({
        selectAllValue: 'multiselect-all',
        nonSelectedText: 'Show/Hide Columns',
        maxHeight: '300',
        buttonWidth: '235',
        selectAll: true,
        onChange: function (element, checked) {
            if (checked)
                $(tableId).jsGrid("fieldOption", element[0].value, "visible", true);
            else
                $(tableId).jsGrid("fieldOption", element[0].value, "visible", false);
            $(".multiselect-selected-text")[0].innerText = "Show / Hide Columns";
        }
    });
    if (temparray.length > 0) {
        var nodes = $(ColumnsListID + " input");
        for (var i in temparray) {
            var optionVal = temparray[i].name;
            for (var j = 0; j < nodes.length; j++) {
                if (optionVal == nodes[j].value) {
                    if (temparray[i].visible)
                        nodes[j].checked = true;
                    else
                        nodes[j].checked = false;

                    break;
                }
            }


        }

    }

    $(".multiselect-native-select .btn-group .multiselect").addClass("btn-sm").addClass("border").removeClass("btn-default").addClass("btn-primary");
    $(".multiselect-native-select .btn-group").css("width", "180px");

};
//};



//class CommonUtils {
//    constructor() {

//        this.portalUrl = '';
//    }
//    Config = {
//        appId: 'q244Lb8gDRgWQ8hM',
//        referer: 'http://localhost:2015',
//        arcGisOnline: "https://www.arcgis.com"
//        //appId: 'iV4CzRAJ6Gdc9WmL',
//        //referer: 'https://aiapps.smartgeoapps.com',
//        //arcGisOnline: "https://www.arcgis.com"
//    };
//    //logMessages = true;
//    WebserviceUrl = "http://localhost/PortalAdmin_WS/Logging.asmx/";
//    logSuccessMsg = true;
//    logFailureMsg = true;


//    clearInputFields(childElements) {
//        for (var i = 0; i < childElements.length; i++) {
//            var child = childElements[i];
//            if (child) {
//                switch (child.type) {
//                    case 'text':
//                    //case 'submit':
//                    case 'password':
//                    case 'file':
//                    case 'email':
//                    case 'date':
//                        //case 'number':
//                        child.value = '';
//                    case 'checkbox':
//                    case 'radio':
//                        child.checked = false;
//                    case 'select-one': child.selectedIndex = 0;
//                }
//            }
//        }
//    };
//    csvJSON(csv) {

//        var lines = csv.split("\n");

//        var result = [];

//        var headers = lines[0].split(",");

//        for (var i = 1; i < lines.length; i++) {
//            if (lines[i].length > 0) {
//                var obj = {};
//                var currentline = lines[i].split(",");

//                for (var j = 0; j < headers.length; j++) {
//                    obj[headers[j].trim()] = currentline[j];
//                }

//                result.push(obj);
//            }
//        }
//        return JSON.stringify(result);
//    };
//    csvjsonConverter(csvdata, delimiter) {
//        let arrmatch = [];
//        let array = [[]];
//        let quotevals = "";
//        let jsonarray = [];
//        let k = 0;
//        let regexp = new RegExp(("(\\" + delimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
//            "([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
//        while (arrmatch = regexp.exec(csvdata)) {
//            let delimitercheck = arrmatch[1];
//            if ((delimitercheck !== delimiter) && delimitercheck.length) {
//                array.push([]);
//            }
//            if (arrmatch[2]) {
//                quotevals = arrmatch[2].replace('""', '\"');
//            }
//            else {
//                quotevals = arrmatch[3];
//            }
//            array[array.length - 1].push(quotevals);
//        }
//        for (let i = 0; i < array.length - 1; i++) {
//            jsonarray[i - 1] = {};
//            for (let j = 0; j < array[i].length && j < array[0].length; j++) {
//                let key = array[0][j];
//                jsonarray[i - 1][key] = array[i][j]
//            }
//        }
//        for (k = 0; k < jsonarray.length; k++) {
//            let jsonobject = jsonarray[k];
//            for (let prop in jsonobject) {
//                if (!isNaN(jsonobject[prop]) && jsonobject.hasOwnProperty(prop)) {
//                    jsonobject[prop] = +jsonobject[prop];
//                }
//            }
//        }
//        let formatjson = JSON.stringify(jsonarray, null, 2);
//        return formatjson;
//    };

//    DownloadCsv(filename, JSONData) {
//        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
//        var CSV = '';
//        var row = "";
//        //This loop will extract the label from 1st index of on array
//        for (var index in arrData[0]) {
//            //Now convert each value to string and comma-seprated
//            row += index + ',';
//        }
//        row = row.slice(0, -1);
//        //append Label row with line break
//        CSV += row + '\r\n';
//        for (var i = 0; i < arrData.length; i++) {
//            var row = "";
//            for (var index in arrData[i]) {
//                //row += '"' + arrData[i][index] + '",';
//                row += arrData[i][index] + ',';
//            }
//            row.slice(0, row.length - 1);
//            row.slice(0, row.length - 1);
//            row.slice(0, row.length - 1);
//            //add a line break after each row
//            CSV += row + '\r\n';
//        }
//        if (CSV == '') {
//            alert("Invalid data");
//            return;
//        }
//        //Generate a file name
//        var fileName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
//        //Initialize file format you want csv or xls
//        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
//        var link = document.createElement("a");
//        link.href = URL.createObjectURL(new Blob([CSV], { type: "application/octet-stream" }));
//        link.download = fileName + ".csv";
//        document.body.appendChild(link);
//        link.click();
//    };

//    DownloadJson(filename, jsondata) {
//        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsondata);
//        let exportFileDefaultName = filename + "_" + new Date().toLocaleDateString() + "_" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + '.json';
//        let linkElement = document.createElement('a');
//        linkElement.setAttribute('href', dataUri);
//        linkElement.setAttribute('download', exportFileDefaultName);
//        linkElement.click();
//    };

//    AlertMessages(title, alertmessage, alerttype) {

//        if (alerttype == "danger")
//            alerttype = "error";
//        swal({
//            position: 'top-end',
//            type: alerttype,
//            timer: 2000,
//            title: title,
//            text: alertmessage
//        });

//    };
//    AlertMessagesinclone(title, alertmessage, alerttype) {
//        if (alerttype == "danger")
//            alerttype = "error";
//        var item = undefined;
//        if (alerttype != "warning" || alerttype != "error") {
//            item = 2000;
//        }
//        swal({
//            position: 'top-end',
//            type: alerttype,
//            title: title,
//            timer: item,
//            text: alertmessage
//        });


//    };
//    createShowHideColumns(tableId, ColumnsListID, ColumnID) {
//        var temparray = [];
//        var fields = $(tableId).jsGrid("option", "fields");
//        var select = document.createElement("select");
//        select.name = "columns";
//        select.id = ColumnID;
//        select.multiple = "multiple";
//        fields.forEach(function (field) {
//            if (field.name) {
//                var option = document.createElement("option");
//                option.value = field.name;
//                option.text = (field.title != null) ? field.title : field.name;
//                temparray.push({ visible: field.visible, name: field.name })
//                select.appendChild(option);
//            }
//        });
//        var label = document.createElement("label");
//        label.innerHTML = ""
//        label.htmlFor = "";
//        $(ColumnsListID).append(label).append(select);
//        $('#' + ColumnID).multiselect({
//            selectAllValue: 'multiselect-all',
//            nonSelectedText: 'Show/Hide Columns',
//            maxHeight: '300',
//            buttonWidth: '235',
//            selectAll: true,
//            onChange: function (element, checked) {
//                if (checked)
//                    $(tableId).jsGrid("fieldOption", element[0].value, "visible", true);
//                else
//                    $(tableId).jsGrid("fieldOption", element[0].value, "visible", false);
//                $(".multiselect-selected-text")[0].innerText = "Show / Hide Columns";
//            }
//        });
//        if (temparray.length > 0) {
//            var nodes = $(ColumnsListID + " input");
//            for (var i in temparray) {
//                var optionVal = temparray[i].name;
//                for (var j = 0; j < nodes.length; j++) {
//                    if (optionVal == nodes[j].value) {
//                        if (temparray[i].visible)
//                            nodes[j].checked = true;
//                        else
//                            nodes[j].checked = false;

//                        break;
//                    }
//                }


//            }

//        }

//        $(".multiselect-native-select .btn-group .multiselect").addClass("btn-sm").addClass("border").removeClass("btn-default").addClass("btn-primary");
//        $(".multiselect-native-select .btn-group").css("width", "180px");

//    };

//    signOutCredentials(esriId) {
//        esriId.destroyCredentials();
//        localStorage.setItem("esriJSAPIOAuth", "");
//        sessionStorage.setItem("esriJSAPIOAuth", "");
//        sessionStorage.setItem("Accesskey", "null");
//        window.location.href = "../views/PortalAdmin.html";
//    };

//    includeMenu(item) {
//        var z, i, elmnt, file, xhttp;
//        var currentWidget = this;
//        /*loop through a collection of all HTML elements:*/
//        z = document.getElementsByTagName("*");
//        for (i = 0; i < z.length; i++) {
//            elmnt = z[i];
//            /*search for elements with a certain atrribute:*/
//            file = elmnt.getAttribute("menu-include-html");
//            if (file) {
//                /*make an HTTP request using the attribute value as the file name:*/
//                xhttp = new XMLHttpRequest();
//                xhttp.onreadystatechange = function () {
//                    if (this.readyState == 4) {
//                        if (this.status == 200) {
//                            elmnt.innerHTML = this.responseText;
//                            var node = $(".dt-sidebar__container .Actionitem .dt-side-nav__text")
//                            for (var i = 0; i < node.length; i++) {
//                                $($(node[i])[0].parentNode).removeClass('active');
//                                $($(node[i])[0].parentNode.parentNode).removeClass('selected');
//                                if ($(node[i])[0].innerText.toUpperCase() == item.toUpperCase()) {
//                                    $($(node[i])[0].parentNode).addClass("active");
//                                    $($(node[i])[0].parentNode.parentNode).addClass("selected");
//                                }
//                            }
//                        }
//                        if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
//                        /*remove the attribute, and call this function once more:*/
//                        elmnt.removeAttribute("menu-include-html");
//                        currentWidget.includeMenu();
//                    }
//                }
//                xhttp.open("GET", file, true);
//                xhttp.send();
//                /*exit the function:*/
//                return;
//            }
//        }
//    };
//    includeHeader() {
//        var z, i, elmnt, file, xhttp;
//        var currentWidget = this;
//        /*loop through a collection of all HTML elements:*/
//        z = document.getElementsByTagName("*");
//        for (i = 0; i < z.length; i++) {
//            elmnt = z[i];
//            /*search for elements with a certain atrribute:*/
//            file = elmnt.getAttribute("header-include-html");
//            if (file) {
//                /*make an HTTP request using the attribute value as the file name:*/
//                xhttp = new XMLHttpRequest();
//                xhttp.onreadystatechange = function () {
//                    if (this.readyState == 4) {
//                        if (this.status == 200) {
//                            elmnt.innerHTML = this.responseText;

//                        }
//                        if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
//                        /*remove the attribute, and call this function once more:*/
//                        elmnt.removeAttribute("header-include-html");
//                        currentWidget.includeHeader();
//                    }
//                }
//                xhttp.open("GET", file, true);
//                xhttp.send();
//                /*exit the function:*/
//                return;
//            }
//        }
//    };

//};
