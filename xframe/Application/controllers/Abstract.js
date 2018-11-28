Application.controllers.Abstract = Ext.extend(Ext.util.Observable, {
  constructor : function (config) {
    this.addEvents('postdispatch');
    this.addEvents('afteraction');
    Ext.apply(this, config);
    Application.controllers.Abstract.superclass.constructor.call(this, config);
  // this.breadcrumbs = new Application.controllers.Abstract.Breadcrumbs();.
  },
  dispatch : function (action, params, is_same_resource) {
    if (Ext.isFunction(this[action + 'Action'])) {
      var app = this.app, viewport = this.app.getViewport(), bypass = false;
      if (is_same_resource) {
        var cmp = viewport.getComponent(0);
        if (cmp && cmp.sameResourceActivationBypass) {
          bypass = true;
        }
      }
      if (!bypass) {
        viewport.removeAll();
      }
      // this.breadcrumbs.clear();.
      this.fireEvent('postdispatch', action, params);
      /* try { */
        if (bypass) {
          cmp.fireEvent('paramschanged', params);
        } else {
          this[action + 'Action'].call(this, params, app, viewport);
        }
      /* } catch(e) {
        defaultErrorHandler(e);
      } */
      this.fireEvent('afteraction', action);
      if (!bypass) {
        viewport.doLayout();
      }
    }
  },
  getName : function () {
    for (var name in Application.controllers) {
      if (Application.controllers[name] === this.constructor) {
        var m = name.match(/(\w+)Controller/);
        return m[1].toLowerCase();
      }
    }
    return false;
  },
  listeners: {
    afteraction: function(action) {
      var title = [];
      var viewport = this.app.getViewport();
      if (this.title) {
        title.push(this.isFunction(this.title) ? this.title(action) : this.title);
      }
      var cmp = viewport.getComponent(0);
      if (cmp && cmp.title) {
        title.push(cmp.title);
      }
      if (cmp && cmp.detailedTitle) {
        title.push(cmp.detailedTitle);
      }
      cmp = Ext.getCmp('layout_title_panel');
      if (cmp) {
        if (0 == title.length) {
          cmp.setTitle('&nbsp;');
        } else {
          cmp.setTitle(title.join(' :: '));
        }
      }
      if (Main.siteTitle) {
        title.push(Main.siteTitle);
      }
      document.title = title.join(' :: ');
    }
  },

  isFunction: function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }
});
