import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

function getTaiXiu(sum) {
  return sum >= 11 ? 'Tài' : 'Xỉu';
}

function predictTaiXiu(history = []) {
  // Có thể thay bằng thuật toán Markov, Azenly... ở đây ta mặc định dự đoán giống kết quả hiện tại
  if (!history.length) return 'Xỉu';
  return history[0].result;
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
    const sum = dice.reduce((a, b) => a + b, 0);
    const result = getTaiXiu(sum);

    const currentSession = parseInt(data.Expect.replace(/^25/, ''));
    const prediction = predictTaiXiu([{ result }]);

    return res.json({
      current_result: result,
      current_session: currentSession,
      next_session: currentSession + 1,
      prediction: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi fetch dữ liệu', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
