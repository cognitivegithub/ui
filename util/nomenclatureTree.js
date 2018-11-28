Ext.define('Application.components.nomenclatureTree', {
  extend: 'Ext.tree.Panel',
  useArrows: true,
  autoScroll: true,
  animate: true,
  containerScroll: true,
  type: this.type||'okdp',
  border: false,
  initComponent: function() {
    var component = this;
    //var is_selected = false, sel_level=0;
    this.addEvents('nomenclature_selected');
    this.rootName = this.type=='okdp'?'D':'0';
    var direct_fn;
    if (component.type == 'contragent_categories') {
      direct_fn = RPC.Reference.categories;
    } else if (component.type == 'procedure_subject_codes') {
      direct_fn = RPC.Reference.subjectcodes;
    } else if (component.type == 'procedure_inner_classification') {
      direct_fn = RPC.Reference.innerclassification;
    } else {
      direct_fn = RPC.Reference.nomenclature;
    }
    Ext.apply(this, {
      loader: new Ext.tree.TreeLoader({
        directFn: function(n, cb){direct_fn({node: n, type: component.type}, cb);},
        baseParams: {type: this.type, for_combo: false}
      }),
      rootVisible: false,
      root: {
        expanded: true,
        id: this.rootName
      },
      listeners: {
        load: function(node) {
          component.unmask();
          if (node && node.childNodes) {
            for (var i=0; i<node.childNodes.length; i++) {
              var n = node.childNodes[i];
              if (n.leaf) {
                n.iconCls = 'icon-silk-accept';
              }
              n.name = n.text;
              if (['contragent_categories', 'procedure_subject_codes', 'procedure_inner_classification'].indexOf(component.type)<0) {
                n.text = n.id+' '+n.text;
              }
            }
          }
        },
        dblclick: function(node) {
          if (node && node.leaf) {
            component.setNodeData(node);
            this.fireEvent('nomenclature_selected', node);
          }
        },
        render: function() {
          component.mask('Загрузка');
        }
      }
    });
    if (this.selection) {
      this.on('afterrender', function(){
          this.selectPath(this.selection.path);
        }, this, {once: true});
    }
    Application.components.nomenclatureTree.superclass.initComponent.call(this);
  },
  setNodeData: function(node) {
    if (node) {
      var txt = node.name;
      var n = node.parentNode;
      //var path = [node.id];
      while (n && this.rootName!==n.id) {
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
