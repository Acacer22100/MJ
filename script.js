const TILE_NAMES = [
    "1萬","2萬","3萬","4萬","5萬","6萬","7萬","8萬","9萬",
    "1筒","2筒","3筒","4筒","5筒","6筒","7筒","8筒","9筒",
    "1條","2條","3條","4條","5條","6條","7條","8條","9條",
    "東","南","西","北","中","發","白"
];

let counts = Array(34).fill(4);
let myHand = [];
let river = [];
let isHandMode = true;

function initBoard() {
    const board = document.getElementById('tile-board');
    board.innerHTML = '';
    TILE_NAMES.forEach((name, id) => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.id = `tile-${id}`;
        div.innerHTML = `${name}<span class="count">4</span>`;
        div.onclick = () => handleTileClick(id);
        board.appendChild(div);
    });
}

// 理牌：依照 萬、筒、條、字的順序排列
function sortHand() {
    myHand.sort((a, b) => a - b);
    updateUI();
}

function handleTileClick(id) {
    if (counts[id] <= 0) return;
    if (isHandMode) {
        if (myHand.length < 17) {
            myHand.push(id);
            counts[id]--;
        } else {
            alert("手牌已達 17 張！");
        }
    } else {
        river.push(id);
        counts[id]--;
    }
    updateUI();
}

// 拖曳邏輯
function allowDrop(ev) { ev.preventDefault(); }

function drag(ev, index) {
    ev.dataTransfer.setData("text", index);
    ev.target.classList.add('dragging');
}

function dropToRiver(ev) {
    ev.preventDefault();
    const handIndex = ev.dataTransfer.getData("text");
    if (handIndex !== "") {
        const idx = parseInt(handIndex);
        const tileId = myHand.splice(idx, 1)[0];
        river.push(tileId);
        updateUI();
    }
}

function updateUI() {
    TILE_NAMES.forEach((_, id) => {
        const el = document.getElementById(`tile-${id}`);
        el.querySelector('.count').innerText = counts[id];
        if (counts[id] === 0) el.classList.add('disabled');
        else el.classList.remove('disabled');
    });

    const handDiv = document.getElementById('hand-display');
    handDiv.innerHTML = myHand.map((id, index) => 
        `<span class="mini-tile" draggable="true" 
               ondragstart="drag(event, ${index})" 
               ondragend="this.classList.remove('dragging')">${TILE_NAMES[id]}</span>`
    ).join('');

    document.getElementById('river-display').innerHTML = river.map(id => 
        `<span class="mini-tile">${TILE_NAMES[id]}</span>`
    ).join('');
    
    if (isHandMode) {
        document.getElementById('mode-text').innerText = `選取手牌 (${myHand.length}/17)`;
    }
}

function toggleMode() {
    isHandMode = !isHandMode;
    const btn = document.getElementById('mode-btn');
    const txt = document.getElementById('mode-text');
    if (isHandMode) {
        btn.classList.add('active-mode');
        txt.innerText = `選取手牌 (${myHand.length}/17)`;
    } else {
        btn.classList.remove('active-mode');
        txt.innerText = "選取牌池 (別家打出)";
    }
}

function resetAll() {
    counts = Array(34).fill(4);
    myHand = [];
    river = [];
    document.getElementById('ai-result').innerText = "等待輸入...";
    updateUI();
}

async function getAISuggestion() {
    if (myHand.length < 17) {
        alert("手牌不足 17 張！");
        return;
    }
    document.getElementById('ai-result').innerText = "🔮 大神思考中...";
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ hand: myHand, river: river })
        });
        const res = await response.json();
        document.getElementById('ai-result').innerText = `💡 建議捨棄：【${res.suggest_name}】`;
    } catch (e) {
        document.getElementById('ai-result').innerText = "❌ 伺服器連線失敗";
    }
}

initBoard();