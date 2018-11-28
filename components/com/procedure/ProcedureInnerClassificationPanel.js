Ext.define('Application.components.ProcedureInnerClassificationPanel', {
  extend: 'Ext.form.FieldSet',
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
          border: false,
          id: cc_current,
          items: [{
            id: text_empty,
            bodyCssClass: 'subpanel',
            cls: 'spaced-panel',
            hidden: true,
            html: 'Код не выбран'
          }],
          listeners: {
            afterrender: function() {
              component.emptyTextShow();
              component.doLayout();
            }
          }
        }
      ],
      buttons: [{
        text: 'Добавить',
        handler: function() {
          var win = new Ext.Window({
            title: 'Добавление кода',
            width: 700,
            height: 400,
            bodyStyle: 'padding: 10px',
            layout: 'fit',
            items: [{
              id: tree_id,
              xtype: 'Application.components.nomenclatureTree',
              type: 'procedure_inner_classification',
              selection: this.selection,
              listeners: {
                nomenclature_selected: function(n) {
                  n.code_id = n.id;
                  delete n.id;
                  component.fireEvent('nomenclatureselected', n);
                  win.close();
                }
              }
            }],
            buttons: [{
              xtype: 'button',
              text: 'Выбрать',
              handler: function(){
                var n = Ext.getCmp(tree_id).getSelectedObject();
                var txt = false;
                if (!n) {
                  txt = 'Вы не выбрали код!';
                } else if (!n.leaf) {
                  txt = 'Следует выбирать код, а не целый раздел';
                }
                if (txt) {
                  Ext.Msg.alert('Ошибка', txt);
                } else {
                  n.code_id = n.id;
                  delete n.id;
                  component.fireEvent('nomenclatureselected', n);
                  win.close();
                }
              }
            }, {
              text: 'Закрыть',
              handler: function() {
                win.close();
              }
            }]
          });
          win.show();
        }
      }],
      listeners: {
        nomenclatureselected: function(n) {
          component.addCategory(n);
          component.emptyTextShow();
          component.doLayout();
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
                  p.destroy();
                  component.emptyTextShow();
                }
              });             
            }
          }],
          procedure_codes: {
            id:               n.id,
            code_id:          n.code_id,
            name:             n.text,
            full_name:        n.full_name,
            path:             n.path
          },
          name: 'procedure_inner_classification[]',
          getValue: function() {
            return this.procedure_codes;
          }
        });            
      },
      removeAllCategories: function() {
        var cmp_cc = Ext.getCmp(cc_current);
        var cmp_te = Ext.getCmp(text_empty);
        cmp_cc.items.each(function(val) {
          if (val.getId() != cmp_te.getId()) {
            val.destroy();
          }
        });
      },
      setValues: function(val) {
        if (val) {
          component.removeAllCategories();
          for(var prop in val) {
            if (val.hasOwnProperty(prop)) {
              component.addCategory(val[prop]);
            }
          }
          component.emptyTextShow();
          component.doLayout();
        }
      }
    });
    
    Application.components.ProcedureInnerClassificationPanel.superclass.initComponent.call(this);
  }
});
