var PICTURE_URL = "img.png";
var BLOCK_W = 150;
var BLOCK_H = 150;
var ROW_COUNT = 4;
var COL_COUNT = 4;
var NUM_BLOCKS = ROW_COUNT * COL_COUNT;
var UDLR = [[0,-1],[0,1],[-1,0],[1,0]];

var context, image;
var blocks = [];
var isLock;

function init() {
    var canvas = document.getElementById("gameCanvas");
    if(!canvas.getContext) {
        // 表示できない場合
        alert("canvasをサポートされていません。");
        return;
    }

    context = canvas.getContext("2d");
    // マウスイベント
    canvas.onmousedown = mouseHandler;
    // メイン画像読み込み
    image = new Image();
    image.src = PICTURE_URL;
    image.onload = initGame;
};
// ゲームの初期化を行う
function initGame() {
	isLock = true;
	for(var i = 0; i < NUM_BLOCKS; i++) {
		blocks[i] = i;
	}
	blocks[NUM_BLOCKS - 1] = -1;  // 右下のピースを空白にする
	drawPuzzle();  // 表示する
	setTimeout(shufflePuzzle, 1000);
}
// パズルの各ピースをシャッフル
function shufflePuzzle() {
	var scount = 37;  // シャッフルする回数
	var blank = NUM_BLOCKS - 1;

	var shuffle = function() {
		scount--;
		if(scount <= 0) {
			isLock = false;
			return;
		}
		var r, px, py, no;
		while(1) {
			r = Math.floor(Math.random() * UDLR.length);
			px = getCol(blank) + UDLR[r][0];
			py = getRow(blank) + UDLR[r][1];
			if(px < 0 || px >= COL_COUNT) continue;
			if(py < 0 || py >= ROW_COUNT) continue;
			no = getIndex(px, py);
			break;
		}
		blocks[blank] = blocks[no];
		blocks[no] = -1;
		blank = no;
		drawPuzzle();
		setTimeout(shuffle, 100);
	};
	shuffle();
}
// パズル画面の描画を行う関数
function drawPuzzle() {
	for(var i = 0; i < NUM_BLOCKS; i++) {
		var dx = (i % COL_COUNT) * BLOCK_W;
		var dy = Math.floor(i / COL_COUNT) * BLOCK_H;
		var no = blocks[i];
		if(no < 0) {  // 空きブロック
			context.fillStyle = "#33ccff";
			context.fillRect(dx, dy, BLOCK_W, BLOCK_H);
		}else {  // no >= 0
			var sx = (no % COL_COUNT) * BLOCK_W;
			var sy = Math.floor(no / COL_COUNT) * BLOCK_H;
			context.drawImage(image, sx, sy, BLOCK_W, BLOCK_H, dx, dy, BLOCK_W, BLOCK_H);
		}
		// 画像の枠の描画
		context.beginPath();
		context.strokeStyle = "white";
		context.lineWidth = 3;
		context.rect(dx, dy, BLOCK_W, BLOCK_H);
		context.stroke();
		context.closePath();
		// ブロック番号の描画
		/*
		context.fillStyle = "white";
		context.font = "bold 40px Arial";
		var cx = dx + (BLOCK_W - 40) / 2;
		var cy = dy + BLOCK_H / 2;
		context.fillText(no, cx, cy);
		*/
	}
}
function mouseHandler(t) {
	if(isLock) return;
	// タッチ座標の所得
	var px = t.offsetX, py = t.offsetY;
	if(px == undefined) {  // FireFox対策
		var p = t.currentTarget;
		px = t.layerX - p.offsetLeft;
		py = t.layerY - p.offsetTop;
	}

	var px2 = Math.floor(px / BLOCK_W);
	var py2 = Math.floor(py / BLOCK_H);
	var no = getIndex(px2, py2);
	// 空白ならうごかせない
	if(blocks[no] == -1) return;
	// 上下左右に動かせるブロックがあるかどうか確認
	for(var i = 0; i < UDLR.length; i++) {
		var pt = UDLR[i];
		var xx = px2 + pt[0];
		var yy = py2 + pt[1];
		var no = getIndex(xx, yy);
		if(xx < 0 || xx >= COL_COUNT) continue;
		if(yy < 0 || yy >= ROW_COUNT) continue;
		if(blocks[no] == -1) { // 移動可能かどうか判定
			blocks[no] = blocks[getIndex(px2, py2)];
			blocks[getIndex(px2, py2)] = -1;
			drawPuzzle();
			cheakClear();
			break;
		}
	}
}
// クリアしたかどうかチェックする関数
function cheakClear() {
	var flag = true;
	for(var i = 0; i < (NUM_BLOCKS - 1); i++) {
		if(blocks[i] != i) {
			flag = false;
			break;
		}
	}
	if(flag) {
		alert("ゲームクリアしました！");
		initGame();  // 初期化して再度ゲーム開始する
	}
}
function getIndex(col, row) {
	return row * COL_COUNT + col;
}
function getCol(no) {
	return no % COL_COUNT;
}
function getRow(no) {
	return Math.floor(no / COL_COUNT);
}