# 项目二教师版标准答案

## 文档说明
本答案文档对应 **项目二：智能制造设备管理系统视图应用实战项目**，用于教师备课、课堂讲解、作业批改与演示参考。

> 说明：
> - 题目环境已支持 `CREATE VIEW ... AS SELECT ...`
> - 为便于重复调试，示例统一使用 `CREATE OR REPLACE VIEW`
> - 若学生写出与标准答案 **结果等价** 的 SQL，也可酌情判对

---

## 题目1：创建 W01 正常设备视图

### 标准答案
```sql
CREATE OR REPLACE VIEW W01_Normal_Equip_View AS
SELECT equip_id, equip_name, purchase_year
FROM equipment
WHERE workshop = 'W01' AND status = '正常';
```

### 讲解要点
- 训练目标：掌握最基础的行列子集视图创建
- 核心知识点：
  - `CREATE OR REPLACE VIEW`
  - 选择指定列
  - `WHERE` 条件过滤
- 易错点：
  - 把 `W01` 写成 `WO1`
  - 漏写 `status = '正常'`
  - 列名 `equip_name` / `purchase_year` 拼错

---

## 题目2：查询 W01 正常设备视图

### 标准答案
```sql
SELECT *
FROM W01_Normal_Equip_View;
```

### 讲解要点
- 训练目标：理解“创建视图后，可像表一样查询”
- 核心知识点：
  - 视图查询
  - `SELECT * FROM 视图名`
- 易错点：
  - 直接去查原表而不是查视图
  - 视图名拼写错误

---

## 题目3：创建正常设备状态视图

### 标准答案
```sql
CREATE OR REPLACE VIEW Normal_Equipment_View AS
SELECT equip_id, equip_name, status
FROM equipment
WHERE status = '正常';
```

### 讲解要点
- 训练目标：进一步熟悉条件视图定义
- 核心知识点：
  - 条件筛选视图
  - 视图在权限控制、统一访问口径中的作用
- 易错点：
  - 多查或少查字段
  - 把条件写成 `workshop = 'W01'`

---

## 题目4：创建设备使用年限视图

### 标准答案
```sql
CREATE OR REPLACE VIEW Equip_Use_Years_View AS
SELECT equip_id, equip_name, purchase_year, 2025 - purchase_year AS use_years
FROM equipment;
```

### 讲解要点
- 训练目标：掌握带表达式字段的视图
- 核心知识点：
  - 表达式列
  - 别名 `AS use_years`
- 易错点：
  - 漏写别名
  - 把表达式方向写反

---

## 题目5：创建设备累计运行时长视图

### 标准答案
```sql
CREATE OR REPLACE VIEW Equip_Total_Run_View AS
SELECT equip_id, SUM(run_hours) AS total_run_hours
FROM equip_run_log
GROUP BY equip_id;
```

### 讲解要点
- 训练目标：掌握分组聚合视图
- 核心知识点：
  - `SUM()`
  - `GROUP BY`
  - 聚合结果命名
- 易错点：
  - 忘记 `GROUP BY equip_id`
  - 别名未命名为 `total_run_hours`

---

## 题目6：筛选高运行时长设备视图结果

### 标准答案（子查询写法）
```sql
SELECT equip_id, total_run_hours
FROM (
  SELECT equip_id, SUM(run_hours) AS total_run_hours
  FROM equip_run_log
  GROUP BY equip_id
) t
WHERE total_run_hours >= 30;
```

### 等价答案（基于第5题视图）
```sql
SELECT equip_id, total_run_hours
FROM Equip_Total_Run_View
WHERE total_run_hours >= 30;
```

### 讲解要点
- 训练目标：掌握基于聚合结果的二次筛选
- 核心知识点：
  - 子查询
  - 视图结果再查询
  - 聚合结果过滤
- 易错点：
  - 在 `WHERE` 中直接写 `SUM(run_hours) >= 30`
  - 子查询未命名别名 `t`

---

## 题目7：统计各车间正常设备数量

### 标准答案
```sql
SELECT workshop, COUNT(*) AS normal_equip_count
FROM equipment
WHERE status = '正常'
GROUP BY workshop;
```

### 讲解要点
- 训练目标：掌握分组统计
- 核心知识点：
  - `COUNT(*)`
  - 条件过滤后分组
- 易错点：
  - 忘记 `GROUP BY workshop`
  - 把 `COUNT(*)` 写成普通字段查询

---

## 题目8：查询高产设备运行概况

### 标准答案
```sql
SELECT equip_id, SUM(production_num) AS total_production_num
FROM equip_run_log
GROUP BY equip_id
HAVING SUM(production_num) >= 800;
```

### 讲解要点
- 训练目标：掌握聚合后筛选
- 核心知识点：
  - `HAVING`
  - `SUM(production_num)`
  - 分组后的条件筛选
- 易错点：
  - 把 `HAVING` 写成 `WHERE`
  - 忘记 `GROUP BY equip_id`

---

## 教学建议

### 一、推荐授课顺序
1. 先讲视图概念与作用
2. 再做题目1、2，建立“创建 → 查询”的基本认识
3. 题目3、4强化条件视图与表达式视图
4. 题目5、6串起“聚合视图 → 再筛选”
5. 题目7、8补充分组统计与 `HAVING`

### 二、建议强调的核心区别
- `WHERE`：分组前过滤
- `HAVING`：分组后过滤
- 视图：保存查询逻辑，不直接保存数据
- 视图可简化复杂查询，提高复用性

### 三、批改建议
- 对于结果等价 SQL，可判为正确
- 对于项目二前几题，若学生使用 `CREATE VIEW` 或 `CREATE OR REPLACE VIEW`，均可接受
- 若题目要求“基于视图查询”，但学生直接查原表，可酌情扣分

---

## 附：项目二标准答案汇总

```sql
-- 1
CREATE OR REPLACE VIEW W01_Normal_Equip_View AS
SELECT equip_id, equip_name, purchase_year
FROM equipment
WHERE workshop = 'W01' AND status = '正常';

-- 2
SELECT *
FROM W01_Normal_Equip_View;

-- 3
CREATE OR REPLACE VIEW Normal_Equipment_View AS
SELECT equip_id, equip_name, status
FROM equipment
WHERE status = '正常';

-- 4
CREATE OR REPLACE VIEW Equip_Use_Years_View AS
SELECT equip_id, equip_name, purchase_year, 2025 - purchase_year AS use_years
FROM equipment;

-- 5
CREATE OR REPLACE VIEW Equip_Total_Run_View AS
SELECT equip_id, SUM(run_hours) AS total_run_hours
FROM equip_run_log
GROUP BY equip_id;

-- 6
SELECT equip_id, total_run_hours
FROM Equip_Total_Run_View
WHERE total_run_hours >= 30;

-- 7
SELECT workshop, COUNT(*) AS normal_equip_count
FROM equipment
WHERE status = '正常'
GROUP BY workshop;

-- 8
SELECT equip_id, SUM(production_num) AS total_production_num
FROM equip_run_log
GROUP BY equip_id
HAVING SUM(production_num) >= 800;
```
