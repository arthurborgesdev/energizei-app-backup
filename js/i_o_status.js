 var io_pl_tag = "PL_" + "_*^H2400[2]" + "__PL" + "," +
                 "PL_" + "_*^H2402[2]" + "__PL";

 function io_setText(tag, data) {
     // This will return a length of zero if the element doesn't have a name
     // Unless it is IE, then it gets the element by Id, even though that
     // is NOT what this function is called
     var collection = document.getElementsByName(tag);

     // All browsers, except IE where the element doesn't have a name
     if (collection.length == 0) {
         collection = document.getElementById(tag);
         if (collection != null) {
             collection.value = data;
         }
     }
     else {
         // Check for INPUT tag (workaround for IE)
         if (collection[0].tagName == 'INPUT') {
             collection[0].value = data;
         }
         else {
             for (var i = 0; i < collection.length; i++) {
                 collection[i].innerHTML = data;
             }
         }
     }
 }
 function io_setColor(tag, data) {
     var collection = document.getElementsByName(tag);
     for (var i = 0; i < collection.length; i++) {
         collection[i].style.color = data;
     }
 }


exports.egz_io_FormatData = function(rxBuff, ArrayIndex, Bitmask) {
  var dataValidity = rxBuff[ArrayIndex];
  if((dataValidity & Bitmask) === Bitmask) {
    // Data Valid
    Data = rxBuff[ArrayIndex + 1];
    if ((Data & Bitmask) === Bitmask) {
      return 1;
    } else {
      return 0;
    }
  }
  else {
    // Data not valid
    return "error";
  }
}






 function io_FormatData(HTMLTag, Type, ArrayIndex, Scale, Bitmask ) {
     var ScaledData;
     var Data;
     var dataValidity;
     var Color = 'black';

      var a = document.getElementById("Form1");
      var R_ON = a.R_ON.value;
      var R_OFF = a.R_OFF.value;
      var R_ERR = a.R_ERR.value;

     switch (Type) {
         case 'IO_ON_OFF': // IEEE754 32-bit Floating Point

            dataValidity = rxBuff[ArrayIndex];
             if((dataValidity & Bitmask) === Bitmask) {
                 // Data Valid
                 Data = rxBuff[ArrayIndex + 1];
                 if ((Data & Bitmask) === Bitmask) {
                     ScaledData = R_ON;
                 }
                 else {
                     ScaledData = R_OFF;
                 }
             }
             else {
                 // Data not valid
                 ScaledData = R_ERR;
                 Color = 'red';
             }
             break;

         default: // Invalid
             ScaledData = R_ERR;
             Color = 'red';
             break;
     }
     io_setText(HTMLTag, ScaledData);
     io_setColor(HTMLTag, Color);
     return;
 }

 function io_populateData() {
     io_FormatData("I_1", "IO_ON_OFF", 0, "0", 1);
     io_FormatData("I_2", "IO_ON_OFF", 0, "0", 2);
     io_FormatData("I_3", "IO_ON_OFF", 0, "0", 4);
     io_FormatData("I_4", "IO_ON_OFF", 0, "0", 8);

     io_FormatData("O_1", "IO_ON_OFF", 2, "0", 1);
     io_FormatData("O_2", "IO_ON_OFF", 2, "0", 2);
 }
 function io_getdata_success(data, status) {
     rxBuff = data.split(",");
     io_populateData();
     globalTimerID = setTimeout(io_getData, 5000);
 }

 function io_getdata_fail(jqXHR, textStatus, errorThrown) {
     //clearData();
     globalTimerID = setTimeout(io_getData, 1000);
 }

 function io_getData() {
     $.ajax({ type: "POST",
         url: "/UE/Post__PL__Data",
         data: io_pl_tag,
         dataType: "text",
         async: true,
         cache: false,
         success: io_getdata_success,
         error: io_getdata_fail
     });
 }

 function io_Enable_View() {
     //clearData();
     io_getData();
 }

 function io_window_onload() {
     io_Enable_View();
 }

