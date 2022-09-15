// ==UserScript==
// @name         哔哩哔哩用户成分鉴定
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  新版B站评论自动标注用户成分。
// @author       Awen
// @match        https://www.bilibili.com/video/*
// @icon         https://img1.imgtp.com/2022/08/30/1LkMlj7a.png
// @grant        GM_xmlhttpRequest
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";
  console.log("哔哩哔哩用户成分鉴定启动");
  console.log(
    "源码仓库：https://github.com/YlAwen/Bilibili-UserIdentification"
  );
  let keywordData = [
    {
      tag: "原神",
      keywords: [
        "原神",
        "巴巴托斯",
        "迭卡拉庇安",
        "安德留斯",
        "玻瑞亚斯",
        "温妮莎",
        "西风骑士团",
        "特瓦林",
        "法尔伽",
        "凯亚",
        "阿贝多",
        "优菈",
        "凯亚",
        "安柏",
        "可莉",
        "温妮莎",
        "莱艮芬德",
        "艾伦德林",
        "鲁斯坦",
        "芭芭拉",
        "迪卢克",
        "摩拉克斯",
        "赫乌莉亚",
        "魈",
        "北斗",
        "凝光",
        "香菱",
        "行秋",
        "重云",
        "刻晴",
        "七七",
        "钟离",
        "辛焱",
        "甘雨",
        "胡桃",
        "烟绯",
        "云堇",
        "申鹤",
        "夜兰",
        "纳西妲",
        "提纳里",
        "柯莱",
        "多莉",
      ],
    },
    {
      tag: "影之诗",
      keywords: [
        "影之诗",
        "暗影诗章",
        "zsb",
        "傻纸比",
        "傻之逼",
        "shadowverse",
        "星野饼美",
      ],
    },
    {
      tag: "喜灰",
      keywords: ["喜羊羊与灰太狼"],
    },
    {
      tag: "马迷",
      keywords: [
        "小马宝莉",
        "暮光闪闪",
        "紫悦",
        "苹果嘉儿",
        "云宝黛茜",
        "云宝",
        "瑞瑞",
        "珍奇",
        "小蝶",
        "柔柔",
        "萍琪派",
        "苹果杰克",
        "碧琪",
        "斯派克",
        "穗龙",
        "塞拉斯蒂亚",
        "宇宙公主",
        "小苹花",
        "苹果丽丽",
        "甜贝儿",
        "飞板璐",
        "醒目露露",
        "露娜公主",
        "韵律公主",
        "银甲闪闪",
        "凝心雪儿",
        "蓝血王子",
        "邪茧女王",
        "黑晶王",
        "提雷克",
        "星光熠熠",
        "冥影",
        "和煦光流",
        "格罗迦",
        "白胡子星璇",
        "余晖烁烁",
      ],
    },
    {
      tag: "IKUN",
      keywords: ["蔡徐坤", "ikun", "只因你太美"],
    },
  ];
  const _biliApi =
    "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?&host_mid=";
  const _dataApi =
    "http://my-json-server.typicode.com/YlAwen/Bilibili-UserIdentification/data";
  const _isNew = document.getElementsByClassName("item goback").length !== 0;
  const _tag = {
    tag: "span",
    style: {
      display: "inline-block",
      "font-size": "14px",
      background: "linear-gradient(to bottom right,#8A2BE2,#DC143C)",
      padding: " 0px 4px",
      "border-radius": "4px",
      color: "#fff",
      "margin-left": "6px",
    },
  };
  // 封装请求
  const _request = (url, fn) => {
    GM_xmlhttpRequest({
      method: "get",
      url,
      data: "",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Safari/537.36 Edg/104.0.1293.70",
      },
      onload: (res) => {
        if (res.status === 200) {
          fn(JSON.parse(res.response));
        }
      },
    });
  };
  // 获取关键字
  // const _getKeywordData = () => {
  //   _request(_dataApi, (data) => {
  //     keywordData = data;
  //   });
  // };
  // _getKeywordData();
  // 获取用户ID
  const _getUserID = (ele) => {
    return _isNew
      ? ele.dataset.userId
      : ele.children[0].href.replace(/[^\d]/g, "");
  };
  // 获取DOM元素
  const _getReviews = (className) => {
    return document.getElementsByClassName(className);
  };
  // 判断是否有内容
  const _hasArrContent = (arr) => {
    return arr.length !== 0;
  };
  // 渲染样式
  const _renderStyle = (style) => {
    let str = "";
    for (const key in style) {
      str = str + key + ":" + style[key] + ";";
    }
    return "style='" + str + "'";
  };
  // 渲染成分
  const _renderTag = (ele, str) => {
    // 没有关键词数据重新获取关键词
    // if (!_hasArrContent(keywordData)) {
    //   _getKeywordData();
    // } else {
    let tagList = [];
    // 筛选加入tag组
    keywordData.forEach((item) => {
      item.keywords.forEach((keyword) => {
        if (str.includes(keyword)) {
          return tagList.push(
            `<${_tag.tag} class="Awen-tag" ${_renderStyle(_tag.style)}>${
              item.tag
            }</${_tag.tag}>`
          );
        }
      });
    });
    if (tagList.length === 0) {
      // 无内容增加标记
      return (ele.innerHTML += "<span class='Awen-tag'></span>");
    } else {
      // 有内容渲染标签
      new Set(tagList).forEach((item) => {
        return (ele.innerHTML += item);
      });
    }
    // }
  };
  // 循环监听
  const _timer = setInterval(() => {
    // 新版哔哩哔哩
    if (_isNew) {
      // 获取所有评论
      const reviews = [
        ..._getReviews("user-name"),
        ..._getReviews("sub-user-name"),
      ];
      // 有评论
      if (_hasArrContent(reviews)) {
        reviews.forEach((item) => {
          let hasTag = false;
          item.childNodes.forEach((ele) => {
            if (ele.className === "Awen-tag") {
              return (hasTag = true);
            }
          });
          // 没有tag渲染tag
          if (!hasTag) {
            const url = _biliApi + _getUserID(item);
            _request(url, (res) => {
              _renderTag(item, JSON.stringify(res));
            });
          }
        });
      }
    }
  }, 2000);
})();
