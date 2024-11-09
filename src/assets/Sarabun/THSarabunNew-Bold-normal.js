import { jsPDF } from "jspdf"
var font = 'undefined';
var callAddFont = function () {
this.addFileToVFS('THSarabunNew-Bold-normal.ttf', font);
this.addFont('THSarabunNew-Bold-normal.ttf', 'THSarabunNew-Bold', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])
