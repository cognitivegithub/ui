
/*
 * HTML5 History Manager
 */

(function(window){
  if (window.HistoryManager) {
    return;
  }

  var html5_history = !!(window.history && window.history.pushState);
  var hashchange_supported = ('undefined'!=typeof(window.onhashchange));

  if (Ext.isOpera || Ext.isWebKit || Ext.isGecko) {
    // Опера забагованная, она не файрит onpopstate при ручном изменении URL
    // Также проблема у Android, но его не выцепить толком
    html5_history = false;
  }

  if (window.navigator.appName == "Microsoft Internet Explorer")
  {
     if (!document.documentMode || document.documentMode < 8) {
       hashchange_supported = false; // IE до 8й версии некорректно работают
     } else if (document.documentMode == 10) {
       // У ИЕ 10 также есть проблемы поддержки HTML5 History API
       html5_history = false;
     }
  }

  if (!html5_history && !hashchange_supported) {
    // по дефолту, если нет ничего более умного чем поллинг, не делаем ничего
    return;
  }

  window.HistoryManager = new (Ext.extend(Ext.util.Observable, {
    constructor: function() {
      this.addEvents('change');
      if (html5_history) {
        window.onpopstate = (function(event){window.HistoryManager.onPopState(event);});
      } else if (hashchange_supported) {
        window.onhashchange = (function(event){window.HistoryManager.onPopState(event);});
      } else {
        // поллинг
        this.currentHash = window.document.location.hash;
        setTimeout(this._checker, 250);
      }
    },
    _checker: function() {
      var hm = window.HistoryManager;
      if (hm && window.document.location.hash!=hm.currentHash) {
        hm.currentHash = window.document.location.hash;
        hm.onPopState();
      }
      setTimeout(hm._checker, 50);
    },
    onPopState: function(event) {
      this.fireEvent('change', this.getToken());
    },
    addEvent: function(event, handler) {
      this.on(event, handler);
    },
    add: function(token) {
      if (html5_history) {
        var url = window.document.location.href;
        var idx = url.indexOf('#');
        if (idx<0) {
          url += '#'+token;
        } else {
          url = url.substr(0, idx+1) +token;
        }
        window.history.pushState(null, null, url);
      } else if (hashchange_supported) {
        window.document.location.hash = token;
        return;
      } else {
        window.document.location.hash = token;
        this.currentHash = '#' + token;
      }
      this.fireEvent('change', token);
    },
    getToken: function() {
      var hash = window.document.location.hash;
      if (!hash || '#'==hash) {
        return '/';
      }
      return hash.substr(1);
    }
  }));
})(window);
