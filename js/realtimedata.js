 
var int2bigInt = require('./bigint').int2bigInt;
var leftShift_ = require('./bigint').leftShift_;
var add = require('./bigint').add;
var bigInt2str = require('./bigint').bigInt2str;


var R_ERR = '***';
var TIME_UTC_OFFSET        = 0;
var TIME_DST_AUTO_ADJUST   = 0;

var TIME_DST_START_MONTH   = 0;
var TIME_DST_START_WEEK    = 0;
var TIME_DST_START_DAY     = 0;
var TIME_DST_START_HOUR    = 0;

var TIME_DST_END_MONTH     = 0;
var TIME_DST_END_WEEK      = 0;
var TIME_DST_END_DAY       = 0;
var TIME_DST_END_HOUR      = 0;

function ConvertInt64(reg1, reg2, reg3, reg4, rawScale, multiplier) {
    if (multiplier) {
        var tempMulti = int2bigInt(multiplier, 80, 20);
    }
    var temp = int2bigInt(reg1, 80, 20);
    leftShift_(temp, 16);
    var tempReg = int2bigInt(reg2, 80, 20);
    temp = add(temp, tempReg);
    leftShift_(temp, 16);
    tempReg = int2bigInt(reg3, 80, 20);
    temp = add(temp, tempReg);
    leftShift_(temp, 16);
    tempReg = int2bigInt(reg4, 80, 20);
    temp = add(temp, tempReg);

    if ((reg1 & 0x8000) == 0x8000) {
        tempReg = int2bigInt(1, 80, 20);
        leftShift_(tempReg, 64);
        temp = sub(tempReg, temp);
    }

    // Apply multiplier
    if (tempMulti) {
        temp = mult(temp, tempMulti);
    }

    var returnString = bigInt2str(temp, 10);

    // Apply Scaling
    if (rawScale > 0) {
        for (var ix = 0; ix < rawScale; ix++) {
            returnString += "0";
        }
    }
    else if (rawScale < 0) {
        while (returnString.length <= Math.abs(rawScale)) {
            returnString = "0" + returnString;
        }
        var tempIntPart = returnString.substr(0, returnString.length + parseInt(rawScale));
        var tempDecPart = returnString.substr(returnString.length + parseInt(rawScale), Math.abs(rawScale));
        returnString = tempIntPart + "." + tempDecPart;
    }

    if ((reg1 & 0x8000) == 0x8000) {
        returnString = "-" + returnString;
    }
    return (returnString);

}
function ConvertUInt64(reg1, reg2, reg3, reg4, rawScale, multiplier) {
    if (multiplier) {
        var tempMulti = int2bigInt(multiplier, 80, 20);
    }
    var temp = int2bigInt(reg1, 80, 20);
    leftShift_(temp, 16);
    var tempReg = int2bigInt(reg2, 80, 20);
    temp = add(temp, tempReg);
    leftShift_(temp, 16);
    tempReg = int2bigInt(reg3, 80, 20);
    temp = add(temp, tempReg);
    leftShift_(temp, 16);
    tempReg = int2bigInt(reg4, 80, 20);
    temp = add(temp, tempReg);

    // Apply multiplier
    if (tempMulti) {
        temp = mult(temp, tempMulti);
    }

    // Convert back to string
    var returnString = bigInt2str(temp, 10);

    // Apply Scaling
    if (rawScale > 0) {
        for (var ix = 0; ix < rawScale; ix++) {
            returnString += "0";
        }
    }
    else if (rawScale < 0) {
        while (returnString.length <= Math.abs(rawScale)) {
            returnString = "0" + returnString;
        }
        var tempIntPart = returnString.substr(0, returnString.length + parseInt(rawScale));
        var tempDecPart = returnString.substr(returnString.length + parseInt(rawScale), Math.abs(rawScale));
        returnString = tempIntPart + "." + tempDecPart;
    }

    return (returnString);

}
function is32BitNaN(TheNumberToTest) {
    var Exponent;
    var Mantissa;

    Exponent = (TheNumberToTest & 0x7F800000) >> 23;
    Mantissa = (TheNumberToTest & 0x007FFFFF);

    if (Exponent == 0xFF) {
        if (Mantissa != 0) {
            return (1);
        }
    }
    return (0);
}

function is32BitInf(TheNumberToTest) {
    var Exponent;
    var Mantissa;

    Exponent = (TheNumberToTest & 0x7F800000) >> 23;
    Mantissa = (TheNumberToTest & 0x007FFFFF);

    if (Exponent == 0xFF) {
        if (Mantissa == 0) {
            return (1);
        }
    }
    return (0);
}
function ConvertIEE754(msw, lsw) {
    // set denom=2^23
    //Check	for	NaN	or infinity
    //if((msw &	0x7fc0)	>> 6== 0xff	|| (msw	& 0x7fc0) >> 6 ==0x1FF)
    //	return R_ERR;
    var num = (msw << 16) | (lsw);
    if (is32BitInf(num) || is32BitNaN(num))
        return R_ERR;

    denom = 0x800000;
    mantissa = 0;
    expon = 0;
    // cycle through lsw
    for (i = 16; i > 0; i--) {
        if (lsw & 1)
            mantissa += (1 / denom);
        denom = denom >> 1;
        lsw = lsw >> 1;
    }
    // continue	through	lower 7	bits of	msw
    for (i = 7; i > 0; i--) {
        if (msw & 1)
            mantissa += (1 / denom);
        denom = denom >> 1;
        msw = msw >> 1;
    }
    // get expon
    expon = (0xff & msw) - 127;
    // get sign
    if (0x100 & msw)
        sign = -1;
    else
        sign = 1;

    // return m*2^e
    return (sign * (1 + mantissa) * Math.pow(2, expon));
}
function ConvertLongInt(msw, lsw) {
    var temp = msw * 0x10000;
    temp += lsw;
    return (temp);
}
function ConvertSignedLongInt(msw, lsw) {
    var l = msw;
    l <<= 16;
    l |= lsw;

    return (l);
}

function ConvertPF(msw, lsw) {
    var ScaledData;
    var Data="";
    var FixedDec=5;
    var Scale = "0";

    var LL = document.getElementById("leadLag");
	  var R_Lag = LL.lag.value;
	  var R_Lead = LL.lead.value;

    if (Scale == null || Scale == "null") {
        SF_dec = 0;
        ScaleFactor = 1;
    }
    else if (parseInt(Scale) == Scale) {
        setFixedScale(Scale);
    }
    ScaledData = ConvertIEE754(msw, lsw);
    if (ScaledData != R_ERR) {
        ScaledData = ScaledData * ScaleFactor;

        Data = Format(ScaledData, FixedDec, true);

        if (Math.abs(Data) > 1) {
            //(is in	quad 2 or 4)
            if (Data < 0)
                Data = Format(-(2 - Math.abs(Data)), FixedDec, true);
            else
                Data = Data = Format((2 - Math.abs(Data)), FixedDec, true);
            Data += "	" + R_Lead;
        }
        else if (Math.abs(Data) < 1) {
            Data += " " + R_Lag;
        }
    }
    else
    {
        Data = ScaledData * ScaleFactor;
    }
    return (Data);
}

function GetDate_Time_4Reg2(r) {
    if ((r[0] == 0xFFFF) || (r[1] == 0xFFFF) || (r[2] == 0xFFFF) || (r[3] == 0xFFFF)) {
        return R_ERR;
    }
    else {
        y = r[0] & 0x7F;
        y += 2000;

        d = r[1] & 0x1F;
        r[1] = r[1] >> 8;
        m = r[1] & 0XF;

        mi = r[2] & 0x3F;
        r[2] = r[2] >> 8;
        h = r[2] & 0X1F;

        s = parseInt(r[3] / 1000);

        if (h < 10) h = "0" + h;
        if (s < 10) s = "0" + s;
        if (mi < 10) mi = "0" + mi;
        if (m < 10) m = "0" + m;
        if (d < 10) d = "0" + d;
    }
    //console.log(y+m+d+h+mi+s);
    return applyLocalTimeOffsets(y,m,d,h,mi,s);
}

function setFixedScale(Scale) {
    SF_dec = 0;
    switch (parseInt(Scale)) {
        case -6: ScaleFactor = 0.000001; SF_dec = 6; break;
        case -5: ScaleFactor = 0.00001; SF_dec = 5; break;
        case -4: ScaleFactor = 0.0001; SF_dec = 4; break;
        case -3: ScaleFactor = 0.001; SF_dec = 3; break;
        case -2: ScaleFactor = 0.01; SF_dec = 2; break;
        case -1: ScaleFactor = 0.1; SF_dec = 1; break;
        case 1: ScaleFactor = 10.0; break;
        case 2: ScaleFactor = 100.0; break;
        case 3: ScaleFactor = 1000.0; break;
        case 4: ScaleFactor = 10000.0; break;
        case 5: ScaleFactor = 100000.0; break;
        case 6: ScaleFactor = 1000000.0; break;
        default: ScaleFactor = 1;
    }
}
function Format(num, dec, LeadingZero) {
    if (dec == null || isNaN(num)) return num;

    var tmpNum = parseFloat(num);
    //console.log("tmpNum");
    //console.log(tmpNum);

    //if(tmpNum==-32768) return	R_ERR;
    //var tmpStr = new String(tmpNum.toFixed(dec));
    var tmpStr = tmpNum.toFixed(dec);
    //console.log("tmpStr");
    //console.log(tmpStr);
    // See if we need to hack off a	leading	zero or	not
    if (!LeadingZero && num < 1 && num > -1 && num != 0) {
        if (num > 0) {
            tmpStr = tmpStr.substring(1, tmpStr.length);
            console.log("num>0");
            console.log(tmpStr);
        } else {
            tmpStr = "-" + tmpStr.substring(2, tmpStr.length);
            console.log("else");
            console.log(tmpStr);
        }
    }
    return tmpStr;
}

function format_powerfactor2(HTMLTag, Data, FixedDec) {
    var pfText = "";

    Data = Format(Data, FixedDec, true);

    if (Math.abs(Data) > 1) {
        //(is in	quad 2 or 4)
        if (Data < 0)
            Data = Format(-(2 - Math.abs(Data)), FixedDec, true);
        else
            Data = Data = Format((2 - Math.abs(Data)), FixedDec, true);
        Data += "	"; // + R_Lead;
    }
    else if (Math.abs(Data) < 1) {
        Data += " "; // + R_Lag;
    }
    //console.log(Data);
    //setText(HTMLTag, Data);
    return Data;
}

function setText(tag, data, digits, leadingZero) {
    // This will return a length of zero if the element doesn't have a name
    // Unless it is IE, then it gets the element by Id, even though that
    // is NOT what this function is called
    //console.log("data");
    //console.log(data);
    //console.log("digits");
    //console.log(digits);
    //console.log("leadingZero");
    //console.log(leadingZero);
    return Format(data, digits, leadingZero);

    /*
    var collection = document.getElementsByName(tag);

    // All browsers, except IE where the element doesn't have a name
    if (collection.length == 0) {
        collection = document.getElementById(tag);
        if (collection != null) {
            collection.value = Format(data, digits, leadingZero);
        }
    }
    else {
        // Check for INPUT tag (workaround for IE)
        if (collection[0].tagName == 'INPUT') {
            collection[0].value = Format(data, digits, leadingZero);
        }
        else {
            for (var i = 0; i < collection.length; i++) {
                collection[i].innerHTML = Format(data, digits, leadingZero);
            }
        }
    }
    */
}

function whatDecimalSeparator() {
    var n = 1.1;
    n = n.toLocaleString().substring(1,2);
    return (n);
}

function numberWithCommas(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}


exports.FormatData = function(HTMLTag, Type, ArrayIndex, Scale, FixedDec, Multiplier, rxBuff) {
    var TempData;
    var TempData2;
    var ScaledData;
    var Data = new Array();

    if (Scale == null || Scale == "null") {
        SF_dec = 0;
        ScaleFactor = 1;
    }
    else if (parseInt(Scale) == Scale) {
        setFixedScale(Scale);
    }

    if (parseInt(FixedDec) == FixedDec && parseInt(FixedDec) > 0) SF_dec = FixedDec;
    switch (Type) {
        case 'S64': // Int 64
            Data = rxBuff.slice(ArrayIndex, ArrayIndex + 4);
            ScaledData = ConvertInt64(Data[0], Data[1], Data[2], Data[3], Scale, Multiplier);
            setText(HTMLTag, numberWithCommas(ScaledData).toLocaleString());
            break;
        case 'FL32': // IEEE754 32-bit Floating Point
            Data = rxBuff.slice(ArrayIndex, ArrayIndex + 2);
            //console.log(ArrayIndex);
            //console.log(Data);
            ScaledData = ConvertIEE754(Data[0], Data[1]);
            //console.log(ScaledData);
            break;
        case 'DT4Reg': //Date Time -	PM5000
            //console.log("rxBuff: ");
            //console.log(rxBuff);
            Data = rxBuff.slice(ArrayIndex, ArrayIndex + 4);
            //console.log("Data: ")
            //console.log(Data);
            testString = GetDate_Time_4Reg2(Data);
            //console.log("testString: ");
            //console.log(testString);
            //setText(HTMLTag, testString);
            return testString;
        case 'PF_FL32_2': //	IEEE754	32-bit Floating	Point -	PM5000 format --- "4Q_FP_PF" in modbus register list
            Data = rxBuff.slice(ArrayIndex, ArrayIndex + 2);
            ScaledData = ConvertIEE754(Data[0], Data[1]);
            if (ScaledData != R_ERR) {
                ScaledData = ScaledData * ScaleFactor;
                format_powerfactor2(HTMLTag, ScaledData, FixedDec, false);
                //return;
                break;
            }
            break;

        default: // Invalid
            ScaledData = R_ERR;
            break;
    }
    if (ScaledData != R_ERR) {
        ScaledData = ScaledData * ScaleFactor;
        if (Multiplier) {
            ScaledData = ScaledData * Multiplier;
        }
        //console.log(ScaledData);
        //setText(HTMLTag, ScaledData, SF_dec, true);
        return Number(ScaledData.toFixed(FixedDec));
    }
    else {
        //setText(HTMLTag, ScaledData);
        //console.log(ScaledData);
        return ScaledData;
    }
    return;
}

function clearData() {
    var collection = document.getElementsByTagName("a");

    var index;
    var nametag
    for (var i = 0; i < collection.length; i++) {
        collection[i].innerHTML = R_ERR;
    }
}

function realTimeDataLoad() {
    basic_window_onload();

}


function applyLocalTimeOffsets(year,month,day,hour,min,sec)
{
    // Convert gmt time to milliseconds since January 1st, 1970
    strDate = year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':' + sec + '.000Z';
    gmtTime = Date.parse(strDate);

    if ( isNaN(gmtTime) )
    {
        return "N/A"
    }

    // Check if we need to apply DST corrections
    applyDst = shouldApplyDstTimeAdjustment ( gmtTime );
    if ( applyDst == true )
    {
        // Apply DST corrections by adding one hour to the current time
        gmtTime += 60 * 60 * 1000;
    }

    // Convert UTC time offset from minutes to milliseconds and then add it to gmtTime
    gmtTime += (TIME_UTC_OFFSET * 60 * 1000);

    // Obtain the local time in Date() format
    localTime = new Date();
    localTime.setTime(gmtTime);

    // Convert back to timestamp format
    year = localTime.getUTCFullYear();
    month = localTime.getUTCMonth() + 1;
    day = localTime.getUTCDate();

    hour = localTime.getUTCHours();
    min = localTime.getUTCMinutes();
    sec = localTime.getUTCSeconds();

    if (day < 10)   day = "0" + day
    if (month < 10) month = "0" + month
    if (hour < 10)  hour = "0" + hour;
    if (min < 10)   min  = "0" + min;
    if (sec < 10)   sec  = "0" + sec;

    return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
}

function shouldApplyDstTimeAdjustment ( localtime )
{
    isDst = false;

    if ( TIME_DST_AUTO_ADJUST == 1 )
    {
        isDst = isDstTime ( localtime )
    }

    return isDst;
}

function isDstTime ( localtime )
{
    var dstStart = new Date();
    var dstEnd = new Date();
    var isDst = false;
    var dstEndYear;
    var dstStartYear;
    var dstStartMonth;
    var dstEndMonth;

    localDate = new Date();
    localDate.setTime(localtime);

    dstEndYear = localDate.getFullYear();
    dstStartYear = dstEndYear;

    dstStartMonth = parseInt(TIME_DST_START_MONTH);
    dstEndMonth = parseInt(TIME_DST_END_MONTH);

    if ( dstEndMonth < dstStartMonth )
    {
        if ( dstStartMonth <= localDate.getMonth() )
        {
            dstEndYear++;
        }
        else if ( dstEndMonth >= localDate.getMonth() )
        {
            dstStartYear--;
        }
    }

    dstStart = getNthWeekdayOfMonth ( parseInt(TIME_DST_START_WEEK), parseInt(TIME_DST_START_DAY),
                                      dstStartMonth - 1, dstStartYear);
    dstStart.setHours(TIME_DST_START_HOUR);

    dstEnd = getNthWeekdayOfMonth ( parseInt(TIME_DST_END_WEEK), parseInt(TIME_DST_END_DAY),
                                    dstEndMonth - 1, dstEndYear);
    dstEnd.setHours(TIME_DST_END_HOUR);

    if ( (dstStart <= localDate) && (dstEnd > localDate) )
    {
       isDst = true;
    }

    return isDst;
}


function getNthWeekdayOfMonth ( weekOffset, wday, targetMonth, year )
{
    daysInMonth = getDaysInMonth(wday, targetMonth, year);
    numDays = daysInMonth.length;

    if ( weekOffset > numDays)
    {
        weekOffset = numDays
    };

    return daysInMonth[weekOffset - 1];

}

function getDaysInMonth(wday, month, year)
{
    var d = new Date(year, month, 1),
    days = [];

    d.setDate(d.getDate() + ( (7 + wday) - d.getDay()) % 7)
    while (d.getMonth() === month) {
        days.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 7);
    }

    return days;
}

