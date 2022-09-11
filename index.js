// ==UserScript==
// @name         哔哩哔哩用户成分鉴定
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  B站评论自动标注用户成分。
// @author       Awen
// @match        https://www.bilibili.com/video/*
// @icon         https://img1.imgtp.com/2022/08/30/1LkMlj7a.png
// @grant        GM_xmlhttpRequest
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";
  let reviewOldList = [];
  let keywordData = [];
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
  const _getKeywordData = () => {
    _request(_dataApi, (data) => {
      keywordData = data;
    });
  };
  _getKeywordData();
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
    if (!_hasArrContent(keywordData)) {
      _getKeywordData();
      reviewOldList = [];
    } else {
      keywordData.forEach((item) => {
        item.keywords.forEach((keyword) => {
          if (str.includes(keyword)) {
            return (ele.innerHTML += `<${_tag.tag} ${_renderStyle(
              _tag.style
            )}>${item.tag}</${_tag.tag}>`);
          }
        });
      });
    }
  };
  // 循环监听
  const _timer = setInterval(() => {
    if (_isNew) {
      const reviews = [
        ..._getReviews("user-name"),
        ..._getReviews("sub-user-name"),
      ];
      if (_hasArrContent(reviews)) {
        reviews
          .filter((item) => !reviewOldList.includes(item))
          .forEach((item) => {
            const url = _biliApi + _getUserID(item);
            _request(url, (res) => {
              _renderTag(item, JSON.stringify(res));
            });
          });
        reviewOldList = [...reviewOldList, ...reviews];
      }
    }
  }, 1500);
})();
