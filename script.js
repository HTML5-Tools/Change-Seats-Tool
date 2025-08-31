// 関数
function randomize(arr){
    for (let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

function getRowMenbers(arr, rowCount){
    const result = [];
    for (let i = 0; i < Math.floor(Math.max(...rowCount) / 6) + 1; i++){
    result.push(new Array());
    }
    console.log(result);
    for (let i = 0; i < arr.length; i++){
    result[Math.floor(rowCount[i] / 6)].push(arr[i]);
    }
    console.log(result);
    return result;
}

function sortNumbersAscending(numbers) {
  return numbers.slice().sort((a, b) => a - b);
}

// textarea宣言
const menber_input = document.querySelector("#menber");
const absent_input = document.querySelector("#absent");

// ラジオボタン宣言
const radios = document.querySelectorAll("input[type='radio']");
const randomRad = document.querySelector("#random");
const senojyunURad = document.querySelector("#senojyunU");
const senojyunDRad = document.querySelector("#senojyunD");

// チェックボックス宣言
const otanoshimiCheckbox = document.querySelector("#otanoshimi");

// ボタン宣言
const setSeatsBtn = document.querySelector("#setSeats");
const stopOtanoshimiBtn = document.querySelector("#stopOtanoshimi");
const saveSettingsBtn = document.querySelector("#saveSettings");

// その他
const seats_elem = document.querySelector("#seats");
let seatNum = 0;
function resetSeats() {
    seats_elem.innerHTML = "";
    for (let i = 0; i < 6; i++){
        let column = document.createElement("div");
        column.className = "column";
        for (let j = 0; j < 6; j++){
            let seat = document.createElement("p");
            seat.id = "seat" + seatNum;
            seat.number = seatNum;
            seat.className = "seat";
            column.appendChild(seat);
            seatNum++;
        }
        seats_elem.appendChild(column);
    }
};
const scrollPos_elem = document.querySelector("#scrollPos");
resetSeats();

// 処理中にバグが発生しないように席を編集できないようにするための変数
let processing = false;

// 座席関連
let seatSetted = false;
let use_seats = new Array();
let use_seats_num = new Array();
const seat_elems = document.querySelectorAll(".seat");
for (let seat of seat_elems){
    seat.addEventListener("click", function(){
        if(processing){
            window.alert("現在席の割り当て処理中なので席の編集はできません。");
            return;
        }
        if(seatSetted){
            const confirm = window.confirm("有効な席を変更すると席替えの結果が消えますがよろしいですか？");
            if(!confirm){
                return;
            }
            seatSetted = false;
            for(let seat of seat_elems){
                seat.textContent = "";
            }
        }
        if (use_seats.includes(seat.id)){
            use_seats.splice(use_seats.indexOf(seat.id), 1);
            use_seats_num.splice(use_seats_num.indexOf(seat.number), 1);
            seat.removeAttribute("use");
        } else {
            use_seats_num.push(seat.number);
            use_seats_num = sortNumbersAscending(use_seats_num);
            seat.setAttribute("use", "true");
            use_seats = [];
            use_seats_num.forEach(num => {
                use_seats.push("seat" + num);
            });
        }
        // document.querySelector("#debug1").textContent = "Debug: use_seats: " + use_seats;
    })
};

// データセーブ / ロード
function saveSettings() {
    localStorage.setItem("menber", menber_input.value);
    localStorage.setItem("absent", absent_input.value);
    let setSeatsMethod = null;
    if (randomRad.checked){
        setSeatsMethod = "random";
    } else if (senojyunURad.checked){
        setSeatsMethod = "senojyunU";
    } else if (senojyunDRad.checked){
        setSeatsMethod = "senojyunD";
    }
    localStorage.setItem("setSeatsMethod", setSeatsMethod);
    localStorage.setItem("otanoshimi", otanoshimiCheckbox.checked);
    localStorage.setItem("useSeats", use_seats.join(","));
    const textContents = [];
    use_seats_num.forEach(num => {
        textContents.push(document.querySelector("#seat" + num).textContent);
    });
    localStorage.setItem("textContents", JSON.stringify(textContents));
    window.alert("設定を保存しました。");
}
function loadSettings() {
    menber_input.value = localStorage.getItem("menber") || "";
    absent_input.value = localStorage.getItem("absent") || "";
    const setSeatsMethod = localStorage.getItem("setSeatsMethod") || "random";
    if (setSeatsMethod === "random"){
        randomRad.checked = true;
    } else if (setSeatsMethod === "senojyunU"){
        senojyunURad.checked = true;
    } else if (setSeatsMethod === "senojyunD"){
        senojyunDRad.checked = true;
    }
    otanoshimiCheckbox.checked = localStorage.getItem("otanoshimi") === "true" || false;
    use_seats = localStorage.getItem("useSeats")?.split(",") || [];
    use_seats_num = [];
    for (let seat of use_seats){
        const seatElem = document.querySelector("#" + seat);
        seatElem.setAttribute("use", "true");
        use_seats_num.push(seatElem.number);
    }
    const textContents = JSON.parse(localStorage.getItem("textContents")) || [];
    console.log(textContents + "," + JSON.stringify(textContents));
    textContents.forEach((text, i) => {
        document.querySelector("#seat" + use_seats_num[i]).textContent = text;
    });
    if(!(textContents == [])){
        seatSetted = true;
    }

}
loadSettings();
saveSettingsBtn.addEventListener("click", saveSettings);

// すべての入力欄などを無効化
function disableInputs() {
    menber_input.disabled = "true";
    absent_input.disabled = "true";
    randomRad.disabled = "true";
    senojyunURad.disabled = "true";
    senojyunDRad.disabled = "true";
    otanoshimiCheckbox.disabled = "true";
    setSeatsBtn.disabled = "true";
    stopOtanoshimiBtn.disabled = "true";
    saveSettingsBtn.disabled = "true";
}
// すべての入力欄などを有効化
function enableInputs() {
    menber_input.disabled = "";
    absent_input.disabled = "";
    randomRad.disabled = "";
    senojyunURad.disabled = "";
    senojyunDRad.disabled = "";
    otanoshimiCheckbox.disabled = "";
    setSeatsBtn.disabled = "";
    saveSettingsBtn.disabled = "";
}

// お楽しみモード関連
let otanoshimiItems = [];
let otanoshimiIndex = 0;
function showNext(){
    if (otanoshimiIndex >= otanoshimiItems.length){
        clearInterval(otanoshimiInterval);
        stopOtanoshimiBtn.disabled = "true";
        enableInputs();
        processing = false;
        console.log("お楽しみモード終了");
        return;
    }
    document.querySelector("#seat" + otanoshimiIndex).textContent = otanoshimiItems[otanoshimiIndex];
    otanoshimiIndex++;
    console.log(otanoshimiIndex);
}

let otanoshimiInterval = null;

// 席指定
function setSeats() {
    otanoshimiIndex = 0;
    otanoshimiItems = [];
    disableInputs();
    processing = true;
    // 有効席の取得
    const useSeatsElem = [];
    for (let i = 0; i < use_seats.length; i++){
        useSeatsElem.push(document.querySelector("#" + use_seats[i]));
    }

    // メンバー・除外メンバー配列
    let menberArr = menber_input.value.split("\n").map(v => v.trim()).filter(v => v !== "");
    let absentArr = absent_input.value.split("\n").map(v => v.trim()).filter(v => v !== "");

    // メンバー重複チェック
    const menberDup = menberArr.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
    if (menberDup.length > 0) {
        alert('メンバーに重複があります: ' + [...new Set(menberDup)].join(', '));
        return;
    }

    // 除外メンバー重複チェック
    const absentDup = absentArr.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
    if (absentDup.length > 0) {
        alert('除外するメンバーに重複があります: ' + [...new Set(absentDup)].join(', '));
        return;
    }

    // 除外メンバーがメンバーに含まれていない場合
    let notFound = absentArr.filter(name => !menberArr.includes(name));
    if (notFound.length > 0) {
        alert('メンバー に存在しない名前が 除外するメンバー に含まれています: ' + notFound.join(', '));
        return;
    }

    // 除外メンバーを除外
    menberArr = menberArr.filter(name => !absentArr.includes(name));

    // メンバーが空の場合
    if (menberArr.length === 0) {
        alert('メンバーがいません。');
        return;
    }

    // 有効席数 ≠ メンバー数 の場合
    if (useSeatsElem.length != menberArr.length) {
        alert(`有効な席数とメンバー数が一致しません。（有効席数: ${useSeatsElem.length} メンバー数: ${menberArr.length}）`);
        return;
    }

    // 席割り当て処理

    scrollPos_elem.scrollIntoView({
        behavior: "smooth"
    });

    for(let seat of seat_elems){
        seat.textContent = "";
    }

    seatSetted = true;
    let result = [];
    if (randomRad.checked){
        // 完全ランダム席替え
        result = randomize(menberArr);
    } else if (senojyunURad.checked){
        // 背の順的席替え（昇順）
        result = getRowMenbers(menberArr, use_seats_num);
        for (let i = 0; i < result.length; i++){
            result[i] = randomize(result[i]);
        }
        result = result.flat();
    } else if (senojyunDRad.checked){
        // 背の順的席替え（降順）
        result = menberArr.toReversed();
        result = getRowMenbers(result, use_seats_num);
        for (let i = 0; i < result.length; i++){
            result[i] = randomize(result[i]);
        }
        result = result.flat();
    }
    otanoshimiItems = result;
    otanosihmiIndex = 0;
    if (otanoshimiCheckbox.checked){
        stopOtanoshimiBtn.disabled = false;
        otanoshimiInterval = setInterval(showNext, 1000);
    } else {
        for (let i = 0; i < useSeatsElem.length; i++){
            useSeatsElem[i].textContent = result[i];
        }
        enableInputs();
        processing = false;
    }
}
setSeatsBtn.addEventListener("click", setSeats);
stopOtanoshimiBtn.addEventListener("click", function(){
    clearInterval(otanoshimiInterval);
    otanoshimiInterval = null;
    enableInputs();
    stopOtanoshimiBtn.disabled = true;
    processing = false;
});

for (let radio of radios){
    radio.addEventListener("click", function(){
        for (let radio2 of radios){
            radio2.checked = false;
        }
        radio.checked = true;
    })
};