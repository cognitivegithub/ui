Ext.define('Application.components.treeLoader', {
  extend: 'Ext.tree.Panel',
  useArrows: true,
  autoScroll: true,
  animate: true,
  containerScroll: true,
  border: false,

  type: null,
  rootName: '0',
  directFn: null,
  directSearchFn: null,
  textFormat: '{0} {1}',
  search: false,
  searchHelp: 'Поиск',

  initComponent: function() {
    this.addEvents('selected');


    if (this.search) {
      Ext.apply(this, {
        tbar: {
          xtype: 'Application.components.searchToolbar',
          searchHelp: this.searchHelp,
          eventTarget: this
        }
      });
    }

    Ext.apply(this, {
      loader: this.getTreeLoader(),
      rootVisible: false,
      root: {
        expanded: true,
        id: this.rootName
      },
      listeners: {
        scope: this,
        load: function(node) {
          this.unmask();
          if (node && node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
              var n = node.childNodes[i];
              if (n.leaf) {
                n.iconCls = 'icon-silk-accept';
              }
              n.name = n.text;
              if (this.textFormat) {
                n.text = String.format(this.textFormat, n.id, n.text);
              }
            }
          }
        },
        dblclick: function(node) {
          if (node && node.leaf) {
            this.setNodeData(node);
            this.fireEvent('selected', node);
          }
        },
        render: function() {
          this.mask('Загрузка');
        }
      }
    });
    if (this.selection) {
      this.on('afterrender', function() {
        this.selectPath(this.selection.path);
      }, this, {once: true});
    }
    Application.components.treeLoader.superclass.initComponent.call(this);
    this.on('search', this.searchHandler, this);
  },

  searchHandler: function(query) {
    var key = this.type + 'Search';
    var direct_fn =  this.directSearchFn ? this.directSearchFn : RPC.Reference[key];
    if (!Ext.isDefined(direct_fn) || !Ext.isFunction(direct_fn)) {
      throw 'Не указана функция поиска по дереву';
    }
    if (query /*&& component.query!==query*/) {
      var s = this.getSelectedObject();
      s = s ? s.id : null;
      this.mask('Поиск…');
      direct_fn([query, s], function(resp) {
        this.unmask();
        if (resp.success && resp.result) {
          this.selectPath(resp.result);
          resp.message = 'Для поиска следующего подходящего значения нажмите кнопку «Искать» еще раз';
        }
        var t = new Ext.QuickTip({
          html: resp.message || 'Ничего не нашлось'
        });
        t.showBy(this.getTopToolbar().getEl());
      }.createDelegate(this));
    }
  },

  getTreeLoader: function() {
    var direct_fn =  this.directFn ? this.directFn : RPC.Reference[this.type];
    if (!Ext.isDefined(direct_fn) || !Ext.isFunction(direct_fn)) {
      throw 'Не указана функция поиска по дереву';
    }
    return new Ext.tree.TreeLoader({
      directFn: function(n, cb) {
        direct_fn({
          node: n,
          type: this.type
        }, cb);
      }.createDelegate(this),
      baseParams: {
        type: this.type,
        for_combo: false
      }
    })
  },
  setNodeData: function(node) {
    if (node) {
      var txt = node.name;
      var n = node.parentNode;
      //var path = [node.id];
      while (n && this.rootName !== n.id) {
        txt = n.name + ' - ' + txt;
        //path.unshift(n.id);
        n = n.parentNode;
      }
      node.full_name = txt;
      //node.path = path;
      node.path = node.getPath();
    }
  },
  mask: function(text) {
    this.getEl().mask(text, 'x-mask-loading x-move-down');
  },
  unmask: function() {
    this.getEl().unmask();
  },
  getSelectedObject: function() {
    var node = this.getSelectionModel().getSelectedNode();
    if (node) {
      this.setNodeData(node);
    }
    return node;
  }
});
