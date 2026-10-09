# TabakoStore 部署教程（无需编程，照着点即可）

你的网站代码已经全部写好（`tabakostore` 文件夹）。下面是把它变成线上网站的完整步骤。

## 需要注册的账号（共 5 个，都免费）

| 账号 | 用途 | 网址 |
|---|---|---|
| GitHub | 存放代码 | github.com |
| Supabase | 数据库 + 用户登录 | supabase.com |
| Vercel | 网站托管（自动上线） | vercel.com |
| Tidio | 客服聊天框 | tidio.com |

（Cloudflare 是可选的加速服务，免费域名一般用不了，见第 4 步说明）

---

## 第 1 步：Supabase 数据库（约 5 分钟）

1. 打开 supabase.com 注册/登录
2. 点 **New Project** → 名称填 `tabakostore` → 设置一个**数据库密码**（记下来）→ 点 Create
3. 等待 1~2 分钟项目创建完成
4. 左侧菜单点 **SQL Editor** → 点 **New query**
5. 打开本文件夹 `supabase/migrations/001_init.sql`，**全选复制**全部内容，粘贴到输入框 → 点 **Run**
6. 左侧点 **Project Settings**（齿轮图标）→ **API**，复制这三项，稍后要用：
   - **Project URL**（即 NEXT_PUBLIC_SUPABASE_URL）
   - **anon / public key**（即 NEXT_PUBLIC_SUPABASE_ANON_KEY）
   - **service_role / secret key**（即 SUPABASE_SERVICE_ROLE_KEY，⚠️ 这个绝对不能给别人）
7. 让用户注册后不用验证邮件就能登录：左侧 **Authentication** → **Settings** → 找到 **Enable email confirmations** → 关闭 → Save

## 第 2 步：上传代码到 GitHub（约 3 分钟）

1. 打开 github.com 注册/登录
2. 点右上角 **+** → **New repository** → 名称填 `tabakostore` → 选 **Public** → 点 **Create repository**
3. 在打开的页面找到 **"adding an existing project"** 下的 **upload an existing file** 链接并点击
4. 打开电脑上的 `tabakostore` 文件夹，**全选里面所有文件和文件夹**（不要包含 node_modules，目前也没有），**拖进**网页的虚线框里
5. 拉到最上面点 **Commit changes**

## 第 3 步：部署到 Vercel（约 5 分钟）

1. 打开 vercel.com，点 **Continue with GitHub** 用 GitHub 账号登录（授权时选 Allow）
2. 点 **Add New...** → **Project**
3. 找到 `tabakostore` 仓库，点 **Import**
4. 在 **Environment Variables** 里逐个添加（Key 按下面的名字，Value 填第 1 步复制的值）：

| Key | Value |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | 第 1 步的 Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 第 1 步的 anon key |
| SUPABASE_SERVICE_ROLE_KEY | 第 1 步的 service_role key |
| ADMIN_PASSWORD | 你自己设一个管理密码（记住它！登录后台用） |
| TIDIO_SCRIPT | 先留空，第 5 步再填 |

5. 点 **Deploy**，等 2~3 分钟，得到 `https://tabakostore.vercel.app`

## 第 4 步：绑定你的域名 tabako.ccwu.cc

你的域名是免费域名：通常**只能添加 DNS 记录、不能修改 nameservers**，所以跳过 Cloudflare，直接解析到 Vercel：

1. Vercel → 项目 → **Settings** → **Domains** → 输入 `tabako.ccwu.cc` → **Add**
2. 页面会显示需要的 DNS 记录（通常是一条 **CNAME** 指向 `cname.vercel-dns.com`，少数情况是一条 A 记录）
3. 登录你的免费域名服务商后台 → 找到 **DNS / 域名解析** 设置 → 添加 Vercel 给出的记录
4. 回 Vercel 点 **Check / Refresh**，等状态变成 **Active**（几分钟到几小时）

完成后网站就是 `https://tabako.ccwu.cc`，自动有 HTTPS。

> 补充：如果你的服务商恰好支持修改 nameservers，也可以注册 Cloudflare 走加速路线（免费），但对免费域名通常不适用。网站不挂 Cloudflare 也能正常运行，只是国内访问可能稍慢（你的客户在国外，不受影响）。

## 第 5 步：接入客服聊天 Tidio（约 3 分钟）

1. 打开 tidio.com 免费注册，按向导创建聊天（选网站插件）
2. 进入 **Install** / **Channels** → 复制那段 **JavaScript 代码**（以 `<script>` 开头的一整段）
3. Vercel → 项目 → **Settings** → **Environment Variables** → 添加：
   - Key：`TIDIO_SCRIPT`，Value：粘贴刚才复制的代码
4. 回到项目 **Overview** → 点 **Redeploy**（要勾选 "Use existing Environment Variables"）

之后网站右下角会出现客服聊天窗口，你手机装 Tidio App 就能随时随地回复。

## 第 6 步：测试（重要！）

1. 打开 `https://tabako.ccwu.cc`，应看到 3 个示例商品
2. 点 **Sign up** 注册一个测试账号
3. 把商品加入购物车 → 结算 → 填测试地址 → 提交订单
4. 应该弹出"联系客服支付"窗口，记下订单号
5. 打开 `https://tabako.ccwu.cc/admin`，用你设的 **ADMIN_PASSWORD** 登录
6. 在"订单管理"看到这个订单，把状态改成"已支付"
7. 在"商品管理"试着改价格、库存、上架新商品（可传图片）

全部通过 = 网站正式上线 🎉

---

## 日常使用

- **上架/改商品**：`你的域名/admin` → 商品管理
- **看订单/改状态**：`你的域名/admin` → 订单管理
- **客服聊天**：网站右下角 Tidio 窗口（手机装 Tidio App）
- **语言切换**：导航栏右侧有 EN / 中文 / 日本語 按钮，用户可自由切换（管理后台固定中文）

## 后续（需要时找我）

- 办好营业执照后接 **PayPal**（信用卡直付）
- 接 **Resend** 邮件：新订单自动发邮件到你邮箱
- 换成英文/中文前台，或加更多支付方式

## 注意事项

- `SUPABASE_SERVICE_ROLE_KEY` 和 `ADMIN_PASSWORD` 绝对不能泄露
- 在国内打开管理后台可能稍慢，属正常现象（服务器在国外）
- 想改网站外观/功能时随时告诉我，我直接改代码，你只需重新上传到 GitHub
