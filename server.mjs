import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);

function readEnv() {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(line => line && !line.trim().startsWith('#')).map(line => {
    const [key, ...rest] = line.split('=');
    return [key.trim(), rest.join('=').trim().replace(/^['"]|['"]$/g, '')];
  }).filter(([key]) => key));
}

const env = readEnv();
const apiKey = env.OPENAI_API_KEY || '';
const model = env.OPENAI_MODEL || 'gpt-4o-mini';
const brief = fs.readFileSync(path.join(root, 'BRIEF.md'), 'utf8');
const instructionStart = brief.indexOf('## 我的 AI 的指令');
const aiInstructions = instructionStart >= 0 ? brief.slice(instructionStart) : '负责解释和整理老师的信息；不确定时必须说明并建议向老师确认。';

const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.md':'text/markdown; charset=utf-8'};

function sendJson(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 100000) reject(new Error('request too large')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('invalid json')); } });
    req.on('error', reject);
  });
}

function extractText(response) {
  if (typeof response.output_text === 'string') return response.output_text;
  return (response.output || []).flatMap(item => item.content || []).map(part => part.text || '').join('\n').trim();
}

async function interpret(note, language, question) {
  if (!apiKey) throw new Error('missing_key');
  const prompt = `请处理下面的老师通知。目标解释语言：${language}。\n\n老师通知：\n${note}\n\n用户的额外问题：\n${question || '没有额外问题。'}\n\n请只返回有效 JSON，不要 Markdown 代码围栏，字段必须是：translation（字符串）、explanation（字符串）、todos（数组，每项包含 task 和 deadline 字符串；没有截止日期时写“未说明”）、answer（字符串；没有问题时写“没有额外问题”）、uncertainty（字符串；如果没有不确定性也要说明“请仍向老师核对重要信息”）。不要编造通知中没有的事实。`;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body: JSON.stringify({model,instructions:aiInstructions,input:prompt,max_output_tokens:900})
  });
  if (!response.ok) throw new Error(`api_${response.status}`);
  const data = await response.json();
  const text = extractText(data);
  try { return JSON.parse(text.replace(/^```json\s*/i,'').replace(/\s*```$/,'')); }
  catch { return {translation:text,explanation:'AI 返回了文本，但没有按预期格式整理。请向老师核对重要信息。',todos:[],answer:'没有额外问题',uncertainty:'请向老师核对重要信息。'}; }
}

function serveStatic(req, res) {
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  const full = path.resolve(root, file);
  if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, {'Content-Type':mime[path.extname(full)] || 'application/octet-stream'}); fs.createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/interpret') {
    try {
      const body = await getBody(req);
      const note = typeof body.note === 'string' ? body.note.trim() : '';
      const language = typeof body.language === 'string' ? body.language : '中文';
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (!note) return sendJson(res, 400, {error:'请先粘贴一条老师通知。'});
      if (note.length > 12000) return sendJson(res, 400, {error:'通知太长了，请先缩短到 12,000 个字符以内。'});
      const result = await interpret(note, language, question);
      return sendJson(res, 200, {result});
    } catch (error) {
      const message = error.message === 'missing_key' || error.message.startsWith('api_') ? 'AI 暂时无法回复，请检查 .env 中的 API 密钥和网络连接。' : '这次没有完成解释，请稍后再试。';
      return sendJson(res, 503, {error:message});
    }
  }
  if (req.method === 'GET' && req.url === '/api/health') return sendJson(res, 200, {ok:true});
  if (req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405); res.end('Method not allowed');
});

server.listen(port, '127.0.0.1', () => console.log(`ai app running at http://127.0.0.1:${port}`));
