require('dotenv').config();
var FormatData = require('./js/realtimedata').FormatData;
var egz_io_FormatData = require('./js/i_o_status').egz_io_FormatData;
var request = require('request');
var fs = require('fs');
var traverse = require('traverse');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var globalTimerID = 0;

var dbURL = 'mongodb://localhost:27017/pm5560';
//var meterURL = "http://192.168.25.197"; // Internal Meter IP
//var meterURL = "http://179.182.193.20"; // DHCP PowerBox Public IP
var meterURL = "http://energizei.ddns.net" // No-ip Dynamic DNS

var oneSecondMetering = function(url, collection) {
  { // var oneSecond_tag
    var oneSecond_tag = "PL_" + "_*^H1837[7]" + "__PL" + "," +       // timekeeping
                        "PL_" + "_*^H2400[2]" + "__PL" + "," +       // digital input
    										"PL_" + "_*^H2402[2]" + "__PL" + "," +       // digital output
    										"PL_" + "_*^H3000[12]" + "__PL" + "," +      // current A, B, C, N, G, avg
                        "PL_" + "_*^H3012[8]" + "__PL" + "," +       // current unbalance A, B, C, worst
                        "PL_" + "_*^H3020[16]" + "__PL" + "," +      // voltage (phase, line and avgs)
                        "PL_" + "_*^H3038[16]" + "__PL" + "," +      // voltage unbalance A, B, C, worst
                        "PL_" + "_*^H3054[24]" + "__PL" + "," +      // power
    										"PL_" + "_*^H3078[16]" + "__PL" + "," +      // power factor
                        "PL_" + "_*^H3110[2]" + "__PL" + "," +       // frequency
                        "PL_" + "_*^H3132[2]" + "__PL" + "," +       // temperature
                        "PL_" + "_*^H3134[1]" + "__PL" + "," +       // phase rotation
                        "PL_" + "_*^H3192[4]" + "__PL" + "," +       // power_fact_iec_16u, power_fact_total_16u
                                                                     // Array.length = 112 (Index = Array - 1 ---> 111)
                        "PL_" + "_*^H21016[2]" + "__PL" + "," +      // high speed metering frequency
                        "PL_" + "_*^H21300[54]" + "__PL" + "," +     // THD and thd of current, demand and voltage
                        "PL_" + "_*^H21358[26]" + "__PL" + "," +     // K-factor and crest factor
                        "PL_" + "_*^H21712[30]" + "__PL" + "," +     // Harmonics Voltage AB H1-H5
                        "PL_" + "_*^H21742[30]" + "__PL" + "," +     // Harmonics Voltage AB H6-H10
                        "PL_" + "_*^H21772[30]" + "__PL" + "," +     // Harmonics Voltage AB H11-H15
                        "PL_" + "_*^H22802[30]" + "__PL" + "," +     // Harmonics Voltage AB H16-H20
                        "PL_" + "_*^H21832[30]" + "__PL" + "," +     // Harmonics Voltage AB H21-H25
                                                                     // Array.length = 346 (Index = Array - 1 ---> 345)
                        "PL_" + "_*^H22100[30]" + "__PL" + "," +     // Harmonics Voltage BC H1-H5
                        "PL_" + "_*^H22130[30]" + "__PL" + "," +     // Harmonics Voltage BC H6-H10
                        "PL_" + "_*^H22160[30]" + "__PL" + "," +     // Harmonics Voltage BC H11-H15
                        "PL_" + "_*^H22190[30]" + "__PL" + "," +     // Harmonics Voltage BC H16-H20
                        "PL_" + "_*^H22220[30]" + "__PL" + "," +     // Harmonics Voltage BC H21-H25
                                                                     // Array.length = 496 (Index = Array - 1 ---> 495)
                        "PL_" + "_*^H22488[30]" + "__PL" + "," +     // Harmonics Voltage CA H1-H5 [start with 498..]
                        "PL_" + "_*^H22518[30]" + "__PL" + "," +     // Harmonics Voltage CA H6-H10
                        "PL_" + "_*^H22548[30]" + "__PL" + "," +     // Harmonics Voltage CA H11-H15
                        "PL_" + "_*^H22578[30]" + "__PL" + "," +     // Harmonics Voltage CA H16-H20
                        "PL_" + "_*^H22608[30]" + "__PL" + "," +     // Harmonics Voltage CA H21-H25
                                                                     // Array.length = 646 (Index = Array - 1 ---> 645)
                        "PL_" + "_*^H22876[30]" + "__PL" + "," +     // Harmonics Voltage AN H1-H5 [start with 648..]
                        "PL_" + "_*^H22906[30]" + "__PL" + "," +     // Harmonics Voltage AN H6-H10
                        "PL_" + "_*^H22936[30]" + "__PL" + "," +     // Harmonics Voltage AN H11-H15
                        "PL_" + "_*^H22966[30]" + "__PL" + "," +     // Harmonics Voltage AN H16-H20
                        "PL_" + "_*^H22996[30]" + "__PL" + "," +     // Harmonics Voltage AN H21-H25
                                                                     // Array.length = 796 (Index = Array - 1 ---> 795)
                        "PL_" + "_*^H23264[30]" + "__PL" + "," +     // Harmonics Voltage BN H1-H5 [start with 798..]
                        "PL_" + "_*^H23294[30]" + "__PL" + "," +     // Harmonics Voltage BN H6-H10
                        "PL_" + "_*^H23324[30]" + "__PL" + "," +     // Harmonics Voltage BN H11-H15
                        "PL_" + "_*^H23354[30]" + "__PL" + "," +     // Harmonics Voltage BN H16-H20
                        "PL_" + "_*^H23384[30]" + "__PL" + "," +     // Harmonics Voltage BN H21-H25
                                                                     // Array.length = 946 (Index = Array - 1 ---> 945)
                        "PL_" + "_*^H23652[30]" + "__PL" + "," +     // Harmonics Voltage CN H1-H5 [start with 948..]
                        "PL_" + "_*^H23682[30]" + "__PL" + "," +     // Harmonics Voltage CN H6-H10
                        "PL_" + "_*^H23712[30]" + "__PL" + "," +     // Harmonics Voltage CN H11-H15
                        "PL_" + "_*^H23742[30]" + "__PL" + "," +     // Harmonics Voltage CN H16-H20
                        "PL_" + "_*^H23772[30]" + "__PL" + "," +     // Harmonics Voltage CN H21-H25
                                                                     // Array.length = 1096 (Index = Array - 1 ---> 1095)
                        "PL_" + "_*^H24428[30]" + "__PL" + "," +     // Harmonics Current A H1-H5 [start with 1098..]
                        "PL_" + "_*^H24458[30]" + "__PL" + "," +     // Harmonics Current A H6-H10
                        "PL_" + "_*^H24488[30]" + "__PL" + "," +     // Harmonics Current A H11-H15
                        "PL_" + "_*^H24518[30]" + "__PL" + "," +     // Harmonics Current A H16-H20
                        "PL_" + "_*^H24548[30]" + "__PL" + "," +     // Harmonics Current A H21-H25
                                                                     // Array.length = 1246 (Index = Array - 1 ---> 1245)
                        "PL_" + "_*^H24816[30]" + "__PL" + "," +     // Harmonics Current B H1-H5 [start with 1248..]
                        "PL_" + "_*^H24846[30]" + "__PL" + "," +     // Harmonics Current B H6-H10
                        "PL_" + "_*^H24876[30]" + "__PL" + "," +     // Harmonics Current B H11-H15
                        "PL_" + "_*^H24906[30]" + "__PL" + "," +     // Harmonics Current B H16-H20
                        "PL_" + "_*^H24936[30]" + "__PL" + "," +     // Harmonics Current B H21-H25
                                                                     // Array.length = 1396 (Index = Array - 1 ---> 1395)
                        "PL_" + "_*^H25204[30]" + "__PL" + "," +     // Harmonics Current C H1-H5 [start with 1398..]
                        "PL_" + "_*^H25234[30]" + "__PL" + "," +     // Harmonics Current C H6-H10
                        "PL_" + "_*^H25264[30]" + "__PL" + "," +     // Harmonics Current C H11-H15
                        "PL_" + "_*^H25294[30]" + "__PL" + "," +     // Harmonics Current C H16-H20
                        "PL_" + "_*^H25324[30]" + "__PL" + "," +     // Harmonics Current C H21-H25
                                                                     // Array.length = 1546 (Index = Array - 1 ---> 1545)
                        "PL_" + "_*^H25592[30]" + "__PL" + "," +     // Harmonics Current N H1-H5 [start with 1398..]
                        "PL_" + "_*^H25622[30]" + "__PL" + "," +     // Harmonics Current N H6-H10
                        "PL_" + "_*^H25652[30]" + "__PL" + "," +     // Harmonics Current N H11-H15
                        "PL_" + "_*^H25682[30]" + "__PL" + "," +     // Harmonics Current N H16-H20
                        "PL_" + "_*^H25712[30]" + "__PL" + "," +     // Harmonics Current N H21-H25
                                                                     // Array.length = 1696 (Index = Array - 1 ---> 1695)
                        "PL_" + "_*^H25980[30]" + "__PL" + "," +     // Harmonics Current G H1-H5 [start with 1698..]
                        "PL_" + "_*^H26010[30]" + "__PL" + "," +     // Harmonics Current G H6-H10
                        "PL_" + "_*^H26040[30]" + "__PL" + "," +     // Harmonics Current G H11-H15
                        "PL_" + "_*^H26070[30]" + "__PL" + "," +     // Harmonics Current G H16-H20
                        "PL_" + "_*^H26100[30]" + "__PL";// + "," +  // Harmonics Current G H21-H25
                                                                     // Array.length = 1846 (Index = Array - 1 ---> 1845)
  }
  var rxBuff = [];
  request.post({
    url: url + "/UE/Post__PL__Data",
    form: oneSecond_tag },
  	function(error, response, body) {
      if (error) {
        throw error;
        //oneSecondMetering(url, collection);
      }
      console.log(response.statusCode);
      if (response.statusCode == 200) {
        rxBuff = body.split(",");
        console.log("rxBuff time indexes for debuggin Issue #1");
        for (var index = 0; index < 8; index++) {
          console.log(rxBuff[index]);
        }
        var oneSecondReading = {
          time_iso: new Date(
            Number(rxBuff[0]),
            Number(rxBuff[1] - 1), // month is zero index based
            Number(rxBuff[2]),
            Number(rxBuff[3] - 2), // daylight save time - refactor later
            Number(rxBuff[4]),
            Number(rxBuff[5]),
            Number(rxBuff[6])
          ).toISOString(),
  				digital_input_status: {
			      di_01: egz_io_FormatData(rxBuff, 7, 1),
			      di_02: egz_io_FormatData(rxBuff, 7, 2),
			      di_03: egz_io_FormatData(rxBuff, 7, 4),
			      di_04: egz_io_FormatData(rxBuff, 7, 8)
			    },
  			  digital_output_status: {
			      do_01: egz_io_FormatData(rxBuff, 9, 1),
			      do_02: egz_io_FormatData(rxBuff, 9, 2)
			    },
  				meter_data_basic: {
			      current: {
			        A: FormatData("IA", "FL32", 11, "0", 2, false, rxBuff),
			        B: FormatData("IB", "FL32", 13, "0", 2, false, rxBuff),
			        C: FormatData("IC", "FL32", 15, "0", 2, false, rxBuff),
			        N: FormatData("IN", "FL32", 17, "0", 2, false, rxBuff),
			        G: FormatData("IG", "FL32", 19, "0", 2, false, rxBuff),
			        avg: FormatData("IAvg", "FL32", 21, "0", 2, false, rxBuff)
			      },
					  current_unbal: {
			        A: FormatData("IunbA", "FL32", 23, "0", 2, false, rxBuff),
			        B: FormatData("IunbB", "FL32", 25, "0", 2, false, rxBuff),
			        C: FormatData("IunbC", "FL32", 27, "0", 2, false, rxBuff),
			        worst: FormatData("IunbWorst", "FL32", 29, "0", 2, false, rxBuff)
			      },
					  voltage: {
			        AB: FormatData("VAB", "FL32", 31, "0", 2, false, rxBuff),
			        BC: FormatData("VBC", "FL32", 33, "0", 2, false, rxBuff),
			        CA: FormatData("VCA", "FL32", 35, "0", 2, false, rxBuff),
			        LL_avg: FormatData("VLLavg", "FL32", 37, "0", 2, false, rxBuff),
			        AN: FormatData("VAN", "FL32", 39, "0", 2, false, rxBuff),
			        BN: FormatData("VBN", "FL32", 41, "0", 2, false, rxBuff),
			        CN: FormatData("VCN", "FL32", 43, "0", 2, false, rxBuff),
			        LN_avg: FormatData("VLNavg", "FL32", 45, "0", 2, false, rxBuff)
			      },
					  voltage_unbal: {
			        AB: FormatData("VunbAB", "FL32", 47, "0", 2, false, rxBuff),
			        BC: FormatData("VunbBC", "FL32", 49, "0", 2, false, rxBuff),
			        CA: FormatData("VunbCA", "FL32", 51, "0", 2, false, rxBuff),
			        LL_avg: FormatData("VunbLL", "FL32", 53, "0", 2, false, rxBuff),
			        AN: FormatData("VunbAN", "FL32", 55, "0", 2, false, rxBuff),
			        BN: FormatData("VunbBN", "FL32", 57, "0", 2, false, rxBuff),
			        CN: FormatData("VunbCN", "FL32", 59, "0", 2, false, rxBuff),
			        LN_avg: FormatData("VunbLN", "FL32", 61, "0", 2, false, rxBuff),
			      },
					  power: {
			        act_A: FormatData("ActPwA", "FL32", 63, "0", 2, false, rxBuff),
			        act_B: FormatData("ActPwB", "FL32", 65, "0", 2, false, rxBuff),
			        act_C: FormatData("ActPwC", "FL32", 67, "0", 2, false, rxBuff),
			        act_total: FormatData("ActPwTtl", "FL32", 69, "0", 2, false, rxBuff),
			        react_A: FormatData("ReactPwA", "FL32", 71, "0", 2, false, rxBuff),
			        react_B: FormatData("ReactPwB", "FL32", 73, "0", 2, false, rxBuff),
			        react_C: FormatData("ReactPwC", "FL32", 75, "0", 2, false, rxBuff),
			        react_total: FormatData("ReactPwTtl", "FL32", 77, "0", 2, false, rxBuff),
			        appar_A: FormatData("AppPwA", "FL32", 79, "0", 2, false, rxBuff),
			        appar_B: FormatData("AppPwB", "FL32", 81, "0", 2, false, rxBuff),
			        appar_C: FormatData("AppPwC", "FL32", 83, "0", 2, false, rxBuff),
			        appar_total: FormatData("AppPwTtl", "FL32", 85, "0", 2, false, rxBuff)
			      },
					  power_factor: {
			        A: FormatData("PFA", "PF_FL32_2", 87, "0", 5, false, rxBuff),
			        B: FormatData("PFB", "PF_FL32_2", 89, "0", 5, false, rxBuff),
			        C: FormatData("PFC", "PF_FL32_2", 91, "0", 5, false, rxBuff),
			        total: FormatData("PFTtl", "PF_FL32_2", 93, "0", 5, false, rxBuff),
			        displ_A: FormatData("DispPFA", "PF_FL32_2", 95, "0", 5, false, rxBuff),
			        displ_B: FormatData("DispPFB", "PF_FL32_2", 97, "0", 5, false, rxBuff),
			        displ_C: FormatData("DispPFC", "PF_FL32_2", 99, "0", 5, false, rxBuff),
			        displ_total: FormatData("DispPFTtl", "PF_FL32_2", 101, "0", 5, false, rxBuff)
			      },
            frequency: FormatData("Freq", "FL32", 103, "0", 2, false, rxBuff),
            temperature: FormatData("Temperature", "FL32", 105, "0", 2, false, rxBuff),
            misc: {
              //FormatData("Freq", "FL32", 107, "0", 2, false, rxBuff),
              phase_rot: Number(rxBuff[107]),                    // INT16U
              PF_total_iec: FormatData("Freq", "FL32", 108, "0", 2, false, rxBuff),
              PF_total_lead_lag: FormatData("Freq", "FL32", 110, "0", 2, false, rxBuff)
            }
          },
          power_quality: {
            hsm_frequency: FormatData("HighSpeedMetFreq", "FL32", 112, "0", 2, false, rxBuff),
            THD_current: {
              A: FormatData("THDCurrentA", "FL32", 114, "0", 2, false, rxBuff),
              B: FormatData("THDCurrentB", "FL32", 116, "0", 2, false, rxBuff),
              C: FormatData("THDCurrentC", "FL32", 118, "0", 2, false, rxBuff),
              N: FormatData("THDCurrentN", "FL32", 120, "0", 2, false, rxBuff),
              G: FormatData("THDCurrentG", "FL32", 122, "0", 2, false, rxBuff)
            },
            thd_current: {
              A: FormatData("thdCurrentA", "FL32", 124, "0", 2, false, rxBuff),
              B: FormatData("thdCurrentB", "FL32", 126, "0", 2, false, rxBuff),
              C: FormatData("thdCurrentC", "FL32", 128, "0", 2, false, rxBuff),
              N: FormatData("thdCurrentN", "FL32", 130, "0", 2, false, rxBuff),
              G: FormatData("thdCurrentG", "FL32", 132, "0", 2, false, rxBuff)
            },
            total_demand_distortion: FormatData("HighSpeedMetFreq", "FL32", 134, "0", 2, false, rxBuff),
            THD_voltage: {
              AB: FormatData("THDVoltageAB", "FL32", 136, "0", 2, false, rxBuff),
              BC: FormatData("THDVoltageBC", "FL32", 138, "0", 2, false, rxBuff),
              CA: FormatData("THDVoltageCA", "FL32", 140, "0", 2, false, rxBuff),
              LL: FormatData("THDVoltageLL", "FL32", 142, "0", 2, false, rxBuff),
              AN: FormatData("THDVoltageAN", "FL32", 144, "0", 2, false, rxBuff),
              BN: FormatData("THDVoltageBN", "FL32", 146, "0", 2, false, rxBuff),
              CN: FormatData("THDVoltageCN", "FL32", 148, "0", 2, false, rxBuff),
              LN: FormatData("THDVoltageLN", "FL32", 150, "0", 2, false, rxBuff)
            },
            thd_voltage: {
              AB: FormatData("thdVoltageAB", "FL32", 152, "0", 2, false, rxBuff),
              BC: FormatData("thdVoltageBC", "FL32", 154, "0", 2, false, rxBuff),
              CA: FormatData("thdVoltageCA", "FL32", 156, "0", 2, false, rxBuff),
              LL: FormatData("thdVoltageLL", "FL32", 158, "0", 2, false, rxBuff),
              AN: FormatData("thdVoltageAN", "FL32", 160, "0", 2, false, rxBuff),
              BN: FormatData("thdVoltageBN", "FL32", 162, "0", 2, false, rxBuff),
              CN: FormatData("thdVoltageCN", "FL32", 164, "0", 2, false, rxBuff),
              LN: FormatData("thdVoltageLN", "FL32", 166, "0", 2, false, rxBuff)
            },
            K_factor: {
              A: FormatData("KFactorA", "FL32", 168, "0", 2, false, rxBuff),
              B: FormatData("KFactorB", "FL32", 170, "0", 2, false, rxBuff),
              C: FormatData("KFactorC", "FL32", 172, "0", 2, false, rxBuff)
            },
            crest_factor: {
              A: FormatData("CrestFactorA", "FL32", 174, "0", 2, false, rxBuff),
              B: FormatData("CrestFactorB", "FL32", 176, "0", 2, false, rxBuff),
              C: FormatData("CrestFactorC", "FL32", 178, "0", 2, false, rxBuff),
              N: FormatData("CrestFactorN", "FL32", 180, "0", 2, false, rxBuff),
              volt_AB: FormatData("CrestFactorVoltageAB", "FL32", 182, "0", 2, false, rxBuff),
              volt_BC: FormatData("CrestFactorVoltageBC", "FL32", 184, "0", 2, false, rxBuff),
              volt_CA: FormatData("CrestFactorVoltageCA", "FL32", 186, "0", 2, false, rxBuff),
              volt_AN: FormatData("CrestFactorVoltageAN", "FL32", 188, "0", 2, false, rxBuff),
              volt_BN: FormatData("CrestFactorVoltageBN", "FL32", 190, "0", 2, false, rxBuff),
              volt_CN: FormatData("CrestFactorVoltageCN", "FL32", 192, "0", 2, false, rxBuff)
            },
            Harmonics_voltage: {
              AB: {
                h1: {
                  rate: FormatData("H1VoltageABPercent", "FL32", 194, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageABMagnitude", "FL32", 196, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageABAngle", "FL32", 198, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageABPercent", "FL32", 200, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageABMagnitude", "FL32", 202, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageABAngle", "FL32", 204, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageABPercent", "FL32", 206, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageABMagnitude", "FL32", 208, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageABAngle", "FL32", 210, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageABPercent", "FL32", 212, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageABMagnitude", "FL32", 214, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageABAngle", "FL32", 216, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageABPercent", "FL32", 218, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageABMagnitude", "FL32", 220, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageABAngle", "FL32", 222, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageABPercent", "FL32", 224, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageABMagnitude", "FL32", 226, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageABAngle", "FL32", 228, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageABPercent", "FL32", 230, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageABMagnitude", "FL32", 232, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageABAngle", "FL32", 234, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageABPercent", "FL32", 236, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageABMagnitude", "FL32", 238, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageABAngle", "FL32", 240, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageABPercent", "FL32", 242, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageABMagnitude", "FL32", 244, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageABAngle", "FL32", 246, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageABPercent", "FL32", 248, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageABMagnitude", "FL32", 250, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageABAngle", "FL32", 252, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageABPercent", "FL32", 254, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageABMagnitude", "FL32", 256, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageABAngle", "FL32", 258, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageABPercent", "FL32", 260, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageABMagnitude", "FL32", 262, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageABAngle", "FL32", 264, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageABPercent", "FL32", 266, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageABMagnitude", "FL32", 268, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageABAngle", "FL32", 270, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageABPercent", "FL32", 272, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageABMagnitude", "FL32", 274, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageABAngle", "FL32", 276, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageABPercent", "FL32", 278, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageABMagnitude", "FL32", 280, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageABAngle", "FL32", 282, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageABPercent", "FL32", 284, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageABMagnitude", "FL32", 286, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageABAngle", "FL32", 288, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageABPercent", "FL32", 290, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageABMagnitude", "FL32", 292, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageABAngle", "FL32", 294, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageABPercent", "FL32", 296, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageABMagnitude", "FL32", 298, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageABAngle", "FL32", 300, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageABPercent", "FL32", 302, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageABMagnitude", "FL32", 304, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageABAngle", "FL32", 306, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageABPercent", "FL32", 308, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageABMagnitude", "FL32", 310, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageABAngle", "FL32", 312, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageABPercent", "FL32", 314, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageABMagnitude", "FL32", 316, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageABAngle", "FL32", 318, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageABPercent", "FL32", 320, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageABMagnitude", "FL32", 322, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageABAngle", "FL32", 324, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageABPercent", "FL32", 326, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageABMagnitude", "FL32", 328, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageABAngle", "FL32", 330, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageABPercent", "FL32", 332, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageABMagnitude", "FL32", 334, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageABAngle", "FL32", 336, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageABPercent", "FL32", 338, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageABMagnitude", "FL32", 340, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageABAngle", "FL32", 342, "0", 2, false, rxBuff)
                }
              },
              BC: {
                h1: {
                  rate: FormatData("H1VoltageBCPercent", "FL32", 344, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageBCMagnitude", "FL32", 346, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageBCAngle", "FL32", 348, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageBCPercent", "FL32", 350, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageBCMagnitude", "FL32", 352, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageBCAngle", "FL32", 354, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageBCPercent", "FL32", 356, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageBCMagnitude", "FL32", 358, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageBCAngle", "FL32", 360, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageBCPercent", "FL32", 362, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageBCMagnitude", "FL32", 364, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageBCAngle", "FL32", 366, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageBCPercent", "FL32", 368, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageBCMagnitude", "FL32", 370, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageBCAngle", "FL32", 372, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageBCPercent", "FL32", 374, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageBCMagnitude", "FL32", 376, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageBCAngle", "FL32", 378, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageBCPercent", "FL32", 380, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageBCMagnitude", "FL32", 382, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageBCAngle", "FL32", 384, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageBCPercent", "FL32", 386, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageBCMagnitude", "FL32", 388, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageBCAngle", "FL32", 390, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageBCPercent", "FL32", 392, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageBCMagnitude", "FL32", 394, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageBCAngle", "FL32", 396, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageBCPercent", "FL32", 398, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageBCMagnitude", "FL32", 400, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageBCAngle", "FL32", 402, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageBCPercent", "FL32", 404, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageBCMagnitude", "FL32", 406, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageBCAngle", "FL32", 408, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageBCPercent", "FL32", 410, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageBCMagnitude", "FL32", 412, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageBCAngle", "FL32", 414, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageBCPercent", "FL32", 416, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageBCMagnitude", "FL32", 418, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageBCAngle", "FL32", 420, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageBCPercent", "FL32", 422, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageBCMagnitude", "FL32", 424, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageBCAngle", "FL32", 426, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageBCPercent", "FL32", 428, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageBCMagnitude", "FL32", 430, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageBCAngle", "FL32", 432, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageBCPercent", "FL32", 434, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageBCMagnitude", "FL32", 436, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageBCAngle", "FL32", 438, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageBCPercent", "FL32", 440, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageBCMagnitude", "FL32", 442, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageBCAngle", "FL32", 444, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageBCPercent", "FL32", 446, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageBCMagBCtude", "FL32", 448, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageBCAngle", "FL32", 450, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageBCPercent", "FL32", 452, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageBCMagnitude", "FL32", 454, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageBCAngle", "FL32", 456, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageBCPercent", "FL32", 458, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageBCMagnitude", "FL32", 460, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageBCAngle", "FL32", 462, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageBCPercent", "FL32", 464, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageBCMagnitude", "FL32", 466, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageBCAngle", "FL32", 468, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageBCPercent", "FL32", 470, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageBCMagnitude", "FL32", 472, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageBCAngle", "FL32", 474, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageBCPercent", "FL32", 476, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageBCMagnitude", "FL32", 478, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageBCAngle", "FL32", 480, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageBCPercent", "FL32", 482, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageBCMagnitude", "FL32", 484, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageBCAngle", "FL32", 486, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageBCPercent", "FL32", 488, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageBCMagnitude", "FL32", 490, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageBCAngle", "FL32", 492, "0", 2, false, rxBuff)
                }
              },
              CA: {
                h1: {
                  rate: FormatData("H1VoltageCAPercent", "FL32", 494, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageCAMagnitude", "FL32", 496, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageCAAngle", "FL32", 498, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageCAPercent", "FL32", 500, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageCAMagnitude", "FL32", 502, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageCAAngle", "FL32", 504, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageCAPercent", "FL32", 506, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageCAMagnitude", "FL32", 508, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageCAAngle", "FL32", 510, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageCAPercent", "FL32", 512, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageCAMagnitude", "FL32", 514, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageCAAngle", "FL32", 516, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageCAPercent", "FL32", 518, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageCAMagnitude", "FL32", 520, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageCAAngle", "FL32", 522, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageCAPercent", "FL32", 524, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageCAMagnitude", "FL32", 526, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageCAAngle", "FL32", 528, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageCAPercent", "FL32", 530, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageCAMagnitude", "FL32", 532, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageCAAngle", "FL32", 534, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageCAPercent", "FL32", 536, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageCAMagnitude", "FL32", 538, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageCAAngle", "FL32", 540, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageCAPercent", "FL32", 542, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageCAMagnitude", "FL32", 544, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageCAAngle", "FL32", 546, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageCAPercent", "FL32", 548, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageCAMagnitude", "FL32", 550, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageCAAngle", "FL32", 552, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageCAPercent", "FL32", 554, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageCAMagnitude", "FL32", 556, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageCAAngle", "FL32", 558, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageCAPercent", "FL32", 560, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageCAMagnitude", "FL32", 562, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageCAAngle", "FL32", 564, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageCAPercent", "FL32", 566, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageCAMagnitude", "FL32", 568, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageCAAngle", "FL32", 570, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageCAPercent", "FL32", 572, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageCAMagnitude", "FL32", 574, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageCAAngle", "FL32", 576, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageCAPercent", "FL32", 578, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageCAMagnitude", "FL32", 580, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageCAAngle", "FL32", 582, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageCAPercent", "FL32", 584, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageCAMagnitude", "FL32", 586, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageCAAngle", "FL32", 588, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageCAPercent", "FL32", 590, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageCAMagnitude", "FL32", 592, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageCAAngle", "FL32", 594, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageCAPercent", "FL32", 596, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageCAMagBCtude", "FL32", 598, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageCAAngle", "FL32", 600, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageCAPercent", "FL32", 602, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageCAMagnitude", "FL32", 604, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageCAAngle", "FL32", 606, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageCAPercent", "FL32", 608, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageCAMagnitude", "FL32", 610, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageCAAngle", "FL32", 612, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageCAPercent", "FL32", 614, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageCAMagnitude", "FL32", 616, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageCAAngle", "FL32", 618, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageCAPercent", "FL32", 620, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageCAMagnitude", "FL32", 622, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageCAAngle", "FL32", 624, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageCAPercent", "FL32", 626, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageCAMagnitude", "FL32", 628, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageCAAngle", "FL32", 630, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageCAPercent", "FL32", 632, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageCAMagnitude", "FL32", 634, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageCAAngle", "FL32", 636, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageCAPercent", "FL32", 638, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageCAMagnitude", "FL32", 640, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageCAAngle", "FL32", 642, "0", 2, false, rxBuff)
                }
              },
              AN: {
                h1: {
                  rate: FormatData("H1VoltageANPercent", "FL32", 644, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageANMagnitude", "FL32", 646, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageANAngle", "FL32", 648, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageANPercent", "FL32", 650, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageANMagnitude", "FL32", 652, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageANAngle", "FL32", 654, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageANPercent", "FL32", 656, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageANMagnitude", "FL32", 658, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageANAngle", "FL32", 660, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageANPercent", "FL32", 662, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageANMagnitude", "FL32", 664, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageANAngle", "FL32", 666, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageANPercent", "FL32", 668, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageANMagnitude", "FL32", 670, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageANAngle", "FL32", 672, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageANPercent", "FL32", 674, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageANMagnitude", "FL32", 676, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageANAngle", "FL32", 678, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageANPercent", "FL32", 680, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageANMagnitude", "FL32", 682, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageANAngle", "FL32", 684, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageANPercent", "FL32", 686, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageANMagnitude", "FL32", 688, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageANAngle", "FL32", 690, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageANPercent", "FL32", 692, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageANMagnitude", "FL32", 694, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageANAngle", "FL32", 696, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageANPercent", "FL32", 698, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageANMagnitude", "FL32", 700, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageANAngle", "FL32", 702, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageANPercent", "FL32", 704, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageANMagnitude", "FL32", 706, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageANAngle", "FL32", 708, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageANPercent", "FL32", 710, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageANMagnitude", "FL32", 712, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageANAngle", "FL32", 714, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageANPercent", "FL32", 716, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageANMagnitude", "FL32", 718, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageANAngle", "FL32", 720, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageANPercent", "FL32", 722, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageANMagnitude", "FL32", 724, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageANAngle", "FL32", 726, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageANPercent", "FL32", 728, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageANMagnitude", "FL32", 730, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageANAngle", "FL32", 732, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageANPercent", "FL32", 734, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageANMagnitude", "FL32", 736, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageANAngle", "FL32", 738, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageANPercent", "FL32", 740, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageANMagnitude", "FL32", 742, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageANAngle", "FL32", 744, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageANPercent", "FL32", 746, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageANMagBCtude", "FL32", 748, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageANAngle", "FL32", 750, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageANPercent", "FL32", 752, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageANMagnitude", "FL32", 754, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageANAngle", "FL32", 756, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageANPercent", "FL32", 758, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageANMagnitude", "FL32", 760, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageANAngle", "FL32", 762, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageANPercent", "FL32", 764, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageANMagnitude", "FL32", 766, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageANAngle", "FL32", 768, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageANPercent", "FL32", 770, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageANMagnitude", "FL32", 772, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageANAngle", "FL32", 774, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageANPercent", "FL32", 776, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageANMagnitude", "FL32", 778, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageANAngle", "FL32", 780, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageANPercent", "FL32", 782, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageANMagnitude", "FL32", 784, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageANAngle", "FL32", 786, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageANPercent", "FL32", 788, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageANMagnitude", "FL32", 790, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageANAngle", "FL32", 792, "0", 2, false, rxBuff)
                }
              },
              BN: {
                h1: {
                  rate: FormatData("H1VoltageBNPercent", "FL32", 794, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageBNMagnitude", "FL32", 796, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageBNAngle", "FL32", 798, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageBNPercent", "FL32", 800, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageBNMagnitude", "FL32", 802, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageBNAngle", "FL32", 804, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageBNPercent", "FL32", 806, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageBNMagnitude", "FL32", 808, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageBNAngle", "FL32", 810, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageBNPercent", "FL32", 812, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageBNMagnitude", "FL32", 814, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageBNAngle", "FL32", 816, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageBNPercent", "FL32", 818, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageBNMagnitude", "FL32", 820, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageBNAngle", "FL32", 822, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageBNPercent", "FL32", 824, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageBNMagnitude", "FL32", 826, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageBNAngle", "FL32", 828, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageBNPercent", "FL32", 830, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageBNMagnitude", "FL32", 832, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageBNAngle", "FL32", 834, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageBNPercent", "FL32", 836, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageBNMagnitude", "FL32", 838, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageBNAngle", "FL32", 840, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageBNPercent", "FL32", 842, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageBNMagnitude", "FL32", 844, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageBNAngle", "FL32", 846, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageBNPercent", "FL32", 848, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageBNMagnitude", "FL32", 850, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageBNAngle", "FL32", 852, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageBNPercent", "FL32", 854, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageBNMagnitude", "FL32", 856, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageBNAngle", "FL32", 858, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageBNPercent", "FL32", 860, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageBNMagnitude", "FL32", 862, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageBNAngle", "FL32", 864, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageBNPercent", "FL32", 866, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageBNMagnitude", "FL32", 868, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageBNAngle", "FL32", 870, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageBNPercent", "FL32", 872, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageBNMagnitude", "FL32", 874, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageBNAngle", "FL32", 876, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageBNPercent", "FL32", 878, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageBNMagnitude", "FL32", 880, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageBNAngle", "FL32", 882, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageBNPercent", "FL32", 884, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageBNMagnitude", "FL32", 886, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageBNAngle", "FL32", 888, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageBNPercent", "FL32", 890, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageBNMagnitude", "FL32", 892, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageBNAngle", "FL32", 894, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageBNPercent", "FL32", 896, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageBNMagBCtude", "FL32", 898, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageBNAngle", "FL32", 900, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageBNPercent", "FL32", 902, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageBNMagnitude", "FL32", 904, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageBNAngle", "FL32", 906, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageBNPercent", "FL32", 908, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageBNMagnitude", "FL32", 910, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageBNAngle", "FL32", 912, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageBNPercent", "FL32", 914, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageBNMagnitude", "FL32", 916, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageBNAngle", "FL32", 918, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageBNPercent", "FL32", 920, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageBNMagnitude", "FL32", 922, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageBNAngle", "FL32", 924, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageBNPercent", "FL32", 926, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageBNMagnitude", "FL32", 928, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageBNAngle", "FL32", 930, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageBNPercent", "FL32", 932, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageBNMagnitude", "FL32", 934, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageBNAngle", "FL32", 936, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageBNPercent", "FL32", 938, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageBNMagnitude", "FL32", 940, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageBNAngle", "FL32", 942, "0", 2, false, rxBuff)
                }
              },
              CN: {
                h1: {
                  rate: FormatData("H1VoltageCNPercent", "FL32", 944, "0", 2, false, rxBuff),
                  magn: FormatData("H1VoltageCNMagnitude", "FL32", 946, "0", 2, false, rxBuff),
                  ang: FormatData("H1VoltageCNAngle", "FL32", 948, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2VoltageCNPercent", "FL32", 950, "0", 2, false, rxBuff),
                  magn: FormatData("H2VoltageCNMagnitude", "FL32", 952, "0", 2, false, rxBuff),
                  ang: FormatData("H2VoltageCNAngle", "FL32", 954, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3VoltageCNPercent", "FL32", 956, "0", 2, false, rxBuff),
                  magn: FormatData("H3VoltageCNMagnitude", "FL32", 958, "0", 2, false, rxBuff),
                  ang: FormatData("H3VoltageCNAngle", "FL32", 960, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4VoltageCNPercent", "FL32", 962, "0", 2, false, rxBuff),
                  magn: FormatData("H4VoltageCNMagnitude", "FL32", 964, "0", 2, false, rxBuff),
                  ang: FormatData("H4VoltageCNAngle", "FL32", 966, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5VoltageCNPercent", "FL32", 968, "0", 2, false, rxBuff),
                  magn: FormatData("H5VoltageCNMagnitude", "FL32", 970, "0", 2, false, rxBuff),
                  ang: FormatData("H5VoltageCNAngle", "FL32", 972, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6VoltageCNPercent", "FL32", 974, "0", 2, false, rxBuff),
                  magn: FormatData("H6VoltageCNMagnitude", "FL32", 976, "0", 2, false, rxBuff),
                  ang: FormatData("H6VoltageCNAngle", "FL32", 978, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7VoltageCNPercent", "FL32", 980, "0", 2, false, rxBuff),
                  magn: FormatData("H7VoltageCNMagnitude", "FL32", 982, "0", 2, false, rxBuff),
                  ang: FormatData("H7VoltageCNAngle", "FL32", 984, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8VoltageCNPercent", "FL32", 986, "0", 2, false, rxBuff),
                  magn: FormatData("H8VoltageCNMagnitude", "FL32", 988, "0", 2, false, rxBuff),
                  ang: FormatData("H8VoltageCNAngle", "FL32", 990, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9VoltageCNPercent", "FL32", 992, "0", 2, false, rxBuff),
                  magn: FormatData("H9VoltageCNMagnitude", "FL32", 994, "0", 2, false, rxBuff),
                  ang: FormatData("H9VoltageCNAngle", "FL32", 996, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10VoltageCNPercent", "FL32", 998, "0", 2, false, rxBuff),
                  magn: FormatData("H10VoltageCNMagnitude", "FL32", 1000, "0", 2, false, rxBuff),
                  ang: FormatData("H10VoltageCNAngle", "FL32", 1002, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11VoltageCNPercent", "FL32", 1004, "0", 2, false, rxBuff),
                  magn: FormatData("H11VoltageNAMagnitude", "FL32", 1006, "0", 2, false, rxBuff),
                  ang: FormatData("H11VoltageCNAngle", "FL32", 1008, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12VoltageCNPercent", "FL32", 1010, "0", 2, false, rxBuff),
                  magn: FormatData("H12VoltageCNMagnitude", "FL32", 1012, "0", 2, false, rxBuff),
                  ang: FormatData("H12VoltageCNAngle", "FL32", 1014, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13VoltageCNPercent", "FL32", 1016, "0", 2, false, rxBuff),
                  magn: FormatData("H13VoltageCNMagnitude", "FL32", 1018, "0", 2, false, rxBuff),
                  ang: FormatData("H13VoltageCNAngle", "FL32", 1020, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14VoltageCNPercent", "FL32", 1022, "0", 2, false, rxBuff),
                  magn: FormatData("H14VoltageCNMagnitude", "FL32", 1024, "0", 2, false, rxBuff),
                  ang: FormatData("H14VoltageCNAngle", "FL32", 1026, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15VoltageCNPercent", "FL32", 1028, "0", 2, false, rxBuff),
                  magn: FormatData("H15VoltageCNMagnitude", "FL32", 1030, "0", 2, false, rxBuff),
                  ang: FormatData("H15VoltageCNAngle", "FL32", 1032, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16VoltageCNPercent", "FL32", 1034, "0", 2, false, rxBuff),
                  magn: FormatData("H16VoltageCNMagBCtude", "FL32", 1036, "0", 2, false, rxBuff),
                  ang: FormatData("H16VoltageCNAngle", "FL32", 1038, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17VoltageCNPercent", "FL32", 1040, "0", 2, false, rxBuff),
                  magn: FormatData("H17VoltageCNMagnitude", "FL32", 1042, "0", 2, false, rxBuff),
                  ang: FormatData("H17VoltageCNAngle", "FL32", 1044, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18VoltageCNPercent", "FL32", 1046, "0", 2, false, rxBuff),
                  magn: FormatData("H18VoltageCNMagnitude", "FL32", 1048, "0", 2, false, rxBuff),
                  ang: FormatData("H18VoltageCNAngle", "FL32", 1050, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19VoltageCNPercent", "FL32", 1052, "0", 2, false, rxBuff),
                  magn: FormatData("H19VoltageCNMagnitude", "FL32", 1054, "0", 2, false, rxBuff),
                  ang: FormatData("H19VoltageCNAngle", "FL32", 1056, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20VoltageCNPercent", "FL32", 1058, "0", 2, false, rxBuff),
                  magn: FormatData("H20VoltageCNMagnitude", "FL32", 1060, "0", 2, false, rxBuff),
                  ang: FormatData("H20VoltageCNAngle", "FL32", 1062, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21VoltageCNPercent", "FL32", 1064, "0", 2, false, rxBuff),
                  magn: FormatData("H21VoltageCNMagnitude", "FL32", 1066, "0", 2, false, rxBuff),
                  ang: FormatData("H21VoltageCNAngle", "FL32", 1068, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22VoltageCNPercent", "FL32", 1070, "0", 2, false, rxBuff),
                  magn: FormatData("H22VoltageCNMagnitude", "FL32", 1072, "0", 2, false, rxBuff),
                  ang: FormatData("H22VoltageCNAngle", "FL32", 1074, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23VoltageCNPercent", "FL32", 1076, "0", 2, false, rxBuff),
                  magn: FormatData("H23VoltageCNMagnitude", "FL32", 1078, "0", 2, false, rxBuff),
                  ang: FormatData("H23VoltageCNAngle", "FL32", 1080, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24VoltageCNPercent", "FL32", 1082, "0", 2, false, rxBuff),
                  magn: FormatData("H24VoltageCNMagnitude", "FL32", 1084, "0", 2, false, rxBuff),
                  ang: FormatData("H24VoltageCNAngle", "FL32", 1086, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25VoltageCNPercent", "FL32", 1088, "0", 2, false, rxBuff),
                  magn: FormatData("H25VoltageCNMagnitude", "FL32", 1090, "0", 2, false, rxBuff),
                  ang: FormatData("H25VoltageCNAngle", "FL32", 1092, "0", 2, false, rxBuff)
                }
              }
            },
            Harmonics_current: {
              A: {
                h1: {
                  rate: FormatData("H1CurrentAPercent", "FL32", 1094, "0", 2, false, rxBuff),
                  magn: FormatData("H1CurrentAMagnitude", "FL32", 1096, "0", 2, false, rxBuff),
                  ang: FormatData("H1CurrentAAngle", "FL32", 1098, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2CurrentAPercent", "FL32", 1100, "0", 2, false, rxBuff),
                  magn: FormatData("H2CurrentAMagnitude", "FL32", 1102, "0", 2, false, rxBuff),
                  ang: FormatData("H2CurrentAAngle", "FL32", 1104, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3CurrentAPercent", "FL32", 1106, "0", 2, false, rxBuff),
                  magn: FormatData("H3CurrentAMagnitude", "FL32", 1108, "0", 2, false, rxBuff),
                  ang: FormatData("H3CurrentAAngle", "FL32", 1110, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4CurrentAPercent", "FL32", 1112, "0", 2, false, rxBuff),
                  magn: FormatData("H4CurrentAMagnitude", "FL32", 1114, "0", 2, false, rxBuff),
                  ang: FormatData("H4CurrentAAngle", "FL32", 1116, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5CurrentAPercent", "FL32", 1118, "0", 2, false, rxBuff),
                  magn: FormatData("H5CurrentAMagnitude", "FL32", 1120, "0", 2, false, rxBuff),
                  ang: FormatData("H5CurrentAAngle", "FL32", 1122, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6CurrentAPercent", "FL32", 1124, "0", 2, false, rxBuff),
                  magn: FormatData("H6CurrentAMagnitude", "FL32", 1126, "0", 2, false, rxBuff),
                  ang: FormatData("H6CurrentAAngle", "FL32", 1128, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7CurrentAPercent", "FL32", 1130, "0", 2, false, rxBuff),
                  magn: FormatData("H7CurrentAMagnitude", "FL32", 1132, "0", 2, false, rxBuff),
                  ang: FormatData("H7CurrentAAngle", "FL32", 1134, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8CurrentAPercent", "FL32", 1136, "0", 2, false, rxBuff),
                  magn: FormatData("H8CurrentAMagnitude", "FL32", 1138, "0", 2, false, rxBuff),
                  ang: FormatData("H8CurrentAAngle", "FL32", 1140, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9CurrentAPercent", "FL32", 1142, "0", 2, false, rxBuff),
                  magn: FormatData("H9CurrentAMagnitude", "FL32", 1144, "0", 2, false, rxBuff),
                  ang: FormatData("H9CurrentAAngle", "FL32", 1146, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10CurrentAPercent", "FL32", 1148, "0", 2, false, rxBuff),
                  magn: FormatData("H10CurrentAMagnitude", "FL32", 1150, "0", 2, false, rxBuff),
                  ang: FormatData("H10CurrentAAngle", "FL32", 1152, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11CurrentAPercent", "FL32", 1154, "0", 2, false, rxBuff),
                  magn: FormatData("H11CurrentAMagnitude", "FL32", 1156, "0", 2, false, rxBuff),
                  ang: FormatData("H11CurrentAAngle", "FL32", 1158, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12CurrentAPercent", "FL32", 1160, "0", 2, false, rxBuff),
                  magn: FormatData("H12CurrentAMagnitude", "FL32", 1162, "0", 2, false, rxBuff),
                  ang: FormatData("H12CurrentAAngle", "FL32", 1164, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13CurrentAPercent", "FL32", 1166, "0", 2, false, rxBuff),
                  magn: FormatData("H13CurrentAMagnitude", "FL32", 1168, "0", 2, false, rxBuff),
                  ang: FormatData("H13CurrentAAngle", "FL32", 1170, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14CurrentAPercent", "FL32", 1172, "0", 2, false, rxBuff),
                  magn: FormatData("H14CurrentAMagnitude", "FL32", 1174, "0", 2, false, rxBuff),
                  ang: FormatData("H14CurrentAAngle", "FL32", 1176, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15CurrentAPercent", "FL32", 1178, "0", 2, false, rxBuff),
                  magn: FormatData("H15CurrentAMagnitude", "FL32", 1180, "0", 2, false, rxBuff),
                  ang: FormatData("H15CurrentAAngle", "FL32", 1182, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16CurrentAPercent", "FL32", 1184, "0", 2, false, rxBuff),
                  magn: FormatData("H16CurrentAMagnitude", "FL32", 1186, "0", 2, false, rxBuff),
                  ang: FormatData("H16CurrentAAngle", "FL32", 1188, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17CurrentAPercent", "FL32", 1190, "0", 2, false, rxBuff),
                  magn: FormatData("H17CurrentAMagnitude", "FL32", 1192, "0", 2, false, rxBuff),
                  ang: FormatData("H17CurrentAAngle", "FL32", 1194, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18CurrentAPercent", "FL32", 1196, "0", 2, false, rxBuff),
                  magn: FormatData("H18CurrentAMagnitude", "FL32", 1198, "0", 2, false, rxBuff),
                  ang: FormatData("H18CurrentAAngle", "FL32", 1200, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19CurrentAPercent", "FL32", 1202, "0", 2, false, rxBuff),
                  magn: FormatData("H19CurrentAMagnitude", "FL32", 1204, "0", 2, false, rxBuff),
                  ang: FormatData("H19CurrentAAngle", "FL32", 1206, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20CurrentAPercent", "FL32", 1208, "0", 2, false, rxBuff),
                  magn: FormatData("H20CurrentAMagnitude", "FL32", 1210, "0", 2, false, rxBuff),
                  ang: FormatData("H20CurrentAAngle", "FL32", 1212, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21CurrentAPercent", "FL32", 1214, "0", 2, false, rxBuff),
                  magn: FormatData("H21CurrentAMagnitude", "FL32", 1216, "0", 2, false, rxBuff),
                  ang: FormatData("H21CurrentAAngle", "FL32", 1218, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22CurrentAPercent", "FL32", 1220, "0", 2, false, rxBuff),
                  magn: FormatData("H22CurrentAMagnitude", "FL32", 1222, "0", 2, false, rxBuff),
                  ang: FormatData("H22CurrentAAngle", "FL32", 1224, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23CurrentAPercent", "FL32", 1226, "0", 2, false, rxBuff),
                  magn: FormatData("H23CurrentAMagnitude", "FL32", 1228, "0", 2, false, rxBuff),
                  ang: FormatData("H23CurrentAAngle", "FL32", 1230, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24CurrentAPercent", "FL32", 1232, "0", 2, false, rxBuff),
                  magn: FormatData("H24CurrentAMagnitude", "FL32", 1234, "0", 2, false, rxBuff),
                  ang: FormatData("H24CurrentAAngle", "FL32", 1236, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25CurrentAPercent", "FL32", 1238, "0", 2, false, rxBuff),
                  magn: FormatData("H25CurrentAMagnitude", "FL32", 1240, "0", 2, false, rxBuff),
                  ang: FormatData("H25CurrentAAngle", "FL32", 1242, "0", 2, false, rxBuff)
                }
              },
              B: {
                h1: {
                  rate: FormatData("H1CurrentBPercent", "FL32", 1244, "0", 2, false, rxBuff),
                  magn: FormatData("H1CurrentBMagnitude", "FL32", 1246, "0", 2, false, rxBuff),
                  ang: FormatData("H1CurrentBAngle", "FL32", 1248, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2CurrentBPercent", "FL32", 1250, "0", 2, false, rxBuff),
                  magn: FormatData("H2CurrentBMagnitude", "FL32", 1252, "0", 2, false, rxBuff),
                  ang: FormatData("H2CurrentBAngle", "FL32", 1254, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3CurrentBPercent", "FL32", 1256, "0", 2, false, rxBuff),
                  magn: FormatData("H3CurrentBMagnitude", "FL32", 1258, "0", 2, false, rxBuff),
                  ang: FormatData("H3CurrentBAngle", "FL32", 1260, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4CurrentBPercent", "FL32", 1262, "0", 2, false, rxBuff),
                  magn: FormatData("H4CurrentBMagnitude", "FL32", 1264, "0", 2, false, rxBuff),
                  ang: FormatData("H4CurrentBAngle", "FL32", 1266, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5CurrentBPercent", "FL32", 1268, "0", 2, false, rxBuff),
                  magn: FormatData("H5CurrentBMagnitude", "FL32", 1270, "0", 2, false, rxBuff),
                  ang: FormatData("H5CurrentBAngle", "FL32", 1272, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6CurrentBPercent", "FL32", 1274, "0", 2, false, rxBuff),
                  magn: FormatData("H6CurrentBMagnitude", "FL32", 1276, "0", 2, false, rxBuff),
                  ang: FormatData("H6CurrentBAngle", "FL32", 1278, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7CurrentBPercent", "FL32", 1280, "0", 2, false, rxBuff),
                  magn: FormatData("H7CurrentBMagnitude", "FL32", 1282, "0", 2, false, rxBuff),
                  ang: FormatData("H7CurrentBAngle", "FL32", 1284, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8CurrentBPercent", "FL32", 1286, "0", 2, false, rxBuff),
                  magn: FormatData("H8CurrentBMagnitude", "FL32", 1288, "0", 2, false, rxBuff),
                  ang: FormatData("H8CurrentBAngle", "FL32", 1290, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9CurrentBPercent", "FL32", 1292, "0", 2, false, rxBuff),
                  magn: FormatData("H9CurrentBMagnitude", "FL32", 1294, "0", 2, false, rxBuff),
                  ang: FormatData("H9CurrentBAngle", "FL32", 1296, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10CurrentBPercent", "FL32", 1298, "0", 2, false, rxBuff),
                  magn: FormatData("H10CurrentBMagnitude", "FL32", 1300, "0", 2, false, rxBuff),
                  ang: FormatData("H10CurrentBAngle", "FL32", 1302, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11CurrentBPercent", "FL32", 1304, "0", 2, false, rxBuff),
                  magn: FormatData("H11CurrentBMagnitude", "FL32", 1306, "0", 2, false, rxBuff),
                  ang: FormatData("H11CurrentBAngle", "FL32", 1308, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12CurrentBPercent", "FL32", 1310, "0", 2, false, rxBuff),
                  magn: FormatData("H12CurrentBMagnitude", "FL32", 1312, "0", 2, false, rxBuff),
                  ang: FormatData("H12CurrentBAngle", "FL32", 1314, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13CurrentBPercent", "FL32", 1316, "0", 2, false, rxBuff),
                  magn: FormatData("H13CurrentBMagnitude", "FL32", 1318, "0", 2, false, rxBuff),
                  ang: FormatData("H13CurrentBAngle", "FL32", 1320, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14CurrentBPercent", "FL32", 1322, "0", 2, false, rxBuff),
                  magn: FormatData("H14CurrentBMagnitude", "FL32", 1324, "0", 2, false, rxBuff),
                  ang: FormatData("H14CurrentBAngle", "FL32", 1326, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15CurrentBPercent", "FL32", 1328, "0", 2, false, rxBuff),
                  magn: FormatData("H15CurrentBMagnitude", "FL32", 1330, "0", 2, false, rxBuff),
                  ang: FormatData("H15CurrentBAngle", "FL32", 1332, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16CurrentBPercent", "FL32", 1334, "0", 2, false, rxBuff),
                  magn: FormatData("H16CurrentBMagnitude", "FL32", 1336, "0", 2, false, rxBuff),
                  ang: FormatData("H16CurrentBAngle", "FL32", 1338, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17CurrentBPercent", "FL32", 1340, "0", 2, false, rxBuff),
                  magn: FormatData("H17CurrentBMagnitude", "FL32", 1342, "0", 2, false, rxBuff),
                  ang: FormatData("H17CurrentBAngle", "FL32", 1344, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18CurrentBPercent", "FL32", 1346, "0", 2, false, rxBuff),
                  magn: FormatData("H18CurrentBMagnitude", "FL32", 1348, "0", 2, false, rxBuff),
                  ang: FormatData("H18CurrentBAngle", "FL32", 1350, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19CurrentBPercent", "FL32", 1352, "0", 2, false, rxBuff),
                  magn: FormatData("H19CurrentBMagnitude", "FL32", 1354, "0", 2, false, rxBuff),
                  ang: FormatData("H19CurrentBAngle", "FL32", 1356, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20CurrentBPercent", "FL32", 1358, "0", 2, false, rxBuff),
                  magn: FormatData("H20CurrentBMagnitude", "FL32", 1360, "0", 2, false, rxBuff),
                  ang: FormatData("H20CurrentBAngle", "FL32", 1362, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21CurrentBPercent", "FL32", 1364, "0", 2, false, rxBuff),
                  magn: FormatData("H21CurrentBMagnitude", "FL32", 1366, "0", 2, false, rxBuff),
                  ang: FormatData("H21CurrentBAngle", "FL32", 1368, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22CurrentBPercent", "FL32", 1370, "0", 2, false, rxBuff),
                  magn: FormatData("H22CurrentBMagnitude", "FL32", 1372, "0", 2, false, rxBuff),
                  ang: FormatData("H22CurrentBAngle", "FL32", 1374, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23CurrentBPercent", "FL32", 1376, "0", 2, false, rxBuff),
                  magn: FormatData("H23CurrentBMagnitude", "FL32", 1378, "0", 2, false, rxBuff),
                  ang: FormatData("H23CurrentBAngle", "FL32", 1380, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24CurrentBPercent", "FL32", 1382, "0", 2, false, rxBuff),
                  magn: FormatData("H24CurrentBMagnitude", "FL32", 1384, "0", 2, false, rxBuff),
                  ang: FormatData("H24CurrentBAngle", "FL32", 1386, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25CurrentBPercent", "FL32", 1388, "0", 2, false, rxBuff),
                  magn: FormatData("H25CurrentBMagnitude", "FL32", 1390, "0", 2, false, rxBuff),
                  ang: FormatData("H25CurrentBAngle", "FL32", 1392, "0", 2, false, rxBuff)
                }
              },
              C: {
                h1: {
                  rate: FormatData("H1CurrentCPercent", "FL32", 1394, "0", 2, false, rxBuff),
                  magn: FormatData("H1CurrentCMagnitude", "FL32", 1396, "0", 2, false, rxBuff),
                  ang: FormatData("H1CurrentCAngle", "FL32", 1398, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2CurrentCPercent", "FL32", 1400, "0", 2, false, rxBuff),
                  magn: FormatData("H2CurrentCMagnitude", "FL32", 1402, "0", 2, false, rxBuff),
                  ang: FormatData("H2CurrentCAngle", "FL32", 1404, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3CurrentCPercent", "FL32", 1406, "0", 2, false, rxBuff),
                  magn: FormatData("H3CurrentCMagnitude", "FL32", 1408, "0", 2, false, rxBuff),
                  ang: FormatData("H3CurrentCAngle", "FL32", 1410, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4CurrentCPercent", "FL32", 1412, "0", 2, false, rxBuff),
                  magn: FormatData("H4CurrentCMagnitude", "FL32", 1414, "0", 2, false, rxBuff),
                  ang: FormatData("H4CurrentCAngle", "FL32", 1416, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5CurrentCPercent", "FL32", 1418, "0", 2, false, rxBuff),
                  magn: FormatData("H5CurrentCMagnitude", "FL32", 1420, "0", 2, false, rxBuff),
                  ang: FormatData("H5CurrentCAngle", "FL32", 1422, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6CurrentCPercent", "FL32", 1424, "0", 2, false, rxBuff),
                  magn: FormatData("H6CurrentCMagnitude", "FL32", 1426, "0", 2, false, rxBuff),
                  ang: FormatData("H6CurrentCAngle", "FL32", 1428, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7CurrentCPercent", "FL32", 1430, "0", 2, false, rxBuff),
                  magn: FormatData("H7CurrentCMagnitude", "FL32", 1432, "0", 2, false, rxBuff),
                  ang: FormatData("H7CurrentCAngle", "FL32", 1434, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8CurrentCPercent", "FL32", 1436, "0", 2, false, rxBuff),
                  magn: FormatData("H8CurrentCMagnitude", "FL32", 1438, "0", 2, false, rxBuff),
                  ang: FormatData("H8CurrentCAngle", "FL32", 1440, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9CurrentCPercent", "FL32", 1442, "0", 2, false, rxBuff),
                  magn: FormatData("H9CurrentCMagnitude", "FL32", 1444, "0", 2, false, rxBuff),
                  ang: FormatData("H9CurrentCAngle", "FL32", 1446, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10CurrentCPercent", "FL32", 1448, "0", 2, false, rxBuff),
                  magn: FormatData("H10CurrentCMagnitude", "FL32", 1450, "0", 2, false, rxBuff),
                  ang: FormatData("H10CurrentCAngle", "FL32", 1452, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11CurrentCPercent", "FL32", 1454, "0", 2, false, rxBuff),
                  magn: FormatData("H11CurrentCMagnitude", "FL32", 1456, "0", 2, false, rxBuff),
                  ang: FormatData("H11CurrentCAngle", "FL32", 1458, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12CurrentCPercent", "FL32", 1460, "0", 2, false, rxBuff),
                  magn: FormatData("H12CurrentCMagnitude", "FL32", 1462, "0", 2, false, rxBuff),
                  ang: FormatData("H12CurrentCAngle", "FL32", 1464, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13CurrentCPercent", "FL32", 1466, "0", 2, false, rxBuff),
                  magn: FormatData("H13CurrentCMagnitude", "FL32", 1468, "0", 2, false, rxBuff),
                  ang: FormatData("H13CurrentCAngle", "FL32", 1470, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14CurrentCPercent", "FL32", 1472, "0", 2, false, rxBuff),
                  magn: FormatData("H14CurrentCMagnitude", "FL32", 1474, "0", 2, false, rxBuff),
                  ang: FormatData("H14CurrentCAngle", "FL32", 1476, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15CurrentCPercent", "FL32", 1478, "0", 2, false, rxBuff),
                  magn: FormatData("H15CurrentCMagnitude", "FL32", 1480, "0", 2, false, rxBuff),
                  ang: FormatData("H15CurrentCAngle", "FL32", 1482, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16CurrentCPercent", "FL32", 1484, "0", 2, false, rxBuff),
                  magn: FormatData("H16CurrentCMagnitude", "FL32", 1486, "0", 2, false, rxBuff),
                  ang: FormatData("H16CurrentCAngle", "FL32", 1488, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17CurrentCPercent", "FL32", 1490, "0", 2, false, rxBuff),
                  magn: FormatData("H17CurrentCMagnitude", "FL32", 1492, "0", 2, false, rxBuff),
                  ang: FormatData("H17CurrentCAngle", "FL32", 1494, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18CurrentCPercent", "FL32", 1496, "0", 2, false, rxBuff),
                  magn: FormatData("H18CurrentCMagnitude", "FL32", 1498, "0", 2, false, rxBuff),
                  ang: FormatData("H18CurrentCAngle", "FL32", 1500, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19CurrentCPercent", "FL32", 1502, "0", 2, false, rxBuff),
                  magn: FormatData("H19CurrentCMagnitude", "FL32", 1504, "0", 2, false, rxBuff),
                  ang: FormatData("H19CurrentCAngle", "FL32", 1506, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20CurrentCPercent", "FL32", 1508, "0", 2, false, rxBuff),
                  magn: FormatData("H20CurrentCMagnitude", "FL32", 1510, "0", 2, false, rxBuff),
                  ang: FormatData("H20CurrentCAngle", "FL32", 1512, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21CurrentCPercent", "FL32", 1514, "0", 2, false, rxBuff),
                  magn: FormatData("H21CurrentCMagnitude", "FL32", 1516, "0", 2, false, rxBuff),
                  ang: FormatData("H21CurrentCAngle", "FL32", 1518, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22CurrentCPercent", "FL32", 1520, "0", 2, false, rxBuff),
                  magn: FormatData("H22CurrentCMagnitude", "FL32", 1522, "0", 2, false, rxBuff),
                  ang: FormatData("H22CurrentCAngle", "FL32", 1524, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23CurrentCPercent", "FL32", 1526, "0", 2, false, rxBuff),
                  magn: FormatData("H23CurrentCMagnitude", "FL32", 1528, "0", 2, false, rxBuff),
                  ang: FormatData("H23CurrentCAngle", "FL32", 1530, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24CurrentCPercent", "FL32", 1532, "0", 2, false, rxBuff),
                  magn: FormatData("H24CurrentCMagnitude", "FL32", 1534, "0", 2, false, rxBuff),
                  ang: FormatData("H24CurrentCAngle", "FL32", 1536, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25CurrentCPercent", "FL32", 1538, "0", 2, false, rxBuff),
                  magn: FormatData("H25CurrentCMagnitude", "FL32", 1540, "0", 2, false, rxBuff),
                  ang: FormatData("H25CurrentCAngle", "FL32", 1542, "0", 2, false, rxBuff)
                }
              },
              N: {
                h1: {
                  rate: FormatData("H1CurrentNPercent", "FL32", 1544, "0", 2, false, rxBuff),
                  magn: FormatData("H1CurrentNMagnitude", "FL32", 1546, "0", 2, false, rxBuff),
                  ang: FormatData("H1CurrentNAngle", "FL32", 1548, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2CurrentNPercent", "FL32", 1550, "0", 2, false, rxBuff),
                  magn: FormatData("H2CurrentNMagnitude", "FL32", 1552, "0", 2, false, rxBuff),
                  ang: FormatData("H2CurrentNAngle", "FL32", 1554, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3CurrentNPercent", "FL32", 1556, "0", 2, false, rxBuff),
                  magn: FormatData("H3CurrentNMagnitude", "FL32", 1558, "0", 2, false, rxBuff),
                  ang: FormatData("H3CurrentNAngle", "FL32", 1560, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4CurrentNPercent", "FL32", 1562, "0", 2, false, rxBuff),
                  magn: FormatData("H4CurrentNMagnitude", "FL32", 1564, "0", 2, false, rxBuff),
                  ang: FormatData("H4CurrentNAngle", "FL32", 1566, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5CurrentNPercent", "FL32", 1568, "0", 2, false, rxBuff),
                  magn: FormatData("H5CurrentNMagnitude", "FL32", 1570, "0", 2, false, rxBuff),
                  ang: FormatData("H5CurrentNAngle", "FL32", 1572, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6CurrentNPercent", "FL32", 1574, "0", 2, false, rxBuff),
                  magn: FormatData("H6CurrentNMagnitude", "FL32", 1576, "0", 2, false, rxBuff),
                  ang: FormatData("H6CurrentNAngle", "FL32", 1578, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7CurrentNPercent", "FL32", 1580, "0", 2, false, rxBuff),
                  magn: FormatData("H7CurrentNMagnitude", "FL32", 1582, "0", 2, false, rxBuff),
                  ang: FormatData("H7CurrentNAngle", "FL32", 1584, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8CurrentNPercent", "FL32", 1586, "0", 2, false, rxBuff),
                  magn: FormatData("H8CurrentNMagnitude", "FL32", 1588, "0", 2, false, rxBuff),
                  ang: FormatData("H8CurrentNAngle", "FL32", 1590, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9CurrentNPercent", "FL32", 1592, "0", 2, false, rxBuff),
                  magn: FormatData("H9CurrentNMagnitude", "FL32", 1594, "0", 2, false, rxBuff),
                  ang: FormatData("H9CurrentNAngle", "FL32", 1596, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10CurrentNPercent", "FL32", 1598, "0", 2, false, rxBuff),
                  magn: FormatData("H10CurrentNMagnitude", "FL32", 1600, "0", 2, false, rxBuff),
                  ang: FormatData("H10CurrentNAngle", "FL32", 1602, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11CurrentNPercent", "FL32", 1604, "0", 2, false, rxBuff),
                  magn: FormatData("H11CurrentNMagnitude", "FL32", 1606, "0", 2, false, rxBuff),
                  ang: FormatData("H11CurrentNAngle", "FL32", 1608, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12CurrentNPercent", "FL32", 1610, "0", 2, false, rxBuff),
                  magn: FormatData("H12CurrentNMagnitude", "FL32", 1612, "0", 2, false, rxBuff),
                  ang: FormatData("H12CurrentNAngle", "FL32", 1614, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13CurrentNPercent", "FL32", 1616, "0", 2, false, rxBuff),
                  magn: FormatData("H13CurrentNMagnitude", "FL32", 1618, "0", 2, false, rxBuff),
                  ang: FormatData("H13CurrentNAngle", "FL32", 1620, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14CurrentNPercent", "FL32", 1622, "0", 2, false, rxBuff),
                  magn: FormatData("H14CurrentNMagnitude", "FL32", 1624, "0", 2, false, rxBuff),
                  ang: FormatData("H14CurrentNAngle", "FL32", 1626, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15CurrentNPercent", "FL32", 1628, "0", 2, false, rxBuff),
                  magn: FormatData("H15CurrentNMagnitude", "FL32", 1630, "0", 2, false, rxBuff),
                  ang: FormatData("H15CurrentNAngle", "FL32", 1632, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16CurrentNPercent", "FL32", 1634, "0", 2, false, rxBuff),
                  magn: FormatData("H16CurrentNMagnitude", "FL32", 1636, "0", 2, false, rxBuff),
                  ang: FormatData("H16CurrentNAngle", "FL32", 1638, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17CurrentNPercent", "FL32", 1640, "0", 2, false, rxBuff),
                  magn: FormatData("H17CurrentNMagnitude", "FL32", 1642, "0", 2, false, rxBuff),
                  ang: FormatData("H17CurrentNAngle", "FL32", 1644, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18CurrentNPercent", "FL32", 1646, "0", 2, false, rxBuff),
                  magn: FormatData("H18CurrentNMagnitude", "FL32", 1648, "0", 2, false, rxBuff),
                  ang: FormatData("H18CurrentNAngle", "FL32", 1650, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19CurrentNPercent", "FL32", 1652, "0", 2, false, rxBuff),
                  magn: FormatData("H19CurrentNMagnitude", "FL32", 1654, "0", 2, false, rxBuff),
                  ang: FormatData("H19CurrentNAngle", "FL32", 1656, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20CurrentNPercent", "FL32", 1658, "0", 2, false, rxBuff),
                  magn: FormatData("H20CurrentNMagnitude", "FL32", 1660, "0", 2, false, rxBuff),
                  ang: FormatData("H20CurrentNAngle", "FL32", 1662, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21CurrentNPercent", "FL32", 1664, "0", 2, false, rxBuff),
                  magn: FormatData("H21CurrentNMagnitude", "FL32", 1666, "0", 2, false, rxBuff),
                  ang: FormatData("H21CurrentNAngle", "FL32", 1668, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22CurrentNPercent", "FL32", 1670, "0", 2, false, rxBuff),
                  magn: FormatData("H22CurrentNMagnitude", "FL32", 1672, "0", 2, false, rxBuff),
                  ang: FormatData("H22CurrentNAngle", "FL32", 1674, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23CurrentNPercent", "FL32", 1676, "0", 2, false, rxBuff),
                  magn: FormatData("H23CurrentNMagnitude", "FL32", 1678, "0", 2, false, rxBuff),
                  ang: FormatData("H23CurrentNAngle", "FL32", 1680, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24CurrentNPercent", "FL32", 1682, "0", 2, false, rxBuff),
                  magn: FormatData("H24CurrentNMagnitude", "FL32", 1684, "0", 2, false, rxBuff),
                  ang: FormatData("H24CurrentNAngle", "FL32", 1686, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25CurrentNPercent", "FL32", 1688, "0", 2, false, rxBuff),
                  magn: FormatData("H25CurrentNMagnitude", "FL32", 1690, "0", 2, false, rxBuff),
                  ang: FormatData("H25CurrentNAngle", "FL32", 1692, "0", 2, false, rxBuff)
                }
              },
              G: {
                h1: {
                  rate: FormatData("H1CurrentGPercent", "FL32", 1694, "0", 2, false, rxBuff),
                  magn: FormatData("H1CurrentGMagnitude", "FL32", 1696, "0", 2, false, rxBuff),
                  ang: FormatData("H1CurrentGAngle", "FL32", 1698, "0", 2, false, rxBuff)
                },
                h2: {
                  rate: FormatData("H2CurrentGPercent", "FL32", 1700, "0", 2, false, rxBuff),
                  magn: FormatData("H2CurrentGMagnitude", "FL32", 1702, "0", 2, false, rxBuff),
                  ang: FormatData("H2CurrentGAngle", "FL32", 1704, "0", 2, false, rxBuff)
                },
                h3: {
                  rate: FormatData("H3CurrentGPercent", "FL32", 1706, "0", 2, false, rxBuff),
                  magn: FormatData("H3CurrentGMagnitude", "FL32", 1708, "0", 2, false, rxBuff),
                  ang: FormatData("H3CurrentGAngle", "FL32", 1710, "0", 2, false, rxBuff)
                },
                h4: {
                  rate: FormatData("H4CurrentGPercent", "FL32", 1712, "0", 2, false, rxBuff),
                  magn: FormatData("H4CurrentGMagnitude", "FL32", 1714, "0", 2, false, rxBuff),
                  ang: FormatData("H4CurrentGAngle", "FL32", 1716, "0", 2, false, rxBuff)
                },
                h5: {
                  rate: FormatData("H5CurrentGPercent", "FL32", 1718, "0", 2, false, rxBuff),
                  magn: FormatData("H5CurrentGMagnitude", "FL32", 1720, "0", 2, false, rxBuff),
                  ang: FormatData("H5CurrentGAngle", "FL32", 1722, "0", 2, false, rxBuff)
                },
                h6: {
                  rate: FormatData("H6CurrentGPercent", "FL32", 1724, "0", 2, false, rxBuff),
                  magn: FormatData("H6CurrentGMagnitude", "FL32", 1726, "0", 2, false, rxBuff),
                  ang: FormatData("H6CurrentGAngle", "FL32", 1728, "0", 2, false, rxBuff)
                },
                h7: {
                  rate: FormatData("H7CurrentGPercent", "FL32", 1730, "0", 2, false, rxBuff),
                  magn: FormatData("H7CurrentGMagnitude", "FL32", 1732, "0", 2, false, rxBuff),
                  ang: FormatData("H7CurrentGAngle", "FL32", 1734, "0", 2, false, rxBuff)
                },
                h8: {
                  rate: FormatData("H8CurrentGPercent", "FL32", 1736, "0", 2, false, rxBuff),
                  magn: FormatData("H8CurrentGMagnitude", "FL32", 1738, "0", 2, false, rxBuff),
                  ang: FormatData("H8CurrentGAngle", "FL32", 1740, "0", 2, false, rxBuff)
                },
                h9: {
                  rate: FormatData("H9CurrentGPercent", "FL32", 1742, "0", 2, false, rxBuff),
                  magn: FormatData("H9CurrentGMagnitude", "FL32", 1744, "0", 2, false, rxBuff),
                  ang: FormatData("H9CurrentGAngle", "FL32", 1746, "0", 2, false, rxBuff)
                },
                h10: {
                  rate: FormatData("H10CurrentGPercent", "FL32", 1748, "0", 2, false, rxBuff),
                  magn: FormatData("H10CurrentGMagnitude", "FL32", 1750, "0", 2, false, rxBuff),
                  ang: FormatData("H10CurrentGAngle", "FL32", 1752, "0", 2, false, rxBuff)
                },
                h11: {
                  rate: FormatData("H11CurrentGPercent", "FL32", 1754, "0", 2, false, rxBuff),
                  magn: FormatData("H11CurrentGMagnitude", "FL32", 1756, "0", 2, false, rxBuff),
                  ang: FormatData("H11CurrentGAngle", "FL32", 1758, "0", 2, false, rxBuff)
                },
                h12: {
                  rate: FormatData("H12CurrentGPercent", "FL32", 1760, "0", 2, false, rxBuff),
                  magn: FormatData("H12CurrentGMagnitude", "FL32", 1762, "0", 2, false, rxBuff),
                  ang: FormatData("H12CurrentGAngle", "FL32", 1764, "0", 2, false, rxBuff)
                },
                h13: {
                  rate: FormatData("H13CurrentGPercent", "FL32", 1766, "0", 2, false, rxBuff),
                  magn: FormatData("H13CurrentGMagnitude", "FL32", 1768, "0", 2, false, rxBuff),
                  ang: FormatData("H13CurrentGAngle", "FL32", 1770, "0", 2, false, rxBuff)
                },
                h14: {
                  rate: FormatData("H14CurrentGPercent", "FL32", 1772, "0", 2, false, rxBuff),
                  magn: FormatData("H14CurrentGMagnitude", "FL32", 1774, "0", 2, false, rxBuff),
                  ang: FormatData("H14CurrentGAngle", "FL32", 1776, "0", 2, false, rxBuff)
                },
                h15: {
                  rate: FormatData("H15CurrentGPercent", "FL32", 1778, "0", 2, false, rxBuff),
                  magn: FormatData("H15CurrentGMagnitude", "FL32", 1780, "0", 2, false, rxBuff),
                  ang: FormatData("H15CurrentGAngle", "FL32", 1782, "0", 2, false, rxBuff)
                },
                h16: {
                  rate: FormatData("H16CurrentGPercent", "FL32", 1784, "0", 2, false, rxBuff),
                  magn: FormatData("H16CurrentGMagnitude", "FL32", 1786, "0", 2, false, rxBuff),
                  ang: FormatData("H16CurrentGAngle", "FL32", 1788, "0", 2, false, rxBuff)
                },
                h17: {
                  rate: FormatData("H17CurrentGPercent", "FL32", 1790, "0", 2, false, rxBuff),
                  magn: FormatData("H17CurrentGMagnitude", "FL32", 1792, "0", 2, false, rxBuff),
                  ang: FormatData("H17CurrentGAngle", "FL32", 1794, "0", 2, false, rxBuff)
                },
                h18: {
                  rate: FormatData("H18CurrentGPercent", "FL32", 1796, "0", 2, false, rxBuff),
                  magn: FormatData("H18CurrentGMagnitude", "FL32", 1798, "0", 2, false, rxBuff),
                  ang: FormatData("H18CurrentGAngle", "FL32", 1800, "0", 2, false, rxBuff)
                },
                h19: {
                  rate: FormatData("H19CurrentGPercent", "FL32", 1802, "0", 2, false, rxBuff),
                  magn: FormatData("H19CurrentGMagnitude", "FL32", 1804, "0", 2, false, rxBuff),
                  ang: FormatData("H19CurrentGAngle", "FL32", 1806, "0", 2, false, rxBuff)
                },
                h20: {
                  rate: FormatData("H20CurrentGPercent", "FL32", 1808, "0", 2, false, rxBuff),
                  magn: FormatData("H20CurrentGMagnitude", "FL32", 1810, "0", 2, false, rxBuff),
                  ang: FormatData("H20CurrentGAngle", "FL32", 1812, "0", 2, false, rxBuff)
                },
                h21: {
                  rate: FormatData("H21CurrentGPercent", "FL32", 1814, "0", 2, false, rxBuff),
                  magn: FormatData("H21CurrentGMagnitude", "FL32", 1816, "0", 2, false, rxBuff),
                  ang: FormatData("H21CurrentGAngle", "FL32", 1818, "0", 2, false, rxBuff)
                },
                h22: {
                  rate: FormatData("H22CurrentGPercent", "FL32", 1820, "0", 2, false, rxBuff),
                  magn: FormatData("H22CurrentGMagnitude", "FL32", 1822, "0", 2, false, rxBuff),
                  ang: FormatData("H22CurrentGAngle", "FL32", 1824, "0", 2, false, rxBuff)
                },
                h23: {
                  rate: FormatData("H23CurrentGPercent", "FL32", 1826, "0", 2, false, rxBuff),
                  magn: FormatData("H23CurrentGMagnitude", "FL32", 1828, "0", 2, false, rxBuff),
                  ang: FormatData("H23CurrentGAngle", "FL32", 1830, "0", 2, false, rxBuff)
                },
                h24: {
                  rate: FormatData("H24CurrentGPercent", "FL32", 1832, "0", 2, false, rxBuff),
                  magn: FormatData("H24CurrentGMagnitude", "FL32", 1834, "0", 2, false, rxBuff),
                  ang: FormatData("H24CurrentGAngle", "FL32", 1836, "0", 2, false, rxBuff)
                },
                h25: {
                  rate: FormatData("H25CurrentGPercent", "FL32", 1838, "0", 2, false, rxBuff),
                  magn: FormatData("H25CurrentGMagnitude", "FL32", 1840, "0", 2, false, rxBuff),
                  ang: FormatData("H25CurrentGAngle", "FL32", 1842, "0", 2, false, rxBuff)
                }
              }
            }
          }
        };
        //console.log(oneSecondReading.time);
        traverse(oneSecondReading).forEach(function (x) {
          if (x === "***") this.delete(stopHere=false);
        });
        traverse(oneSecondReading).forEach(function (x) {
          if (x == "" || (x < 0.1 && x > 0) ) this.delete(stopHere=false);
        });
        collection.insertOne(oneSecondReading);
        //console.log("oneSecondReading saved to DB");
        //console.log(oneSecondReading.time_iso);

  		}
    }
  ).auth(process.env.USERNAME_WEB, process.env.PASSWORD_WEB, false);
}

var systemStatus = function(url, collection) {
  { // var systemStatus_tag                                             // [start index] name of group of variables [cumulative array.length]
    var systemStatus_tag = "PL_" + "_*^H1837[7]" + "__PL" + "," +       // [0] timekeeping [7]
    										   "PL_" + "_*^H130[6]" + "__PL" + "," +        // [7] manufacturing data [13]
    										   "PL_" + "_*^H1637[12]" + "__PL" + "," +      // [13] firmware version operating system [25]
                           "PL_" + "_*^H1669[2]" + "__PL" + "," +       // [25] reset and language firmware [27]
                           "PL_" + "_*^H1824[13]" + "__PL" + "," +      // [27] meter resets [40]
                           "PL_" + "_*^H1920[6]" + "__PL" + "," +       // [40] revenue security [46]
                           "PL_" + "_*^H2000[4]" + "__PL" + "," +       // [46] misc control status [48]
                           "PL_" + "_*^H2014[32]" + "__PL" + "," +      // [48] power system, instrument transformers and operating modes [80]
                           "PL_" + "_*^H2048[4]" + "__PL" + "," +       // [80] operating nodes [84]
                           "PL_" + "_*^H6001[10]" + "__PL" + "," +      // [84] hmi basic setup [94]
    										   "PL_" + "_*^H6099[1]" + "__PL" + "," +       // [94] hmi qr code [95]
                           "PL_" + "_*^H6500[6]" + "__PL" + "," +       // [95] rs485 until mode selection [101]
                           "PL_" + "_*^H6508[7]" + "__PL" + "," +       // [101] rs485 until timeout [108]
                           "PL_" + "_*^H6546[6]" + "__PL" + "," +       // [108] rs485 until num of write packets [114]
                           "PL_" + "_*^H19000[31]" + "__PL" + "," +     // [114] datalogging [145]
                           "PL_" + "_*^H20000[1]" + "__PL" + "," +      // [145] processor loading [146]
                           "PL_" + "_*^H20003[5]" + "__PL" + "," +      // [146] meter self test [151]
                           "PL_" + "_*^H20270[44]" + "__PL" + "," +     // [151] energy preset values [195]
                           "PL_" + "_*^H32285[8]" + "__PL" + "," +      // [195] FPGA firmware [203]
                           "PL_" + "_*^H32295[4]" + "__PL" + "," +      // [203] Date Last firmware download [207]
                           "PL_" + "_*^H64483[10]" + "__PL"; // + "," +     // [207] BACNet Data [217]
  }
  var rxBuff = [];
  request.post({
    url: url + "/UE/Post__PL__Data",
    form: systemStatus_tag },
    function(error, response, body) {
      if (error) {
        throw error;
        //systemStatus(url, collection);
      }
      console.log(response.statusCode);
      if (response.statusCode == 200) {
        rxBuff = body.split(",");
        console.log("rxBuff time indexes for debuggin Issue #1");
        for (var index = 0; index < 8; index++) {
          console.log(rxBuff[index]);
        }
        var systemStatus = {
          time_iso: new Date(
            Number(rxBuff[0]),
            Number(rxBuff[1] - 1), // month is zero index based
            Number(rxBuff[2]),
            Number(rxBuff[3] - 2), // daylight save time - refactor later
            Number(rxBuff[4]),
            Number(rxBuff[5]),
            Number(rxBuff[6])
          ).toISOString(),
          manufacturing_data: {
            meter: {
              serial_number: FormatData("SerialNumber", "FL32", 7, "0", 0, false, rxBuff),
              date_of_manufacture: FormatData("DateOfManufacture", "DT4Reg", 9, "0", 0, false, rxBuff)
            },
            firmware_versions: {
              operating_system: {
                present_firmware_version: {
                  firmware_version: rxBuff[13],
                  x_major: rxBuff[14],
                  y_minor: rxBuff[15],
                  z_quality: rxBuff[16]
                },
                previous_firmware_version: {
                  firmware_version: rxBuff[17],
                  x_major: rxBuff[18],
                  y_minor: rxBuff[19],
                  z_quality: rxBuff[20]
                },
                date_last_firmware_download: FormatData("DateLastFirmDownloaded", "DT4Reg", 21, "0", 0, false, rxBuff)
              },
              reset: {
                present_firmware_version: rxBuff[25]
              },
              language: {
                present_firmware_version: rxBuff[26]
              }
            },
            meter_resets: {
              last_unit_restart_datetime: FormatData("LastUnitRestartDT", "DT4Reg", 27, "0", 0, false, rxBuff),
              number_sys_restarts: rxBuff[31],
              number_ctrl_power_restarts: rxBuff[32],
              datetime_last_ctrl_power_failure: FormatData("LastUnitRestartDT", "DT4Reg", 33, "0", 0, false, rxBuff),
              duration_last_ctrl_power_failure: FormatData("DurationLastCtrlPowerFailure", "FL32", 37, "0", 0, false, rxBuff),
              cause_last_meter_reset: rxBuff[39]
            },
            revenue_security: {
              revenue_sec_switch_status: rxBuff[40],
              revenue_sec_status: rxBuff[41],
              datetime_last_revenue_sec_state_chg: FormatData("LastRevenueSecStateChgDT", "DT4Reg", 42, "0", 0, false, rxBuff)
            }
          },
          misc_ctrl_status: {
            active_load_timer: rxBuff[46],
            meter_operation_timer: rxBuff[47]
          },
          metering_setup: {
            power_system: {
              number_phases: rxBuff[48],
              number_wires: rxBuff[49],
              power_sys_config: rxBuff[50],
              nominal_frequency: rxBuff[51],
              nominal_voltage: FormatData("NominalVoltage", "FL32", 52, "0", 2, false, rxBuff),
              nominal_current: FormatData("NominalCurrent", "FL32", 54, "0", 2, false, rxBuff),
              nominal_power_factor: FormatData("NominalPF", "FL32", 56, "0", 2, false, rxBuff),
              normal_phase_rotation: rxBuff[58]
            },
            instrument_transformers_1: {
              number_vts: rxBuff[59],
              vt_primary: FormatData("HardwareRevision", "FL32", 60, "0", 2, false, rxBuff),
              vt_secondary: rxBuff[62],
              number_cts: rxBuff[63],
              ct_primary: rxBuff[64],
              ct_secondary: rxBuff[65],
              ct_primary_n: rxBuff[66],
              ct_secondary_n: rxBuff[67],
              ct_location: rxBuff[68],
              vt_location: rxBuff[69],
              vt_connection_type: rxBuff[70],
              remapping_indication: rxBuff[71],
              logical_phase_A_voltage: rxBuff[72],
              logical_phase_B_voltage: rxBuff[73],
              logical_phase_C_voltage: rxBuff[74],
              logical_phase_N_voltage: rxBuff[75],
              logical_phase_A_current: rxBuff[76],
              logical_phase_B_current: rxBuff[77],
              logical_phase_C_current: rxBuff[78],
              logical_phase_N_current: rxBuff[79]
            },
            operating_modes: {
              peak_current_dmd_last_year: FormatData("HardwareRevision", "FL32", 80, "0", 2, false, rxBuff),
              active_load_timer_setpoint: FormatData("HardwareRevision", "FL32", 82, "0", 2, false, rxBuff)
            }
          },
          hmi: {
            constrast_setting: rxBuff[84],
            language: rxBuff[85],
            date_format: rxBuff[86],
            iec_ieee_mode: rxBuff[87],
            screen_timeout: rxBuff[88],
            backlight_timeout: rxBuff[89],
            energy_resolution: rxBuff[90],
            current_resolution: rxBuff[91],
            voltage_resolution: rxBuff[92],
            power_resolution: rxBuff[93],
            qr_code_screen_enable: rxBuff[94]
          },
          communications_rs485: {
            m_s_protocol: rxBuff[95],
            m_s_address: rxBuff[96],
            m_s_baudrate: rxBuff[97],
            m_s_parity: rxBuff[98],
            m_s_modbus_ascii_default_timeout: rxBuff[99],
            ms_mode_selection: rxBuff[100],
            ms_packets_to_this_unit: rxBuff[101],
            ms_packets_to_other_units: rxBuff[102],
            ms_packets_with_bad_crc: rxBuff[103],
            ms_pacets_with_error: rxBuff[104],
            ms_pacets_with_illegal_opcode: rxBuff[105],
            ms_number_of_exceptions: rxBuff[106],
            m_timeout: rxBuff[107],
            m_silent_interval_extension: rxBuff[108],
            m_response_timeout: rxBuff[109],
            m_delay_between_frames: rxBuff[110],
            m_broadcast_enable: rxBuff[111],
            ms_number_of_read_packets: rxBuff[112],
            ms_number_of_write_packets: rxBuff[113]
          },
          datalogs: {
            logging_status: rxBuff[114],
            allocated_file_size: rxBuff[115],
            allocated_record_size: rxBuff[116],
            record_management_method: rxBuff[117],
            file_status: rxBuff[118],
            number_of_records_in_file: rxBuff[119],
            first_record_sequence_number: rxBuff[120],
            last_record_sequence_number: rxBuff[121],
            topic_mode: rxBuff[122],
            start_time: rxBuff[123],
            stop_time: rxBuff[124],
            interval_control_minutes: rxBuff[125],
            interval_control_seconds: rxBuff[126],
            date_time_last_clear: rxBuff[127],
            record_item_1: rxBuff[131],
            record_item_2: rxBuff[132],
            record_item_3: rxBuff[133],
            record_item_4: rxBuff[134],
            record_item_5: rxBuff[135],
            record_item_6: rxBuff[136],
            record_item_7: rxBuff[137],
            record_item_8: rxBuff[138],
            record_item_9: rxBuff[139],
            record_item_10: rxBuff[140],
            record_item_11: rxBuff[141],
            record_item_12: rxBuff[142],
            record_item_13: rxBuff[143],
            record_item_14: rxBuff[144]
          },
          diagnostics: {
            self_test_results_processor_loading: rxBuff[145],
            miscellaneous_meter_self_test: rxBuff[146], // BITMAP (filter it!)
            energy_preset_values: {
              accumulated_energy_32_bit: {
                active_energy_delivered_into_load: FormatData("ActiveEnergyDelivToLoad", "FL32", 151, "0", 0, false, rxBuff),
                active_energy_received_out_of_load: FormatData("ActiveEnergyReceivedOfLoad", "FL32", 153, "0", 0, false, rxBuff),
                reactive_energy_delivered: FormatData("ReactiveEnergyDelivered", "FL32", 155, "0", 0, false, rxBuff),
                reactive_energy_received: FormatData("ReactiveEnergyReceived", "FL32", 157, "0", 0, false, rxBuff),
                apparent_energy_delivered: FormatData("ApparentEnergyDelivered", "FL32", 159, "0", 0, false, rxBuff),
                apparent_energy_received: FormatData("ApparentEnergyReceived", "FL32", 161, "0", 0, false, rxBuff)
              },
              accumulated_energy: {
                accumulated_energy_preset_datetime: FormatData("AccumEnergyPresetDT", "S64", 163, "0", 0, false, rxBuff),
                active_energy_delivered_into_load: FormatData("ActiveEnergyDelivToLoad", "S64", 167, "0", 0, false, rxBuff),
                active_energy_received_out_of_load: FormatData("ActiveEnergyReceivedOfLoad", "S64", 171, "0", 0, false, rxBuff),
                reactive_energy_delivered: FormatData("ReactiveEnergyDelivered", "S64", 175, "0", 0, false, rxBuff),
                reactive_energy_received: FormatData("ReactiveEnergyReceived", "S64", 179, "0", 0, false, rxBuff),
                apparent_energy_delivered: FormatData("ApparentEnergyDelivered", "S64", 183, "0", 0, false, rxBuff),
                apparent_energy_received: FormatData("ApparentEnergyReceived", "S64", 187, "0", 0, false, rxBuff),
                size_of_maint_log: rxBuff[191],
                number_of_entries_in_maint_log: rxBuff[192],
                entry_number_of_most_recent_event: FormatData("EntryNumberMostRecentEvent", "FL32", 193, "0", 0, false, rxBuff)
              }
            }
          },
          firmware_versions_advanced_multi_cpu_and_programmable_logic: {
            fpga_1: {
              present_firmware_version: {
                firmware_version: rxBuff[195],
                x_major: rxBuff[196],
                y_minor: rxBuff[197],
                z_quality: rxBuff[198]
              },
              previous_firmware_version: {
                firmware_version: rxBuff[199],
                x_major: rxBuff[200],
                y_minor: rxBuff[201],
                z_quality: rxBuff[202],
              },
              datetime_of_last_firmware_download: FormatData("DTLastFirmwareDownlad", "DT4Reg", 203, "0", 2, false, rxBuff),
              bacnet_device_ID: FormatData("BACNetDeviceID", "FL32", 207, "0", 2, false, rxBuff),
              bacnet_UDP_port: rxBuff[209],
              bacnet_BBMD_status: rxBuff[210],
              bacnet_BBMD_ip_address: rxBuff[211],
              bacnet_BBMD_port: rxBuff[213],
              bacnet_BBMD_time_to_live: rxBuff[214],
              bacnet_APDU_timeout: rxBuff[215],
              bacnet_APDU_number_of_retries: rxBuff[216]
            }
          }
        };
        //console.log(systemStatus.time);
        traverse(systemStatus).forEach(function (x) {
          if (x === "***") this.remove(stopHere=false);
        });
        traverse(systemStatus).forEach(function (x) {
          if (x == "") this.remove(stopHere=false);
        });
        //console.log(JSON.stringify(systemStatus));
        collection.insertOne(systemStatus);
        //console.log("systemStatus saved to DB");
        //console.log(systemStatus.time_iso);

  		}
    }
  ).auth(process.env.USERNAME_WEB, process.env.PASSWORD_WEB, false);
}

MongoClient.connect(dbURL, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  var collection = db.collection('santaMonica');

  setInterval(
    function () {
      oneSecondMetering(meterURL, collection);
    },
    1000
  );

  setInterval(
    function () {
      systemStatus(meterURL, collection);
    },
    600000
  );

});

console.log("passed");


/*
var testFunc = function(arr) {
  var i, str = '';
  console.log(arr);
  for (i = 0; i < arr.length; i++) {
    //str +=
    str += Number(arr[i]).toString(16).slice(0,2) + Number(arr[i]).toString(16).slice(2,4);//splice(2); // UTF-16
  }
  //str = decodeURIComponent(str);
  console.log(str);
}

testFunc(arrayTest);
testFunc(arrayTest2);
testFunc(arrayTest3);
console.log("DECODING");
console.log(encodeURIComponent('%00AF'));
*/

