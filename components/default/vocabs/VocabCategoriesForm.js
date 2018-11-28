
Ext.define('Application.components.VocabCategoriesForm', {
  extend: 'Ext.panel.Panel',
  frame: false,
  autoHeight: true,
  initComponent: function() {
    var component = this;
    var tree_panel_id = Ext.id();
    var button_edit_id = Ext.id();
    var button_remove_id = Ext.id();

    Ext.apply(this, {
      title: 'Упрощенный классификатор',
//      tbar: [{
//        text: 'Создать раздел',
//        cls: 'x-btn-text-icon',
//        icon: '/ico/folder.png',
//        handler: function() {
//          component.newNode(false);
//        }
//      }, {
//        text: 'Создать категорию',
//        cls: 'x-btn-text-icon',
//        icon: '/ico/document.png',
//        handler: function() {
//          component.newNode(true);
//        }
//      }, {
//        text: 'Редактировать',
//        id: button_edit_id,
//        cls: 'x-btn-text-icon',
//        icon: '/ico/edit.png',
//        disabled: true,
//        handler: function() {
//          var tree = Ext.getCmp(tree_panel_id);
//
//          var sm = tree.getSelectionModel();
//          var cur_node = sm.getSelectedNode();
//          if (cur_node == null) {
//            Ext.Msg.alert('Предупреждение', 'Необходимо выбрать раздел или категорию для удаления');
//            return;
//          }
//          tree.editor.triggerEdit(cur_node);
//        }
//      }, {
//        text: 'Удалить',
//        id: button_remove_id,
//        cls: 'x-btn-text-icon',
//        icon: '/ico/delete.png',
//        disabled: true,
//        handler: function() {
//          Ext.Msg.confirm('Предупреждение', 'Вы уверены что хотите удалить?', function(r) {
//            if ('yes' == r) {
//              component.removeNode();
//            }
//          });
//        }
//      }],
      items: [{
        xtype: 'treepanel',
        bodyCssClass: 'subpanel',
        cls: 'spaced-panel',
        id: tree_panel_id,
        useArrows: true,
        autoScroll: false,
        animate: true,
        containerScroll: false,
        border: false,
        frame: false,
        rootVisible: true,
        root: {
          expanded: true,
          editable: false,          
          id: '0',
          text: 'Классификатор сфер деятельности'
        },
        loader: new Ext.tree.TreeLoader({
          directFn: function(n, cb){RPC.Reference.categories({node: n}, cb);}
        })
//        listeners: {
//          beforerender: function() {
//            var tree = Ext.getCmp(tree_panel_id);            
//            this.editor = new Ext.tree.TreeEditor(this, {
//                allowBlank: false,
//                editDelay: 50
//              }, {
//              listeners: {
//                complete: function(editor, new_value, origin_value) {
//                  var request_type = 'edit';
//                  if (!origin_value && editor.editNode.isLeaf()) {
//                    request_type = 'new_leaf';
//                  }
//                  if (!origin_value && !editor.editNode.isLeaf()) {
//                    request_type = 'new_folder';
//                  }
//                  tree.disable();                  
//                  performRPCCall(RPC.Reference.categoriesEdit, [{
//                      request_type: request_type, 
//                      value:        new_value, 
//                      category_id:  editor.editNode.id, 
//                      parent_id:    editor.editNode.parentNode.id
//                    }], {wait_text: 'Сохранение...'}, function(resp) { 
//                      if (resp.success) {
//                        if (request_type == 'new_leaf' || request_type == 'new_folder') {
//                          editor.editNode.id = resp.message;
//                        }
//                      } else {
//                        Ext.Msg.alert('Ошибка', resp.message);
//                      }
//                      tree.enable();
//                    });
//                },
//                cancelEdit: function(editor, value, startValue) {
//                  // если отменено редактирование новой ноды, то удаляем ее из дерева
//                  var rg = /^[0-9]+$/;
//                  if (!rg.test(editor.editNode.id)) {
//                    editor.editNode.destroy();
//                  }
//                }
//              }
//            });
//          },
//          click: function(node) {
//            var button_edit = Ext.getCmp(button_edit_id);
//            var button_remove = Ext.getCmp(button_remove_id);
//            if (node.id != 0) {
//              button_edit.enable();
//              button_remove.enable();
//            } else {
//              button_edit.disable();
//              button_remove.disable();
//            }
//          }
//        }
      }],
      newNode: function(is_leaf) {
        var tree = Ext.getCmp(tree_panel_id);
        
        var sm = tree.getSelectionModel();
        var cur_node = sm.getSelectedNode();
        var parent_node = null;
        if (cur_node == null) {
          parent_node = tree.getRootNode();
        } else {
          if (!cur_node.isLeaf()) {
            parent_node = cur_node;
          }
        }
        if (parent_node == null) {
          Ext.Msg.alert('Предупреждение', 'Необходимо выбрать раздел');
          return;
        }
        parent_node.expand(false, true, function() {
          var new_node = parent_node.appendChild({
                            leaf: is_leaf
                          });
          
          tree.editor.triggerEdit(new_node);
        });
      },
      removeNode: function() {
        var tree = Ext.getCmp(tree_panel_id);
        
        var sm = tree.getSelectionModel();
        var cur_node = sm.getSelectedNode();
        if (cur_node == null) {
          Ext.Msg.alert('Предупреждение', 'Необходимо выбрать раздел или категорию для удаления');
          return;
        }
        tree.disable();                  
        performRPCCall(RPC.Reference.categoriesRemove, [{category_id:  cur_node.id}], {wait_text: 'Сохранение...'}, function(resp) { 
            if (resp.success) {
              cur_node.destroy();
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
            tree.enable();
          });
      }
    });
    Application.components.VocabCategoriesForm.superclass.initComponent.call(this);
  }
});
