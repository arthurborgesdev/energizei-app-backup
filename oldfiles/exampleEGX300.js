<html>
<head>
  <title>CM3000 - Slave Device 3 - XMLHTTP</title>
</head>
<body style="font-family:Arial" onload="getData();">
  <form name="view_form">
    <div id="time_spot" style="text-align: center"></div>
    <table border="1" cellspacing="0" style="width: 600px; margin-left:auto; margin-right:auto">
      <tr>
        <td colspan="3" style="width: 600px; text-align: center; font-weight: bold; font-size: x-large">CM3000 - Slave Device 3</td>
      </tr>
      <tr>
        <td style="width: 300px; text-align: center">Frequency</td>
        <td style="width: 90px; text-align: center" id="frequency"></td>
        <td style="width: 100px; text-align: center">Hz</td>
      </tr>
      <tr>
        <td style="width: 300px; text-align: center">Current PhaseA</td>
        <td style="width: 90px; text-align: center" id="currentphasea"></td>
        <td style="width: 100px; text-align: center">Amps</td>
      </tr>
      <tr>
        <td style="width: 300px; text-align: center">Current Neutral</td>
        <td style="width: 90px; text-align: center" id="currentneutral"></td>
        <td style="width: 100px; text-align: center">Amps</td>
      </tr>
      <tr>
        <td style="width: 300px; text-align: center">Current Ground</td>
        <td style="width: 90px; text-align: center" id="currentground"></td>
        <td style="width: 100px; text-align: center">Amps</td>
      </tr>
    </table>
    <br />
    <hr style="width:66%; height:1px" />
    <div style="text-align: center; font-size: small">
      &copy; 2011 Schneider Electric. All rights reserved.
    </div>
  </form>
  <script type="text/javascript">
    if (window.XMLHttpRequest) {
      // If IE7, Mozilla, Safari, and so on: Use native object
      var xmlhttp = new XMLHttpRequest();
    } else {
      if (window.ActiveXObject) {
        // ...otherwise, use the ActiveX control for IE5.x and IE6
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    function getData() {
      postString = "PL_" + "_3" + "^3209,3210,3211,3208,1180,1100,1103,1104" + "__PL";
      doRead(xmlhttp, updateData, postString);
    }
    function doRead(xmlhttpObj, functionName, postString) {
      var sampleRate = 5*1000;
      try {
        var temp;
        var Data = new Array();
        xmlhttpObj.open("POST", "Post__PL__Data", true);
        xmlhttpObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlhttpObj.onreadystatechange  = function() {
          if(xmlhttpObj.readyState == 4) {
            try {
              temp = xmlhttpObj.responseText;
              Data = temp.split(",");
            }
            catch(exception) {
              ProcessError(xmlhttpObj.responseText);
              return;
            }
            if(Data.length > 2) {
               functionName(Data);
              setTimeout("getData()", sampleRate)
            } else {
            ProcessError(Data);
            }
          }
        }
        xmlhttpObj.send(postString)
      }
      catch(exception){
        ProcessError(exception);
      }
   }
   function ProcessError(errTxt) {
     alert(errTxt);
   }
   function updateData(Registers) {
     // Assign Scale Factors

     ScaleFactorA = Registers[0];  // Current Scale Factor
     ScaleFactorB = Registers[1];  // Neutral Current Scale Factor
     ScaleFactorC = Registers[2];  // Ground Current Scale Factor // Assign Nominal Frequency
     NominalFrequency = Registers[3]; // Assign Data Values
     Frequency      = Registers[4];
     CurrentPhaseA  = Registers[5];
     CurrentNeutral = Registers[6];
     CurrentGround  = Registers[7]; // Get the current date and time
     TheTime = new Date();// Scale Frequency
     if(NominalFrequency != 400) {
       Frequency *= 0.01;
     } else {
       Frequency *= 0.10;
     }
     // Scale Phase A Current
     CurrentPhaseA *= Math.pow(10, ScaleFactorA);
     // Scale Neutral Current
     if (CurrentNeutral == 32768) {
       CurrentNeutral = "N/A";
     } else {
       CurrentNeutral *= Math.pow(10, ScaleFactorB);
     }
     // Scale Ground Current
     if (CurrentGround == 32768) {
       CurrentGround = "N/A";
     } else {
       CurrentGround *= Math.pow(10, ScaleFactorC);
     }
     // Put data on the page
     document.getElementById("frequency").innerHTML = Frequency;
     document.getElementById("currentphasea").innerHTML = CurrentPhaseA;
     document.getElementById("currentneutral").innerHTML = CurrentNeutral;
     document.getElementById("currentground").innerHTML = CurrentGround;
     document.getElementById("time_spot").innerHTML = TheTime;
   }
  </script>
</body>
</html>
