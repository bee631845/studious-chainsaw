## 阿里云日志服务数据源 

## 编译

```
yarn build
```

## 安装 

依赖 `Grafana 8.0` 及以上版本 , `Grafana 8.0` 以下请使用 [1.0版本](https://github.com/aliyun/aliyun-log-grafana-datasource-plugin/releases/tag/1.0) 

下载本插件到grafana插件目录下 , 然后重启grafana

在 mac 插件目录是 /usr/local/var/lib/grafana/plugins

重启命令为 

```
brew services restart grafana
```

## 添加数据源

在数据源管理面板, 添加 `LogService` 数据源

在 settings 面板, 设置 Url 为您日志服务 project 的 endpoint ( endpoint 在 project 的概览页可以看到). 

例如你的 project 在 qingdao region, Url 可以填 `http://cn-qingdao.log.aliyuncs.com`

Access 设置为 `Server(Default)`
 

设置 Project 和 logstore

设置 AccessId 和 AccessKeySecret , 最好配置为子账号的AK 

为保证数据安全 , AK保存后清空 , 且不会回显


## 添加仪表盘


添加一个面板, 在 datasource 选项, 选择刚创建的日志服务数据源.

在 query 输入查询语句, 查询语法与日志服务控制台相同.

```
*|select count(1) as c,count(1)/2 as c1, __time__- __time__%60  as t  group by t limit 10000
```

X轴设置为`t` (**秒级时间戳**)

Y轴设置为`c,c1` (**多列用逗号分隔**)

保存仪表盘

## 使用

### 设置变量

在 dashboard 面板右上角点击 Dashboard settings, 选择 Variables

引用变量 `$VariableName`

变量查询语句中有双引号，需要转义成```\"```

Query 类型变量

如果开启 Multi-value 可以设置多选查询 

**注:多选实现为用OR连接，如果语句有多个变量AND，变量两边需要加括号($VariableName)，否则OR和AND会混一起**

如果 Name 和 Label 一致 可以按字段索引查询

### 设置Logs

每页最多展示100条

### 设置单值图

选择Stat

X轴 设置为`stat`

Y轴 设置为查询结果的列名

### 设置流图

X轴 设置为时间列

Y轴 设置为 `col1#:#col2` 这种格式, 其中 col1 为 聚合列, col2 为其他列

Query 设置样例为  
```
* | select to_unixtime(time) as time,status,count from (select time_series(__time__, '1m', '%Y-%m-%d %H:%i', '0')  as time,status,count(*) as count from log group by status,time order by time limit 10000)
```

![](https://raw.githubusercontent.com/aliyun/aliyun-log-grafana-datasource-plugin/master/img/demo1.png)

### 设置饼图

X轴 设置为`pie`

Y轴 设置为类别和数字列 (样例为`method,pv`) 

Query 设置样例为  
```
$hostname | select count(1) as pv ,method group by method
```

![](https://raw.githubusercontent.com/aliyun/aliyun-log-grafana-datasource-plugin/master/img/demo2.png)

### 设置表格

X轴 设置为`table` 或空

Y轴 设置为列

### 设置柱形图

选择 `Bar charts`

X轴 设置为`bar`

Y轴 第一个值为分组列，后面的值为数字列

![](https://test-lichao.oss-cn-hangzhou.aliyuncs.com/pic/bar.jpg)

### 设置地图

X轴 设置为`map`

Y轴 设置为 `country,geo,pv`

Query 设置样例为  
```
* | select   count(1) as pv ,geohash(ip_to_geo(arbitrary(remote_addr))) as geo,ip_to_country(remote_addr) as country  from log group by country having geo <>'' limit 1000
```

Location Data 设置为 `geohash`

Location Name Field 设置为 `country`

geo_point/geohash Field 设置为 `geo`

Metric Field 设置为 `pv`

查询语句:

![](http://logdemo.oss-cn-beijing.aliyuncs.com/worldmap1.png)

参数设置:

![](http://logdemo.oss-cn-beijing.aliyuncs.com/worldmap2.png)

### 设置Trace

[**Trace数据格式**](https://help.aliyun.com/document_detail/208891.html)

在 Explore 面板

X轴 设置为`trace`

![](https://test-lichao.oss-cn-hangzhou.aliyuncs.com/pic/trace.jpg)

### 设置告警

#### 通知方式

在告警通知方式面板, 选择 New channel 添加

**注意** :选择dingding告警, 在钉钉机器人的安全设置里选自定义关键词, 添加 `Alerting`

#### 添加告警

**注意** :只支持dashboard告警, 不支持插件告警

样例如下:

![](https://raw.githubusercontent.com/aliyun/aliyun-log-grafana-datasource-plugin/master/img/demo3.png)

添加告警面板:

![](https://raw.githubusercontent.com/aliyun/aliyun-log-grafana-datasource-plugin/master/img/demo4.png)

- 其中图表上红线代表设置的阈值, 点击右侧可以上下拖动
- Evaluate every `1m` for `5m`, 代表计算每分钟的结果, 连续五分钟超过阈值告警
- 设置for后, 如果超过阈值状态由Ok转为Pending, 不会触发告警, 连续超过阈值一段时候后发送告警, 状态由Pending转为Alerting, 告警只会通知一次
- WHEN `avg ()` OF `query (B, 5m, now)` IS ABOVE `89`, 代表线条B最近五分钟的均值超过89告警
- 在Notifications下添加通知方式及通知信息


## 常见问题


### 错误诊断

查看grafana 日志

在 mac 日志目录是 /usr/local/var/log/grafana

在 linux 日志目录是 /var/log/grafana

- aliyun-log-plugin_linux_amd64: permission denied , 需要授予插件目录下dist/aliyun-log-plugin_linux_amd64执行权限


### grafana 7.0

参考 [Backend plugins: Unsigned external plugins should not be loaded by default #24027](https://github.com/grafana/grafana/issues/24027)

修改grafana配置文件

在mac上一般为 `/usr/local/etc/grafana/grafana.ini`

在linux上一般为 `/etc/grafana/grafana.ini`

在`[plugins]`标签下设置参数

`allow_loading_unsigned_plugins = aliyun-log-service-datasource`


### 添加source变量

`* | select distinct __source__ as source`

__source__字段默认会被过滤掉，需要用as起别名

### provision 配置

```yml
apiVersion: 1

datasources:
  - name: LogService
    type: aliyun-log-service-datasource
    url: http://cn-hangzhou.log.aliyuncs.com
    jsonData:
      project: xxxxx
      logstore: xxxxx
    secureJsonData:
      accessKeyId: xxxx
      accessKeySecret: xxxxx
    editable: true
```


### 钉钉群

<img src="https://testossconnector.oss-cn-hangzhou.aliyuncs.com/dingdinggroup.png" width = "320" height = "400" align=center />




