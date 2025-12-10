# TuneHub API 接口文档

TuneHub 是一个统一的音乐信息解析服务。它打破了不同音乐平台之间的壁垒，提供了一套标准化的 API 接口。

## 概述

- **Base URL**: https://music-dl.sayqz.com
- **Version**: 1.0.0

## 支持的平台

| 平台标识 (source) | 平台名称 | 状态 |
|--------------------|----------|------|
| netease | 网易云音乐 | ✅ 已启用 |
| kuwo | 酷我音乐 | ✅ 已启用 |
| qq | QQ音乐 | ✅ 已启用 |

## API 接口

### 1. 获取歌曲基本信息

**GET** `/api/?source={source}&id={id}&type=info`

获取歌曲的名称、歌手、专辑等基本元数据信息。

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "name": "歌曲名称",
    "artist": "歌手名称",
    "album": "专辑名称",
    "url": "https://music-dl.sayqz.com/api/?source=netease&id=123456&type=url",
    "pic": "https://music-dl.sayqz.com/api/?source=netease&id=123456&type=pic",
    "lrc": "https://music-dl.sayqz.com/api/?source=netease&id=123456&type=lrc"
  },
  "timestamp": "2025-11-23T12:00:00.000+08:00"
}
```

### 2. 获取音乐文件链接

**GET** `/api/?source={source}&id={id}&type=url&br=[320k]`

获取音乐文件的下载链接。支持不同音质。

#### 音质参数 (br) 对照表

| 值 | 说明 | 比特率 |
|----|------|--------|
| 128k | 标准音质 | 128kbps |
| 320k | 高品质 | 320kbps |
| flac | 无损音质 | ~1000kbps |
| flac24bit | Hi-Res 音质 | ~1400kbps |

**响应说明：**

成功时返回 302 Redirect 到实际的音乐文件 URL。

自动换源：当请求的原平台失败时，系统会自动尝试其他平台。此时响应头会包含 `X-Source-Switch` 字段（例如：netease -> kuwo）。

### 3. 获取专辑封面

**GET** `/api/?source={source}&id={id}&type=pic`

获取歌曲的专辑封面图片。

**响应：** 302 Redirect to image URL.

### 4. 获取歌词

**GET** `/api/?source={source}&id={id}&type=lrc`

获取歌曲的 LRC 格式歌词。

**响应示例 (Text/Plain)：**

```lyric
[00:00.00]歌词第一行
[00:05.50]歌词第二行
[00:10.20]歌词第三行
```

### 5. 搜索歌曲

**GET** `/api/?source={source}&type=search&keyword={keyword}&limit=[20]`

在指定平台搜索歌曲。

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "keyword": "周杰伦",
    "total": 10,
    "results": [
      {
        "id": "123456",
        "name": "歌曲名称",
        "artist": "周杰伦",
        "album": "专辑名称",
        "url": "https://music-dl.sayqz.com/api/?...",
        "platform": "netease"
      }
    ]
  }
}
```

### 6. 聚合搜索

**GET** `/api/?type=aggregateSearch&keyword={keyword}`

跨平台聚合搜索歌曲。

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "keyword": "周杰伦",
    "results": [
      {
        "id": "123456",
        "name": "歌曲名称",
        "artist": "周杰伦",
        "platform": "netease"
      },
      {
        "id": "789012",
        "name": "另一首歌",
        "artist": "周杰伦",
        "platform": "kuwo"
      }
    ]
  }
}
```

## 歌单与排行榜

### 7. 获取歌单详情

**GET** `/api/?source={source}&id={id}&type=playlist`

获取歌单的详细信息和歌曲列表。

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "123456",
        "name": "歌曲名称",
        "types": ["flac", "320k", "128k"]
      }
    ],
    "info": {
      "name": "歌单名称",
      "author": "创建者"
    }
  }
}
```

### 8. 获取排行榜列表

**GET** `/api/?source={source}&type=toplists`

获取指定平台的排行榜列表。

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "19723756",
        "name": "飙升榜",
        "updateFrequency": "每天更新"
      }
    ]
  }
}
```

### 9. 获取排行榜歌曲

**GET** `/api/?source={source}&id={id}&type=toplist`

获取指定排行榜的歌曲列表。

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "123456",
        "name": "歌曲名称"
      }
    ],
    "source": "netease"
  }
}
```
