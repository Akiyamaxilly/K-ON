import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'messages.json');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

/* ── 读取留言 ── */
function loadMessages() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/* ── 保存留言 ── */
function saveMessages(msgs) {
  writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2), 'utf-8');
}

/* ── GET /api/messages ── */
app.get('/api/messages', (_req, res) => {
  res.json(loadMessages());
});

/* ── POST /api/messages ── */
app.post('/api/messages', (req, res) => {
  const { name, text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  const msgs = loadMessages();
  const now = new Date();
  const timeStr =
    now.getFullYear() + '/' +
    String(now.getMonth() + 1).padStart(2, '0') + '/' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');

  const msg = {
    id: Date.now() + Math.random().toString(36).slice(2, 6),
    name: (name || '').trim() || '匿名',
    text: text.trim(),
    time: timeStr,
  };
  msgs.unshift(msg);
  saveMessages(msgs);
  res.status(201).json(msg);
});

/* ── DELETE /api/messages/:id ── */
app.delete('/api/messages/:id', (req, res) => {
  const msgs = loadMessages();
  const idx = msgs.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '留言不存在' });
  msgs.splice(idx, 1);
  saveMessages(msgs);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`♪ 轻音粉丝站已启动 → http://localhost:${PORT}`);
});
