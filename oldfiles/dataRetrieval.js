// timekeeping tag

var timekeeping_tag = "PL_" + "_*^H1837[7]" + "__PL";


var io_pl_tag = "PL_" + "_*^H2400[2]" + "__PL" + "," +
                 "PL_" + "_*^H2402[2]" + "__PL";



"PL_" + "_*^H3000[86]" + "__PL";

// Energia e demanda retirados do app.js para poder sobrar espaço para harmônicas
// Os mesmos tem que ser calculados no mongodb posteriormente
energy: {
  accumulated_energy_reset_datetime: FormatData("AccEnergRstDT", "DT4Reg", 112, "0", 0, false, rxBuff),
  active_energy_delivered_into_load: FormatData("ActvEnergDelivToLoad", "S64", 116, "-3", 1, 0, rxBuff), //multiplier = 0
  active_energy_delivered_out_load: FormatData("ActvEnergDelivOutLoad", "S64", 120, "-3", 1, 0, rxBuff),
  active_energy_delivered_plus_received: FormatData("ActvEnergDelivPlusRecv", "S64", 124, "-3", 1, 0, rxBuff),
  active_energy_delibered_minus_received: FormatData("ActvEnergDelivMinusRecv", "S64", 128, "-3", 1, 0, rxBuff),
  reactive_energy_delivered: FormatData("ReacEnergDeliv", "S64", 132, "0", 2, false, rxBuff),
  reactive_energy_received: FormatData("ReacEnergRecv", "S64", 136, "0", 2, false, rxBuff),
  reactive_energy_delivered_plus_received: FormatData("ReacEnergDelivPlusRecv", "S64", 140, "0", 2, false, rxBuff),
  reactive_energy_delivered_minus_received: FormatData("ReacEnergDelivMinusRecv", "S64", 144, "0", 2, false, rxBuff),
  apparent_energy_delivered: FormatData("ApparEnergDeliv", "S64", 148, "0", 2, false, rxBuff),
  apparent_energy_received: FormatData("ApparEnergRecv", "S64", 152, "0", 2, false, rxBuff),
  apparent_energy_delivered_plus_received: FormatData("ApparEnergDelivPlusRecv", "S64", 156, "0", 2, false, rxBuff),
  apparent_energy_delivered_minus_received: FormatData("ApparEnergDelivMinusRecv", "S64", 160, "0", 2, false, rxBuff)
},
demand: {
  demand_sys_1_power: {
    power_demand_method: Number(rxBuff[164]),
    power_demand_interval_duration: Number(rxBuff[165]),
    power_demand_subinterval_duration: Number(rxBuff[166]),
    power_demand_elapsed_time_in_interval_sec: Number(rxBuff[167]),
    power_demand_elapsed_time_in_subinterval_sec: Number(rxBuff[168]),
    power_demand_peak_reset_datetime: FormatData("PowerDemandPeakRstDT", "DT4Reg", 169, "0", 0, false, rxBuff)
  },
  demand_sys_2_current: {
    //FormatData("CurrDemandMethod", "FL32", 173, "0", 2, false, rxBuff),
    current_demand_method: Number(rxBuff[173]),
    current_demand_interval_duration: Number(rxBuff[174]),
    current_demand_subinterval_duration: Number(rxBuff[175]),
    current_demand_elapsed_time_in_interval_sec: Number(rxBuff[176]),
    current_demand_elapsed_time_in_subinterval_sec: Number(rxBuff[177]),
    current_demand_peak_reset_datetime: FormatData("CurrDemandPeakRstDT", "DT4Reg", 178, "0", 0, false, rxBuff)
  },
  demand_channel_1_active_power: {
    demand_system_assignment: Number(rxBuff[182]),
    register_number_metered_quantity: Number(rxBuff[183]),
    units_code: Number(rxBuff[184]),
    last_demand: FormatData("ActvPowerLastDemand", "FL32", 185, "0", 2, false, rxBuff),
    present_demand: FormatData("ActvPowerPresDemand", "FL32", 187, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ActvPowerPredicDemand", "FL32", 189, "0", 2, false, rxBuff),
    peak_demand: FormatData("ActvPowerPeakDemand", "FL32", 191, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ActvPowerPeakDemandDT", "DT4Reg", 193, "0", 0, false, rxBuff)
  },
  demand_channel_2_reactive_power: {
    demand_system_assignment: Number(rxBuff[197]),
    register_number_metered_quantity: Number(rxBuff[198]),
    units_code: Number(rxBuff[199]),
    last_demand: FormatData("ReactvPowerLastDemand", "FL32", 200, "0", 2, false, rxBuff),
    present_demand: FormatData("ReactvPowerPresDemand", "FL32", 202, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ReactvPowerPredicDemand", "FL32", 204, "0", 2, false, rxBuff),
    peak_demand: FormatData("ReactvPowerPeakDemand", "FL32", 206, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ReactvPowerPeakDemandDT", "DT4Reg", 208, "0", 0, false, rxBuff)
  },
  demand_channel_3_apparent_power: {
    demand_system_assignment: Number(rxBuff[212]),
    register_number_metered_quantity: Number(rxBuff[213]),
    units_code: Number(rxBuff[214]),
    last_demand: FormatData("ApparPowerLastDemand", "FL32", 215, "0", 2, false, rxBuff),
    present_demand: FormatData("ApparPowerPresDemand", "FL32", 217, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ApparPowerPredicDemand", "FL32", 219, "0", 2, false, rxBuff),
    peak_demand: FormatData("ApparPowerPeakDemand", "FL32", 221, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ApparPowerPeakDemandDT", "DT4Reg", 223, "0", 0, false, rxBuff)
  },
  demand_channel_4_current_A: {
    demand_system_assignment: Number(rxBuff[227]),
    register_number_metered_quantity: Number(rxBuff[228]),
    units_code: Number(rxBuff[229]),
    last_demand: FormatData("CurrAPowerLastDemand", "FL32", 230, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrAPowerPresDemand", "FL32", 232, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrAPowerPredicDemand", "FL32", 234, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrAPowerPeakDemand", "FL32", 236, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrAPowerPeakDemandDT", "DT4Reg", 238, "0", 0, false, rxBuff)
  },
  demand_channel_5_current_B: {
    demand_system_assignment: Number(rxBuff[242]),
    register_number_metered_quantity: Number(rxBuff[243]),
    units_code: Number(rxBuff[244]),
    last_demand: FormatData("CurrBPowerLastDemand", "FL32", 245, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrBPowerPresDemand", "FL32", 247, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrBPowerPredicDemand", "FL32", 249, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrBPowerPeakDemand", "FL32", 251, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrBPowerPeakDemandDT", "DT4Reg", 253, "0", 0, false, rxBuff)
  },
  demand_channel_6_current_C: {
    demand_system_assignment: Number(rxBuff[257]),
    register_number_metered_quantity: Number(rxBuff[258]),
    units_code: Number(rxBuff[259]),
    last_demand: FormatData("CurrCPowerLastDemand", "FL32", 260, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrCPowerPresDemand", "FL32", 262, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrCPowerPredicDemand", "FL32", 264, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrCPowerPeakDemand", "FL32", 266, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrCPowerPeakDemandDT", "DT4Reg", 268, "0", 0, false, rxBuff)
  },
  demand_channel_7_current_N: {
    demand_system_assignment: Number(rxBuff[272]),
    register_number_metered_quantity: Number(rxBuff[273]),
    units_code: Number(rxBuff[274]),
    last_demand: FormatData("CurrNPowerLastDemand", "FL32", 275, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrNPowerPresDemand", "FL32", 277, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrNPowerPredicDemand", "FL32", 279, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrNPowerPeakDemand", "FL32", 281, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrNPowerPeakDemandDT", "DT4Reg", 283, "0", 0, false, rxBuff)
  },
  demand_channel_8_current_avg: {
    demand_system_assignment: Number(rxBuff[287]),
    register_number_metered_quantity: Number(rxBuff[288]),
    units_code: Number(rxBuff[289]),
    last_demand: FormatData("CurrAvgPowerLastDemand", "FL32", 290, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrAvgPowerPresDemand", "FL32", 292, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrAvgPowerPredicDemand", "FL32", 294, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrAvgPowerPeakDemand", "FL32", 296, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrAvgPowerPeakDemandDT", "DT4Reg", 298, "0", 0, false, rxBuff)
  },
  demand_channel_9_current_G: {
    demand_system_assignment: Number(rxBuff[302]),
    register_number_metered_quantity: Number(rxBuff[303]),
    units_code: Number(rxBuff[304]),
    last_demand: FormatData("CurrGPowerLastDemand", "FL32", 305, "0", 2, false, rxBuff),
    present_demand: FormatData("CurrGPowerPresDemand", "FL32", 307, "0", 2, false, rxBuff),
    predicted_demand: FormatData("CurrGPowerPredicDemand", "FL32", 309, "0", 2, false, rxBuff),
    peak_demand: FormatData("CurrGPowerPeakDemand", "FL32", 311, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("CurrGPowerPeakDemandDT", "DT4Reg", 313, "0", 0, false, rxBuff)
  },
  demand_channel_14_active_power_phase_A: {
    demand_system_assignment: Number(rxBuff[317]),
    register_number_metered_quantity: Number(rxBuff[318]),
    units_code: Number(rxBuff[319]),
    last_demand: FormatData("ActvPowerPhaseALastDemand", "FL32", 320, "0", 2, false, rxBuff),
    present_demand: FormatData("ActvPowerPhaseAPresDemand", "FL32", 322, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ActvPowerPhaseAPredicDemand", "FL32", 324, "0", 2, false, rxBuff),
    peak_demand: FormatData("ActvPowerPhaseAPeakDemand", "FL32", 326, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ActvPowerPhaseAPeakDemandDT", "DT4Reg", 328, "0", 0, false, rxBuff)
  },
  demand_channel_15_reactive_power_phase_A: {
    demand_system_assignment: Number(rxBuff[332]),
    register_number_metered_quantity: Number(rxBuff[333]),
    units_code: Number(rxBuff[334]),
    last_demand: FormatData("ReactvPowerPhaseALastDemand", "FL32", 335, "0", 2, false, rxBuff),
    present_demand: FormatData("ReactvPowerPhaseAPresDemand", "FL32", 337, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ReactvPowerPhaseAPredicDemand", "FL32", 339, "0", 2, false, rxBuff),
    peak_demand: FormatData("ReactvPowerPhaseAPeakDemand", "FL32", 341, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ReactvPowerPhaseAPeakDemandDT", "DT4Reg", 343, "0", 0, false, rxBuff)
  },
  demand_channel_16_apparent_power_phase_A: {
    demand_system_assignment: Number(rxBuff[347]),
    register_number_metered_quantity: Number(rxBuff[348]),
    units_code: Number(rxBuff[349]),
    last_demand: FormatData("ApparPowerPhaseALastDemand", "FL32", 350, "0", 2, false, rxBuff),
    present_demand: FormatData("ApparPowerPhaseAPresDemand", "FL32", 352, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ApparPowerPhaseAPredicDemand", "FL32", 354, "0", 2, false, rxBuff),
    peak_demand: FormatData("ApparPowerPhaseAPeakDemand", "FL32", 356, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ApparPowerPhaseAPeakDemandDT", "DT4Reg", 358, "0", 0, false, rxBuff)
  },
  demand_channel_17_active_power_phase_B: {
    demand_system_assignment: Number(rxBuff[362]),
    register_number_metered_quantity: Number(rxBuff[363]),
    units_code: Number(rxBuff[364]),
    last_demand: FormatData("ActvPowerPhaseBLastDemand", "FL32", 365, "0", 2, false, rxBuff),
    present_demand: FormatData("ActvPowerPhaseBPresDemand", "FL32", 367, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ActvPowerPhaseBPredicDemand", "FL32", 369, "0", 2, false, rxBuff),
    peak_demand: FormatData("ActvPowerPhaseBPeakDemand", "FL32", 371, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ActvPowerPhaseBPeakDemandDT", "DT4Reg", 373, "0", 0, false, rxBuff)
  },
  demand_channel_18_reactive_power_phase_B: {
    demand_system_assignment: Number(rxBuff[377]),
    register_number_metered_quantity: Number(rxBuff[378]),
    units_code: Number(rxBuff[379]),
    last_demand: FormatData("ReactvPowerPhaseBLastDemand", "FL32", 380, "0", 2, false, rxBuff),
    present_demand: FormatData("ReactvPowerPhaseBDemand", "FL32", 382, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ReactvPowerPhaseBPredicDemand", "FL32", 384, "0", 2, false, rxBuff),
    peak_demand: FormatData("ReactvPowerPhaseBPeakDemand", "FL32", 386, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ReactvPowerPhaseBPeakDemandDT", "DT4Reg", 388, "0", 0, false, rxBuff)
  },
  demand_channel_19_apparent_power_phase_B: {
    demand_system_assignment: Number(rxBuff[392]),
    register_number_metered_quantity: Number(rxBuff[393]),
    units_code: Number(rxBuff[394]),
    last_demand: FormatData("ApparPowerPhaseBLastDemand", "FL32", 395, "0", 2, false, rxBuff),
    present_demand: FormatData("ApparPowerPhaseBPresDemand", "FL32", 397, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ApparPowerPhaseBPredicDemand", "FL32", 399, "0", 2, false, rxBuff),
    peak_demand: FormatData("ApparPowerPhaseBPeakDemand", "FL32", 401, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ApparPowerPhaseBPeakDemandDT", "DT4Reg", 403, "0", 0, false, rxBuff)
  },
  demand_channel_20_active_power_phase_C: {
    demand_system_assignment: Number(rxBuff[407]),
    register_number_metered_quantity: Number(rxBuff[408]),
    units_code: Number(rxBuff[409]),
    last_demand: FormatData("ActvPowerPhaseCLastDemand", "FL32", 410, "0", 2, false, rxBuff),
    present_demand: FormatData("ActvPowerPhaseCPresDemand", "FL32", 412, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ActvPowerPhaseCPredicDemand", "FL32", 414, "0", 2, false, rxBuff),
    peak_demand: FormatData("ActvPowerPhaseCPeakDemand", "FL32", 416, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ActvPowerPhaseCPeakDemandDT", "DT4Reg", 418, "0", 0, false, rxBuff)
  },
  demand_channel_21_reactive_power_phase_C: {
    demand_system_assignment: Number(rxBuff[422]),
    register_number_metered_quantity: Number(rxBuff[423]),
    units_code: Number(rxBuff[424]),
    last_demand: FormatData("ReactvPowerPhaseCLastDemand", "FL32", 425, "0", 2, false, rxBuff),
    present_demand: FormatData("ReactvPowerPhaseCPresDemand", "FL32", 427, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ReactvPowerPhaseCPredicDemand", "FL32", 429, "0", 2, false, rxBuff),
    peak_demand: FormatData("ReactvPowerPhaseCPeakDemand", "FL32", 431, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ReactvPowerPhaseCPeakDemandDT", "DT4Reg", 433, "0", 0, false, rxBuff)
  },
  demand_channel_22_apparent_power_phase_C: {
    demand_system_assignment: Number(rxBuff[437]),
    register_number_metered_quantity: Number(rxBuff[438]),
    units_code: Number(rxBuff[439]),
    last_demand: FormatData("ApparPowerPhaseCLastDemand", "FL32", 440, "0", 2, false, rxBuff),
    present_demand: FormatData("ApparPowerPhaseCPresDemand", "FL32", 442, "0", 2, false, rxBuff),
    predicted_demand: FormatData("ApparPowerPhaseCPredicDemand", "FL32", 444, "0", 2, false, rxBuff),
    peak_demand: FormatData("ApparPowerPhaseCPeakDemand", "FL32", 446, "0", 2, false, rxBuff),
    peak_demand_datetime: FormatData("ApparPowerPhaseCPeakDemandDT", "DT4Reg", 448, "0", 0, false, rxBuff)
  }
},

// Retirado da query (PL TAG): 

"PL_" + "_*^H3200[52]" + "__PL" + "," +      // accumulated energy
                                             // Array.length = 164 (Index = Array - 1 ---> 163)
"PL_" + "_*^H3701[9]" + "__PL" + "," +       // demand system 1
"PL_" + "_*^H3711[9]" + "__PL" + "," +       // demand system 2
"PL_" + "_*^H3761[15]" + "__PL" + "," +      // demand channel 1 (each channel must be queried separately)
"PL_" + "_*^H3777[15]" + "__PL" + "," +      // demand channel 2
"PL_" + "_*^H3793[15]" + "__PL" + "," +      // demand channel 3
"PL_" + "_*^H3809[15]" + "__PL" + "," +      // demand channel 4
"PL_" + "_*^H3825[15]" + "__PL" + "," +      // demand channel 5
"PL_" + "_*^H3841[15]" + "__PL" + "," +      // demand channel 6
"PL_" + "_*^H3857[15]" + "__PL" + "," +      // demand channel 7
"PL_" + "_*^H3873[15]" + "__PL" + "," +      // demand channel 8
"PL_" + "_*^H3889[15]" + "__PL" + "," +      // demand channel 9
"PL_" + "_*^H3969[15]" + "__PL" + "," +      // demand channel 14
"PL_" + "_*^H3985[15]" + "__PL" + "," +      // demand channel 15
"PL_" + "_*^H4001[15]" + "__PL" + "," +      // demand channel 16
"PL_" + "_*^H4017[15]" + "__PL" + "," +      // demand channel 17
"PL_" + "_*^H4033[15]" + "__PL" + "," +      // demand channel 18
"PL_" + "_*^H4049[15]" + "__PL" + "," +      // demand channel 19
"PL_" + "_*^H4065[15]" + "__PL" + "," +      // demand channel 20
"PL_" + "_*^H4081[15]" + "__PL" + "," +      // demand channel 21
"PL_" + "_*^H4097[15]" + "__PL" + "," +      // demand channel 22
                                             // Array.length = 452 (Index = Array - 1 ---> 451)



// RESULTS FOR:

/*

var basic_pl_tag =
  "PL_" + "_*^H3000[86]" + "__PL" + "," + // from IA to pf
	"PL_" + "_*^H3110[2]" + "__PL"; //freq

  "PL_" + "_*^H3200[48]" + "__PL" + "," + //accumulated energy

	"PL_" + "_*^H3706[94]" + "__PL" + "," +
  "PL_" + "_*^H3802[54]" + "__PL" + "," +
	"PL_" + "_*^H27218[96]" + "__PL" + "," +
	"PL_" + "_*^H27616[2]" + "__PL" + "," +
	"PL_" + "_*^H27694[96]" + "__PL" + "," +
	"PL_" + "_*^H28092[2]" + "__PL";

*/
5.877471754111438e-39  // IA
***  // IB
***  // IC
***  // IN
***  // IG
5.877471754111438e-39  // Iavg
***  // VAB
***  // VBC
***  // VCA
***  // VLLavg
231.62863159179688  // VAN
***  // VBN
***  // VCN
231.62863159179688  // VLNavg
-0.0000010830908649950288  // kWTtl
5.877471754111438e-39  // kVARTtl
0.0000010830908649950288  // kVATtl
[String: '-1.00000']  // PFTtl
59.99287414550781  // Hz

