// 服务页面通用功能

(function() {
  // 从 GitHub API 获取头像作为 favicon（非首页使用）
  var path = window.location.pathname;
  if (path.indexOf('/services/') !== -1 || path.indexOf('UpdateLog') !== -1) {
    fetch('https://api.github.com/users/XEKernel')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.avatar_url) {
          var f = document.querySelector('link[rel="icon"]');
          if (f) f.href = d.avatar_url;
        }
      })
      .catch(function(){});
  }
})();
