Ext.define('Application.components.CompanyCategoriesPanel', {
  extend: 'Ext.Panel',
  initComponent : function () {
    var component = this;
    var tree_id = Ext.id();
    var cc_current = Ext.id();
    var text_empty = Ext.id();

    this.addEvents('nomenclatureselected');

    Ext.apply(this, {
      layout : 'form',
      anchor: '100%',
      defaults: {
        anchor: '100%',
        allowBlank: false
      },
      autoHeight : true,
      frame: false,
      labelWidth: 200,
      items: [
        {
          xtype: 'panel',
          frame: true,
          cls: 'spaced-bottom',
          title: 'Выбранные сферы деятельности',
          id: cc_current,
          items: [{
            id: text_empty,
            bodyCssClass: 'subpanel',
            cls: 'spaced-panel',
            hidden: true,
            html: 'Сферы деятельности не выбраны'
          }],
          listeners: {
            afterrender: function() {
              if (component.optype == 'company') {
                RPC.Company.loadCategories(function(resp) {
                  for (var pp=0; pp<resp.length; pp++) {
                    component.addCategory(resp[pp]);
                  }
                  component.emptyTextShow();
                  component.doLayout();
                });
              } else {
                component.emptyTextShow();
                component.doLayout();
              }
            }
          }
        }, {
          xtype: 'panel',
          frame: true,
          title: 'Перечень сфер деятельности',
          bodyCssClass: 'subpanel-top-padding',
          items: [
             {
              id: tree_id,
              xtype: 'Application.components.nomenclatureTree',
              type: 'contragent_categories',
              selection: this.selection,
              listeners: {
                nomenclature_selected: function(n) {
                  component.fireEvent('nomenclatureselected', n);
                }
              }
            }, {
              bodyCssClass: 'subpanel',
              cls: 'spaced-panel',
              buttonAlign: 'left',
              buttons: [{
                xtype: 'button',
                text: 'Выбрать',
                handler: function(){
                  var n = Ext.getCmp(tree_id).getSelectedObject();
                  var txt = false;
                  if (!n) {
                    txt = 'Вы не выбрали объект номенклатуры!';
                  } else if (!n.leaf) {
                    txt = 'Следует выбирать объект номенклатуры, а не целый раздел';
                  }
                  if (txt) {
                    Ext.Msg.alert('Ошибка', txt);
                  } else {
                    component.fireEvent('nomenclatureselected', n);
                  }
                }
              }]
            }
          ]
        }
      ],
      listeners: {
        nomenclatureselected: function(n) {
          if (component.optype == 'company') {
            performRPCCall(RPC.Company.categoryAdd, [{ id: n.id }], {wait_text: 'Добавление категории...'}, function(response) {
              if (response.success) {
                component.addCategory(n);
                component.emptyTextShow();
                component.doLayout();
              } else {
                Ext.Msg.alert('Ошибка', response.message);
              }
            });
          } else {
            component.addCategory(n);
            component.emptyTextShow();
            component.doLayout();
          }
        }
      },
      emptyTextShow: function() {
        var cmp_cc = Ext.getCmp(cc_current);
        var cmp_te = Ext.getCmp(text_empty);
        if (cmp_cc.items.length == 1) {
          cmp_te.setVisible(true);
        } else {
          cmp_te.setVisible(false);
        }
      },
      addCategory: function(n) {
        var cc_panel = Ext.getCmp(cc_current);
        cc_panel.add({
          layout: 'column',
          cls: 'spaced-panel',
          bodyCssClass: 'subpanel',
          border: true,
          items: [{
            columnWidth: 1,
            xtype: 'panel',
            layout: 'form',
            border: false,
            hideTitle: true,
            cls: 'spaced-cell',
            html: n.full_name
          }, {
            xtype: 'button',
            text: 'Удалить',
            cls: 'spaced-cell',
            handler: function() {
              var p = this.findParentByType('panel');
              var cur_cat = p.getValue();
              Ext.Msg.confirm('Предупреждение', 'Вы действительно хотите удалить эту категорию \'' + cur_cat.name + '\'?', function(b) {
                if ('yes'==b) {
                  if (component.optype == 'company') {
                    performRPCCall(RPC.Company.categoryRemove, [{ id: cur_cat.code }], {wait_text: 'Удаление категории...'}, function(response) {
                      if (response.success) {
                        p.destroy();
                        component.emptyTextShow();
                      } else {
                        Ext.Msg.alert('Ошибка', response.message);
                      }
                    });
                  } else {
                    p.destroy();
                    component.emptyTextShow();
                  }
                }
              });             
            }
          }],
          category: {code: n.id||n.code, name:n.text, full_name:n.full_name, path: n.path},
          name: 'category[]',
          getValue: function() {
            return this.category;
          }
        });            
      },
      getCategories: function() {
        var cmp_cc = Ext.getCmp(cc_current);
        var elems = [];
        var cur_elem = null;
        if (cmp_cc.items.length > 1) {
          for(var pp = 0; pp < cmp_cc.items.length; pp++) {
            if (cmp_cc.items.items[pp].id != text_empty) {
              cur_elem = cmp_cc.items.items[pp].getValue();
              elems.push(cur_elem.code);
            }
          }
        }
        return elems;
      }
    });
    
    Application.components.CompanyCategoriesPanel.superclass.initComponent.call(this);
  }
});
