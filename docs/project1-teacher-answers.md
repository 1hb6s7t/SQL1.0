# 项目一教师版标准答案

## 文档说明
本答案文档对应 **项目一：智慧农业传感器监测系统单表查询实战项目**，用于教师备课、课堂讲解、作业批改与演示参考。

---

## 题目1：基础列选择查询

### 标准答案
```sql
SELECT sensor_id, monitor_type, monitor_value
FROM sensor_monitor;
```

### 讲解要点
- 核心知识点：选择指定列
- 易错点：写成 `SELECT *`（题目要求选择特定列）

---

## 题目2：去重查询（DISTINCT）

### 标准答案
```sql
SELECT DISTINCT sensor_id
FROM sensor_monitor;
```

### 讲解要点
- 核心知识点：DISTINCT 去重
- 易错点：漏写 DISTINCT，或对多列去重导致结果不同

---

## 题目3：比较条件查询

### 标准答案
```sql
SELECT *
FROM sensor_monitor
WHERE monitor_type = '温度' AND monitor_value > 30;
```

### 讲解要点
- 核心知识点：WHERE + 比较运算符 + AND
- 易错点：漏写 `monitor_type = '温度'`，只筛选了数值

---

## 题目4：范围查询（BETWEEN）

### 标准答案
```sql
SELECT sensor_id, monitor_value, location
FROM sensor_monitor
WHERE monitor_type = '土壤含水量'
  AND monitor_value BETWEEN 20 AND 25
  AND status = '正常';
```

### 讲解要点
- 核心知识点：BETWEEN...AND...
- 易错点：
  - 漏写 `status = '正常'`
  - 把 BETWEEN 写成 `>= 20 AND <= 25`（可接受但不够规范）

---

## 题目5：模糊查询（LIKE）

### 标准答案
```sql
SELECT *
FROM sensor_monitor
WHERE sensor_id LIKE 'S20250%'
  AND location LIKE '%农田%';
```

### 讲解要点
- 核心知识点：LIKE + 通配符 %
- 易错点：
  - `%` 位置搞错
  - 把 LIKE 写成 `=`

---

## 题目6：空值查询（IS NULL）

### 标准答案
```sql
SELECT sensor_id, monitor_time, location
FROM sensor_monitor
WHERE status IS NULL;
```

### 讲解要点
- 核心知识点：IS NULL 谓词
- 易错点：写成 `status = NULL`（这在 SQL 中不会返回结果）

---

## 题目7：排序查询（ORDER BY）

### 标准答案
```sql
SELECT *
FROM sensor_monitor
WHERE location = '西区大棚'
ORDER BY monitor_time DESC;
```

### 讲解要点
- 核心知识点：ORDER BY + DESC 降序
- 易错点：
  - 漏写 DESC（默认是 ASC 升序）
  - 漏写 WHERE 条件

---

## 题目8：聚合函数查询（AVG / MAX / COUNT）

### 标准答案
```sql
SELECT AVG(monitor_value) AS avg_temp,
       MAX(monitor_value) AS max_temp,
       COUNT(*) AS record_count
FROM sensor_monitor
WHERE location = '东区农田'
  AND monitor_type = '温度';
```

### 讲解要点
- 核心知识点：AVG()、MAX()、COUNT(*) 聚合函数
- 易错点：
  - 漏写别名 AS
  - 漏写 WHERE 过滤条件
  - 把 COUNT 写成 COUNT(monitor_value)（遇到 NULL 时结果不同）

---

## 题目9：多重条件组合查询

### 标准答案
```sql
SELECT *
FROM sensor_monitor
WHERE monitor_time >= '2025-11-02 00:00:00'
  AND monitor_time < '2025-11-03 00:00:00'
  AND (location = '南区果园' OR location = '北区菜地')
  AND status = '正常';
```

### 讲解要点
- 核心知识点：多条件组合（AND + OR + 括号优先级）
- 易错点：
  - **最常见错误**：OR 没加括号，导致逻辑错误
  - 日期范围写法不对
  - 可用 `location IN ('南区果园', '北区菜地')` 替代 OR（等价写法，可接受）

---

## 教学建议

### 推荐授课顺序
1. 题目1-2：SELECT 基础 + DISTINCT
2. 题目3-6：WHERE 条件系列（比较/范围/模糊/空值）
3. 题目7：ORDER BY 排序
4. 题目8：聚合函数
5. 题目9：多重条件组合（综合运用）

### 批改建议
- 结果等价的 SQL 可判为正确
- `BETWEEN` 与 `>= AND <=` 等价，均可接受
- `IN(...)` 与 `OR` 等价，均可接受
- 别名命名不同但结果正确，可接受

---

## 附：项目一标准答案汇总

```sql
-- 1
SELECT sensor_id, monitor_type, monitor_value FROM sensor_monitor;

-- 2
SELECT DISTINCT sensor_id FROM sensor_monitor;

-- 3
SELECT * FROM sensor_monitor WHERE monitor_type = '温度' AND monitor_value > 30;

-- 4
SELECT sensor_id, monitor_value, location FROM sensor_monitor
WHERE monitor_type = '土壤含水量' AND monitor_value BETWEEN 20 AND 25 AND status = '正常';

-- 5
SELECT * FROM sensor_monitor WHERE sensor_id LIKE 'S20250%' AND location LIKE '%农田%';

-- 6
SELECT sensor_id, monitor_time, location FROM sensor_monitor WHERE status IS NULL;

-- 7
SELECT * FROM sensor_monitor WHERE location = '西区大棚' ORDER BY monitor_time DESC;

-- 8
SELECT AVG(monitor_value) AS avg_temp, MAX(monitor_value) AS max_temp, COUNT(*) AS record_count
FROM sensor_monitor WHERE location = '东区农田' AND monitor_type = '温度';

-- 9
SELECT * FROM sensor_monitor
WHERE monitor_time >= '2025-11-02 00:00:00' AND monitor_time < '2025-11-03 00:00:00'
AND (location = '南区果园' OR location = '北区菜地') AND status = '正常';
```
