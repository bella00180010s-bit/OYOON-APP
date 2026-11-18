// ==================================
// OYOON - عيون الأشياء
// الإصدار الثاني: QR Scanner
// ==================================

const scanButton = document.getElementById("scanButton");
const speakButton = document.getElementById("speakButton");
const addButton = document.getElementById("addButton");
const resultText = document.getElementById("resultText");

let items = JSON.parse(
localStorage.getItem("oyoonItems")
) || {
"OYOON001": {
name: "زجاجة الماء",
description: "هذه زجاجة ماء."
},
"OYOON002": {
name: "علبة السكر",
description: "هذه علبة السكر."
},
"OYOON003": {
name: "علبة الملح",
description: "هذه علبة الملح."
}
};

let currentDescription = "";
let scanner = null;
let scanning = false;

// عرض النتيجة
function showResult(message) {
currentDescription = message;
resultText.textContent = message;
}

// النطق العربي
function speakText(message) {

if (!message) return;

window.speechSynthesis.cancel();

const speech = new SpeechSynthesisUtterance(message);

speech.lang = "ar-SA";
speech.rate = 0.9;

window.speechSynthesis.speak(speech);
}

// التعرف على الغرض
function identifyItem(code) {

const item = items[code.trim()];

if (item) {

const message =
"تم التعرف على " +
item.name + ". " +
item.description;

showResult(message);
speakText(message);

} else {

showResult("هذا الغرض غير مسجل في التطبيق.");

speakText("هذا الغرض غير مسجل في التطبيق.");

}
}

// إيقاف الكاميرا
async function stopScanner() {

if (scanner && scanning) {

await scanner.stop();

scanning = false;
}

scanButton.textContent = "مسح رمز QR";
}

// تشغيل الكاميرا
async function startScanner() {

if (!window.isSecureContext) {

showResult(
"الكاميرا تحتاج إلى تشغيل التطبيق عبر اتصال HTTPS آمن."
);

return;
}

if (!window.Html5Qrcode) {

showResult("تعذر تحميل مكتبة قراءة QR. تحققي من الإنترنت.");

return;
}

try {

scanner = new Html5Qrcode("reader");

const cameras = await Html5Qrcode.getCameras();

if (!cameras || cameras.length === 0) {

showResult("لم يتم العثور على كاميرا.");

return;
}

scanning = true;

scanButton.textContent = "إيقاف الكاميرا";

showResult("وجهي الكاميرا نحو رمز QR.");

await scanner.start(

cameras[0].id,

{
fps: 10,
qrbox: {
width: 220,
height: 220
}
},

async (decodedText) => {

await stopScanner();

identifyItem(decodedText);

},

() => {
// تجاهل محاولات القراءة غير الناجحة
}

);

} catch (error) {

scanning = false;

scanButton.textContent = "مسح رمز QR";

showResult(
"تعذر تشغيل الكاميرا. تأكدي من السماح باستخدامها."
);

console.error(error);
}
}

// زر مسح QR
scanButton.addEventListener("click", async () => {

if (scanning) {

await stopScanner();

showResult("تم إيقاف الكاميرا.");

} else {

await startScanner();
}

});

// زر الاستماع
speakButton.addEventListener("click", () => {

speakText(currentDescription);

});

// إضافة غرض
addButton.addEventListener("click", () => {

const code = prompt("أدخلي رمز الغرض:");

if (!code) return;

const cleanCode = code.trim();

if (items[cleanCode]) {

alert("هذا الرمز مسجل مسبقاً.");

return;
}

const name = prompt("ما اسم الغرض؟");

if (!name || !name.trim()) return;

const description = prompt("اكتبي وصف الغرض:");

if (!description || !description.trim()) return;

items[cleanCode] = {
name: name.trim(),
description: description.trim()
};

localStorage.setItem(
"oyoonItems",
JSON.stringify(items)
);

showResult("تمت إضافة الغرض بنجاح.");

speakText("تمت إضافة الغرض بنجاح.");

});