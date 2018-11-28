/**
 * @class Application.components.ContentViewBase
 * @extends Ext.panel.Panel
 *
 * Панель просмотра страниц помощи.
 *
 */
Ext.define('Application.components.ContentViewBase', {
  extend        : 'Ext.panel.Panel',

  border        : false,
  bodyBorder    : false,

  width         : '100%',

  urlMode       : 'id',

  layout        : 'border',
  defaults      : {
    border        : false
  },

  editable      : false, // will be used in Application.components.AdminContentEdit

  contentId     : null,

  menuCfg       : {
    ref           : 'menu',
    title         : 'Оглавление',
    header        : true,
    region        : 'west',

    xtype         : 'treepanel',

    width         : 250,
    minSize       : 200,
    maxSize       : 400,

    collapsible   : true,
    split         : true,
    border        : true,

    margins       : '5 0 0 0',
    cmargins      : '5 5 0 0',
    autoScroll    : true,

    // Tree-specific:
    rootVisible   : false,
    useArrows     : true,
    lines         : false,
    singleExpand  : false,

    // Загружаем структуру меню с сервера.
    loader        : new Ext.tree.TreeLoader({
      preloadChildren : true,
      listeners     : {
        beforeload    : function(loader, node) {
          node.getOwnerTree().disable();
        },
        load          : function(loader, node) {
          node.getOwnerTree().enable();
        }
      },
      directFn      : function(node, callback) {
        RPC.Help.menu({}, callback);
      }
    }),

    root          : {
      id            : 'root',
      //text          : 'Помощь',
      nodeType      : 'async',
      //nodeType      : 'node',
      draggable     : false,
      editable      : false,
      expanded      : true
    },

    listeners     : {

      click         : function(node) {
        var tree = this;
        var panel = tree.refOwner;
        var fp = panel.content;
        if (!panel.editable && !node.attributes.leaf)
          return false;
        fp.text.setValue('');
        fp.text.disable();
        if (node.attributes.leaf) {
          if (panel.editable) {
            panel.loadContentPage(node.attributes.id);
          } else {
            var path = false;
            switch (panel.urlMode) {
              case 'path':
                path = node.getPath().replace(/^\/root\//g, '');
                path = 'node/'+path.replace(/\//g, '-');
                break;
              case 'title':
                path = 'page/'+node.text.replace(/\//g, '%2F');
                break;
              case 'id':
                path = 'id/'+node.id;
                break;
            }
            if (path) {
              redirect_to(tree.refOwner.baseUrl+path);
            }
          }
        } // if leaf
      } // click listener
    } // menu listeners
  }, // menuCfg


  contentCfg    : {
    ref           : 'content',
    region        : 'center',

    layout        : 'fit',

    xtype         : 'form',
    bufferResize  : true,
    border        : false,
    bodyBorder    : false,
    margins       : '5 5 0 0',

    items         : [{
      xtype         : 'displayfield',
      ref           : 'text',
      cls           : 'view-help',
      style         : 'padding: 10px;',
      enabled       : false,
      autoScroll    : true,
      border        : false,
      bodyBorder    : false,
      hideLabel     : true
    }]
  }, // contentCfg

  loadContentPage : function(id) {
    var panel = this;
    var fp = panel.content;
    RPC.Help.index({contentId: id}, function(result) {
      if (result.success && result.page && fp.text) {
        panel.contentId = result.page.id;
        fp.text.enable();
        fp.text.setValue(result.page.text);
      } else {
        panel.contentId = null;
        if (!result.success)
          echoResponseMessage(result);
      }
    }); // RPC.Help.index
  },

  listeners: {
    paramschanged: function(newparams) {
      if (!newparams) {
        return;
      }
      var menu = this.getComponent(0);
      var path = '';
      var id = 0;
      if (newparams.node) {
        path = '/root/'+newparams.node.replace(/-/g, '/');
        id = newparams.node.match(/-([0-9]+)$/)[1];
      } else if (newparams.page||newparams.id) {
        var child = false;
        if (newparams.page) {
          child = menu.root.findChild('text', newparams.page.replace(/%2F/ig, '/'), true);
        } else if (newparams.id) {
          child = menu.root.findChild('id', Number(newparams.id), true);
        }
        if (!child) {
          return;
        }
        path = child.getPath();
        id = child.id;
      }
      menu.selectPath(path);
      this.loadContentPage(id);
    }
  },

  initComponent : function () {


    this.items = [
      this.menuCfg,
      this.contentCfg
    ];
    if (this.selection) {
      //var selection = this.selection;
      this.items[0].loader.on('load', function(loader, node, response){
        //this.selectPath('/root/'+selection.replace(/-/g, '/'));
        //this.refOwner.fireEvent('paramschanged', selection);
        var path = this.selection.node;
        var searchNodePath = function(node, attr, value) {
          for (var i=node.length-1; i>=0; i--) {
            if (node[i][attr] === value) {
              return node[i].id;
            } else if (node[i].children && node[i].children.length) {
              var subid = searchNodePath(node[i].children, attr, value);
              if (subid) {
                return node[i].id+'-'+subid;
              }
            }
          }
          return false;
        }
        if (!path && response && response.responseData) {
          if (this.selection.page) {
            path = searchNodePath(response.responseData, 'text', this.selection.page.replace(/%2F/ig, '/'));
          } else if (this.selection.id) {
            path = searchNodePath(response.responseData, 'id', Number(this.selection.id));
          }
        }
        if (path) {
          this.fireEvent('paramschanged', {node: path});
        }
      }, this, {once: true});
    }
    Application.components.ContentViewBase.superclass.initComponent.call(this);
  } // initComponent

}); // Application.components.ContentViewBase