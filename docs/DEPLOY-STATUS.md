# 部署状态（2026-10-30）

## 已完成的部署

Cloudflare Workers 静态资源（`wrangler deploy --temporary`，无需账号）：

| 站点 | URL | 状态 |
|---|---|---|
| 官网 | https://yuzuostudio.waiting-mailbox-5a0.workers.dev | 上传 38 文件成功，7.3s |
| 目录站 | https://ruanjianmulu.waiting-mailbox-5a0.workers.dev | 上传成功，9.4s |

`not_found_handling = "single-page-application"`，深链由资源层回退到 index.html。

## 为什么这不能当生产环境

本机实测：`yuzuostudio.waiting-mailbox-5a0.workers.dev` 的 DNS 只解析到
`2a03:2880:f10f:83:face:b00c:0:25de`（IPv6，且 `face:b00c` 是污染特征串），
curl `Connection timed out`（http_code 000）。

即 **`*.workers.dev` 在境内被污染/阻断**。部署本身是成功的（服务端上传、版本号、触发器都正常），
但目标受众（境内）打不开，因此不能作为生产环境。

## 可行路径与前置条件

1. **阿里云 ESA Pages**（原定目标）：需要登录。实测登录表单在 `passport.aliyun.com` 的跨域
   iframe 中，且与本机 vault 凭据项（`account.aliyun.com`）不同源，无法自动填充；
   即便同源，阿里云登录通常还要短信验证码 → 需用户提供。
2. **Cloudflare 自定义域**：把 workers.dev 换成自有域名（`shopforyou.online` 已托管腾讯云 DNS，
   可加 CNAME），可绕开 workers.dev 被污染的问题 —— 但需要 Cloudflare 账号（无凭据）。

## 结论

产物已就绪且服务端部署验证通过；**唯一缺口是"境内可达的托管入口"需要一个我能用的账号**。
