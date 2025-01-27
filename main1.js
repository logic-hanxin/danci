let junior = document.querySelector('.junior');
let senior = document.querySelector('.senior');
let cet4 = document.querySelector('.cet4');
let cet6 = document.querySelector('.cet6');
let postgraduate = document.querySelector('.postgraduate');
let toefl = document.querySelector('.toefl');
let sat = document.querySelector('.sat');

let lines;
let values;
let p1, p2;
let t = ['八上', '高中', '四级', '六级', '考研', '托福', 'SAT'];
let num; // 定义num为全局变量

// 初始化n函数
let n = function (type) {
    let key;
    if (type === "八上") {
        key = 'number1';
    } else if (type === "高中") {
        key = 'number2';
    } else if (type === "四级"){
        key = 'number3';
    } else if (type === "六级"){
        key = 'number4';
    } else if (type === "考研"){
        key = 'number5';
    } else if (type === "托福"){
        key = 'number6';
    } else if (type === "SAT"){
        key = 'number7';
    }
    num = localStorage.getItem(key) ? Number(localStorage.getItem(key)) : 0; // 更新全局变量num
};

let type = async (x) => {
    if (!x) x = '八上'; // 第一次打开网站默认选择“初中”
    localStorage.setItem("类型", x);
    n(x); // 调用n函数
    
    try {
        let response = await fetch(`http://127.0.0.1:8000/${encodeURIComponent(x)}.txt`);
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.text();
        
        lines = data.split('\n');
        values = lines.map(line => line.split('\t').filter(Boolean)); // 过滤掉可能的空字符串
        
        if(num >= values.length || num < 0) { // 确保num在数组范围内
            console.error('Index out of bounds.');
            return;
        }
        
        updateDisplay();
    } catch (error) {
        console.error('Error fetching the file:', error);
    }
};

[junior, senior, cet4, cet6, postgraduate, toefl, sat].forEach((element, index) => 
    element.addEventListener('click', () => type(t[index]))
);

// 浏览器第一次打开
window.onload = () => {
    type(localStorage.getItem('类型') || '八上');
};

// 左右按钮，上一个下一个
let left = document.querySelector('.left');
let right = document.querySelector('.right');
let nownum = document.querySelector('.nownum');

left.addEventListener('click', () => {
    if(num > 0){
        num--;
        saveNumToLocalStorage();
        updateDisplay();
    }
});

right.addEventListener('click', () => {
    if(num < values.length - 1){ // 防止超出数组范围
        num++;
        saveNumToLocalStorage();
        updateDisplay();
    }
});

function saveNumToLocalStorage() {
    let key;
    switch(localStorage.getItem("类型")) {
        case "八上": key = 'number1'; break;
        case "高中": key = 'number2'; break;
        case "四级": key = 'number3'; break;
        case "六级": key = 'number4'; break;
        case "考研": key = 'number5'; break;
        case "托福": key = 'number6'; break;
        case "SAT": key = 'number7'; break;
    }
    localStorage.setItem(key, num);
}

function updateDisplay() {
    if (!p1 || !p2) {
        p1 = document.querySelector('#map0');
        p2 = document.querySelector('#map1');
    }

    if(num >= values.length || num < 0) { // 确保num在数组范围内
        console.error('Index out of bounds.');
        return;
    }

    // 固定文本代替实际单词，并设置点击事件来播放音频
    p1.innerHTML = '点击听单词';
    p1.onclick = () => speakTwiceWithInterval(values[num][0]); // 绑定点击事件，朗读当前单词

    // 隐藏汉语意思
    p2.style.display = 'none';

    document.querySelector('.nownum').innerHTML = `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp当前单词为${localStorage.getItem("类型")}的第${num + 1}个`;
    
    // 更新不会单词数量显示
    document.querySelector('.notcount').innerHTML = `不会的单词数: ${not.length}`;
}

// 添加此函数用于朗读文本两次，中间间隔2秒
function speakTwiceWithInterval(text) {
    if ('speechSynthesis' in window) {
        // 定义一个函数来创建带有指定配置的SpeechSynthesisUtterance对象
        function createUtterance(text, voice) {
            const msg = new SpeechSynthesisUtterance();
            msg.text = text;
            msg.lang = 'en-US'; // 设置语言为美式英语
            msg.voice = voice; // 使用传入的声音配置
            return msg;
        }

        // 获取指定的语言和声音
        const preferredVoice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US' && voice.name.includes("Google"));

        let isFirstPlay = true;

        // 创建第一个utterance并播放
        const firstMsg = createUtterance(text, preferredVoice);
        
        // 第一次朗读后设置第二次朗读
        firstMsg.onend = () => {
            if (isFirstPlay) {
                isFirstPlay = false;
                // 创建第二个utterance，使用与第一个相同的声音配置
                const secondMsg = createUtterance(text, preferredVoice);
                setTimeout(() => { // 使用setTimeout确保间隔
                    speechSynthesis.speak(secondMsg);
                }, 150); // 间隔时间可以根据需要调整
            }
        };

        speechSynthesis.speak(firstMsg);
    } else {
        console.log("您的浏览器不支持Web Speech API");
    }
}

// 不会单词逻辑
let not = JSON.parse(localStorage.getItem('not')) || [];

document.querySelector('.makenot').addEventListener('click', () => {
    const currentWord = `${values[num][0]}\t${values[num][1]}`; // 使用制表符连接以匹配原始格式
    if (!not.includes(currentWord)) {
        not.push(currentWord);
        localStorage.setItem('not', JSON.stringify(not));
        renderNotList();
        updateDisplay(); // 更新不会单词数量显示
    }
});

function renderNotList() {
    const notlist = document.querySelector('.notlist');
    notlist.innerHTML = ''; // 清空现有列表
    not.forEach(wordStr => {
        const wordArr = wordStr.split('\t');
        const divEl = document.createElement('div');
        divEl.innerHTML = `${wordArr[0]} - ${wordArr[1]}`;
        notlist.appendChild(divEl);
        divEl.style.marginBottom = '9px';

        const btn = document.createElement('button');
        btn.innerHTML = 'X';
        divEl.appendChild(btn);
        btn.classList.add('x');

        btn.addEventListener('click', () => {
            const index = not.indexOf(wordStr);
            if (index > -1) {
                not.splice(index, 1);
                localStorage.setItem('not', JSON.stringify(not));
                renderNotList();
                updateDisplay(); // 更新不会单词数量显示
            }
        });
    });
}

// 页面加载时初始化不会单词列表
window.onload = () => {
    type(localStorage.getItem('类型') || '八上');
    renderNotList(); // 初始渲染不会的单词列表
    updateDisplay(); // 初始更新不会单词数量显示
};

// 添加一键清空功能
document.querySelector('.clearnot').addEventListener('click', () => {
    not = [];
    localStorage.removeItem('not');
    renderNotList();
    updateDisplay(); // 更新不会单词数量显示
});
function searchWord() {
    const searchWord = document.getElementById('searchWordInput').value.trim().toLowerCase();
    if (!searchWord) {
        alert('请输入要搜索的单元');
        return;
    }

    // 遍历values数组寻找匹配的单词
    for (let i = 0; i < values.length; i++) {
        const word = values[i][0].trim().toLowerCase(); // 假设单词位于每个子数组的第一个位置
        if (word === searchWord) {
            num = i; // 更新全局变量num为找到的单词索引
            saveNumToLocalStorage(); // 保存更新后的num到localStorage
            updateDisplay(); // 更新显示内容
            return;
        }
    }

    alert('未找到该单元');
}