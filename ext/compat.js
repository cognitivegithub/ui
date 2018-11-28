(function() {
  if (!Ext) {
    return;
  }
  if (!Ext.util.JSON) {
    Ext.util.JSON = Ext.JSON;
  }

  function createDelegationMethod(object, method) {
    return function() {
      var args = [this];
      if (arguments.length>0) {
        args.push.apply(args, arguments);
      }
      return object[method].apply(object, args);
    }
  }

  if (Ext.Function && !Function.prototype.defer) {
    Function.prototype.createDelegate = createDelegationMethod(Ext.Function, 'bind');
    Function.prototype.defer = createDelegationMethod(Ext.Function, 'defer');
  }

  if (!String.format && Ext.String) {
    String.format = Ext.String.format;
  }

  if (!Date.prototype.format && Ext.Date) {
    Date.prototype.format = createDelegationMethod(Ext.Date, 'format');
  }

  if (!Ext.TaskManager) {
    Ext.TaskManager = Ext.TaskMgr;
  }

  if (Ext.versions && Ext.versions.core && Ext.versions.core.major>=4) {
    Ext.reg = Ext.emptyFn;
    Ext.data.Store.superclass.recordType = function(r) {
      return r;
    }
  } else {
    var cmp_map = {
      'Ext.form.Panel': 'Ext.form.FormPanel',
      'Ext.grid.Panel': 'Ext.grid.GridPanel',
      'Ext.tree.Panel': 'Ext.tree.TreePanel',
      'Ext.panel.Panel': 'Ext.Panel',
      'Ext.tab.Panel': 'Ext.TabPanel'
    };
    var postponed = [];
    function getObject(name, autons) {
      var ns = name.split('.');
      var base = window;
      for (var i=0; i<ns.length-1; i++) {
        if (!base[ns[i]]) {
          if (!autons) {
            return null;
          }
          base[ns[i]] = {};
        }
        base = base[ns[i]];
      }
      if (autons) {
        return {parent: base, child: ns[i]};
      }
      return base[ns[i]];
    }
    Ext.define = function(name, config) {
      var base = config.extend;
      var i;
      if (cmp_map[base]) {
        base = cmp_map[base];
      }
      if (config.editable && base=='Ext.grid.GridPanel') {
        base = 'Ext.grid.EditorGridPanel';
      }
      var basecmp = getObject(base);

      if (basecmp) {
        var cmp = getObject(name, true);
        if (config.layout && config.layout.type) {
          config.layoutConfig = config.layout;
          config.layout = config.layout.type;
        }
        cmp.parent[cmp.child] = Ext.extend(basecmp, config);
        for (i=0; i<postponed.length; i++) {
          if (postponed[i].depends === name) {
            cmp = postponed[i];
            postponed.splice(i, 1);
            Ext.define(cmp.name, cmp.cfg);
            i--;
          }
        }
      } else {
        for (i=0; i<postponed.length; i++) {
          if (postponed[i].name == name) {
            return false;
          }
        }
        postponed.push({name:name, depends: base, cfg: config});
        return false;
      }
      return true;
    }
    Ext.reg('pagingtoolbar', Ext.PagingToolbar);
  }
})();
