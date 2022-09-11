// ==UserScript==
// @name         哔哩哔哩用户成分鉴定
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  B站评论自动标注成分。
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
  const _api =
    "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?&host_mid=";
  const _isNew = document.getElementsByClassName("item goback").length !== 0;
  const _tag = {
    tag: "span",
    content: "原友",
    style: {
      display: "inline-block",
      "font-size": "14px",
      background: "linear-gradient(to bottom right,#8A2BE2,#DC143C)",
      padding: " 1px 4px",
      "border-radius": "6px",
      color: "#fff",
      "margin-left": "4px",
    },
  };
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
  const _getUserID = (ele) => {
    return _isNew
      ? ele.dataset.userId
      : ele.children[0].href.replace(/[^\d]/g, "");
  };
  const _getReviews = (className) => {
    return document.getElementsByClassName(className);
  };
  const _hasArrContent = (arr) => {
    return arr.length !== 0;
  };

  const _renderStyle = (style) => {
    let str = "";
    for (const key in style) {
      str = str + key + ":" + style[key] + ";";
    }
    return "style='" + str + "'";
  };
  const _renderTag = (key) => {
    return `<${_tag.tag} ${_renderStyle(_tag.style)}>${_tag.content}</${
      _tag.tag
    }>`;
  };

  const _timer = setInterval(() => {
    if (_isNew) {
      const reviews = [
        ..._getReviews("user-name"),
        ..._getReviews("sub-user-name"),
      ];
      if (_hasArrContent(reviews)) {
        reviews
          .filter((item) => !reviewOldList.includes(item))
          .forEach((item, index) => {
            const url = _api + _getUserID(item);
            _request(url, (res) => {
              item.innerHTML += _renderTag();
            });
          });
        reviewOldList = [...reviewOldList, ...reviews];
      }
    }
  }, 1500);
})();
