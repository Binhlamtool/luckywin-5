import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Lưu pattern gần nhất (tối đa 20)
let patternHistory = "";

function updatePattern(result) {
  if (patternHistory.length >= 20) {
    patternHistory = patternHistory.slice(1);
  }
  patternHistory += result;
}

function getTaiXiu(sum) {
  return sum >= 11 ? 'Tài' : 'Xỉu';
}

function predictPattern(history) {
  if (history.length < 6) return "Chưa đủ dữ liệu";
  const lastChar = history[history.length - 1];
  return lastChar === 't' ? "Xỉu" : "Tài";
}

app.get('/api/taixiu/lottery', async (req, res) => {
  try {
    const response = await fetch('https://1.bot/GetNewLottery/LT_TaixiuMD5');
    const json = await response.json();

    if (!json || json.state !== 1) {
      return res.status(500).json({ error: 'Dữ liệu không hợp lệ' });
    }

    const data = json.data;
    const dice = data.OpenCode.split(',').map(Number);
    const [d1, d2, d3] = dice;
    const sum = d1 + d2 + d3;
    const ket_qua = getTaiXiu(sum);
    const patternChar = ket_qua === "Tài" ? "t" : "x";

    updatePattern(patternChar);
    const du_doan = predictPattern(patternHistory);

    return res.json({
      id: "binhtool90",
      Phien: parseInt(data.Expect.replace(/^25/, '')),
      Xuc_xac_1: d1,
      Xuc_xac_2: d2,
      Xuc_xac_3: d3,
      Tong: sum,
      Ket_qua: ket_qua,
      Pattern: patternHistory,
      Du_doan: du_doan
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi fetch dữ liệu', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
