Ext.ns('Ext.ux.plugins');

/**
 * Плагин для копирования текста в клипборд
 * Т.к. для копирования часто нужно прямое действие пользователя (клик), то
 * совместимо выполнить эту функциональность простой функцией никак.
 *
 * Самый совместимый бекенд (флеш) будет прозрачно отрисовываться поверх
 * компонента, поэтому никаких функциональных возможностей, зависящих от
 * пользовательского ввода, у компонента быть не должно.
 *
 * Идеальный вариант для компонента с этим плагином — Ext.Button
 *
 * Параметры компонента:
 *   clipboardText — текст, который будет скопирован в буфер обмена по клику
 *                   на компонент (евент click). Симулированный клик не прокатит
 *
 * Евенты:
 *   copiedtoclipboard — копирование в клипборд произведено
 */

Ext.ux.plugins.Clipboard = {
  init : function(component) {
    var backend = this.getBackend();
    var onCopyToClipboard = function() {
      var text = component.clipboardText;
      if (backend && backend.copy) {
        backend.copy.call(component, text, arguments);
      }
    };
    if (backend && backend.init) {
      backend.init(component, onCopyToClipboard);
    }
    component.addEvents('copiedtoclipboard');
    component.on('copiedtoclipboard', this.onCopied);
  },
  onCopied: function() {
    if (this.setIconClass) {
      this.setIconClass('icon-silk-tick');
    }
  },
  getBackend: function() {
    for (var i=0; i<this.backends.length; i++) {
      if (this.backends[i] && this.backends[i].isSupported && this.backends[i].isSupported()) {
        return this.backends[i];
      }
    }
    return null;
  },
  backends: [{
    // IE
    isSupported: function() {
      return window.clipboardData && clipboardData.setData;
    },
    init: function(component, fn) {
      component.on('click', fn, component);
    },
    copy: function(s) {
      if (clipboardData.setData("Text", s)) {
        this.fireEvent('copiedtoclipboard', this);
      }
      return true;
    }
  }, {
    // ZeroClipboard
    isSupported: function() {
      return window.ZeroClipboard;
    },
    init: function(component, fn) {
      component.disable();
      component.on('render', function(){
        if (!window.ZeroClipboard || !this.getEl()) {
          return;
        }
        var el = this.getEl();
        if (!el || !el.dom) {
          return;
        }
        var clip = new ZeroClipboard(el.dom, {
          moviePath: '/resources/ZeroClipboard.swf',
          useNoCache: false,
          hoverClass: "x-btn-over",
          activeClass: "x-btn-click"
        });

        function onComplete(client, args) {
          //alert("Copied text to clipboard: " + args.text);
          component.fireEvent('copiedtoclipboard', component, args.text)
        }

        function onReady() {
          fn(clip); // инициализируем текст клипборды
          component.enable();
        }

        clip.on('complete', onComplete);
        component.on('destroy', function(){
          clip.off('complete', onComplete);
        });
        if (clip.ready()) {
          onReady();
        } else {
          clip.on('load', onReady);
        }
      }, component, {single: true});
    },
    copy: function(s, c) {
      c[0].setText(s);
    }
  }, {
    // Gecko (не работает как минимум на новых ФФ, бесполезен)
    isSupported: function() {
      return window.netscape && window.Components && Components.classes && Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'];
    },
    init: function(component, fn) {
      component.on('click', fn, component);
    },
    copy: function(s) {
      try {
        // You have to sign the code to enable this or allow the action in about:config by changing
        // user_pref("signed.applets.codebase_principal_support", true);
        //netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

        var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip)
          return false;

        // create a transferable
        var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
        if (!trans)
          return false;

        // specify the data we wish to handle. Plaintext in this case.
        trans.addDataFlavor('text/unicode');

        // To get the data from the transferable we need two new objects
        var str = new Object();
        var len = new Object();

        var str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);

        var copytext = s;

        str.data = copytext;

        trans.setTransferData("text/unicode", str, copytext.length * [[[[2]]]]);

        var clipid = Components.interfaces.nsIClipboard;

        if (!clip)
          return false;

        clip.setData(trans, null, clipid.kGlobalClipboard);
        this.fireEvent('copiedtoclipboard', this);
        return true;
      } catch (e) {

      }
      return false;
    }
  }, {
    // Dummy
    isSupported: function() {
      return true;
    },
    init: function(component) {
      component.disable();
    },
    copy: Ext.emptyFn
  }]
}
