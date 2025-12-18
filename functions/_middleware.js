export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. 获取环境变量中的密码
  // 在 Cloudflare Pages 后台设置变量名: AUTH_PASSWORD
  const CORRECT_PASSWORD = env.AUTH_PASSWORD;

  // 如果没有设置密码变量，直接放行（防止配置错误导致无法访问）
  if (!CORRECT_PASSWORD) {
    return next();
  }

  // 2. 放行部分静态资源（可选）
  // 为了让登录页的 favicon 或 logo 能显示，可以放行图片
  // 注意：千万不要放行 .js 或 .html，否则会被绕过
  if (/\.(ico|svg|png|jpg|jpeg|css)$/.test(url.pathname)) {
    return next();
  }

  // 3. 检查 Cookie 是否包含正确密码
  const cookieHeader = request.headers.get("Cookie") || "";
  if (cookieHeader.includes(`auth=${CORRECT_PASSWORD}`)) {
    return next();
  }

  // 4. 处理 POST 登录请求
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === CORRECT_PASSWORD) {
      // 密码正确，设置 Cookie 并重定向回首页
      return new Response("Login Success", {
        status: 302,
        headers: {
          "Location": "/",
          // 设置 HttpOnly 和 Secure，确保安全性
          "Set-Cookie": `auth=${CORRECT_PASSWORD}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400` // 1天过期
        }
      });
    } else {
      // 密码错误，返回登录页并提示
      return new Response(getLoginPage(true), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }
  }

  // 5. 默认返回登录页面
  return new Response(getLoginPage(false), {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}

// 辅助函数：生成登录页 HTML
function getLoginPage(isError) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InspireMusic - 访问验证</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #0f0f11;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .auth-box {
      background: #1a1a1c;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      text-align: center;
      width: 100%;
      max-width: 320px;
      border: 1px solid #333;
    }
    .title { font-size: 1.5rem; margin-bottom: 1.5rem; font-weight: 600; }
    input {
      width: 100%;
      padding: 12px;
      margin-bottom: 1rem;
      border: 1px solid #444;
      background: #2a2a2c;
      color: white;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      outline: none;
    }
    input:focus { border-color: #646cff; }
    button {
      width: 100%;
      padding: 12px;
      background-color: #646cff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover { background-color: #535bf2; }
    .error { color: #ff4d4f; margin-bottom: 1rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="auth-box">
    <div class="title">InspireMusic</div>
    ${isError ? '<div class="error">密码错误，请重试</div>' : ''}
    <form method="POST">
      <input type="password" name="password" placeholder="请输入访问密码" required autofocus />
      <button type="submit">进入</button>
    </form>
  </div>
</body>
</html>
  `;
}
