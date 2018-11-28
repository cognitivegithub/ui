
Ext.define('Application.components.AdminProfilesDocsGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var property_form = Ext.id();

    var store = new Ext.data.DirectStore({
      directFn: RPC.Admin.listProfileDocs,
      paramsAsHash: true,
      idProperty: 'id',
      root: 'rows',
      autoLoad: true,
      autoDestroy: true,
      fields: ['id', 'name', 'descr', 'actual', 'access_policy'],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: {
        id: component.profile_id,
        type: component.profile_type
      }
    });
    
    var getWindow = function(action, params) {
      var winId = Ext.id();

      var win_title = 'Редактирование документа';
      if (action == 'insert') {
        win_title = 'Добавление документа';
      }

      return new Ext.Window({
        title: win_title,
        width: 850,
        id: winId,
        items: new Ext.form.FormPanel({
          id: property_form,
          bodyCssClass: 'subpanel-top-padding',
          layout : 'form',
          labelWidth: 200,
          frame: true,
          border: false,
          defaults: {
            anchor: '100%'
          },
          items: [{
            xtype: 'hidden',
            name: 'action',
            value: action
          }, {
            xtype: 'hidden',
            name: 'profile_id',
            value: component.profile_id
          }, {
            xtype: 'hidden',
            name: 'type',
            value: component.profile_type
          }, {
            xtype: 'hidden',
            name: 'id',
            value: (params && params.id) ? params.id : null
          }, {
            xtype: 'textfield',
            fieldLabel: 'Название документа'+REQUIRED_FIELD,
            allowBlank: false,
            name: 'name',
            value: (params && params.name) ? params.name : ''
          }, {
            xtype: 'checkbox',
            boxLabel: 'Актуальность',
            name: 'actual',
            checked: (params && params.actual) ? params.actual : false
          }, {
            xtype: 'combo',
            name: 'access_policy',
            fieldLabel: 'Политика доступа',
            mode: 'local',
            store : new Ext.data.ArrayStore({
                id: 0,
                fields: [
                    'id',
                    'name'
                ],
                data: [
                  [1, 'Доступ всем'],
                  [2, 'Доступ только аффилированным заказчикам'],
                  [3, 'Доступ только операторам']
                ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            hiddenName : 'access_policy',
            triggerAction: 'all',
            value: (params && params.access_policy) ? params.access_policy : 1
          }, {
            xtype: 'textarea',
            fieldLabel: 'Описание',
            name: 'descr',
            height: 250,
            value: (params && params.descr) ? params.descr : ''
          }]
        }),
        buttons: [{
          text: 'Сохранить',
          scope: this,
          handler: function() {
            performRPCCall(RPC.Admin.updateProfileDoc, [Ext.getCmp(property_form).getForm().getValues()], {wait_text: 'Идет сохранение...'}, function(result) {
              if(result.success) {
                store.reload();
                Ext.getCmp(winId).close();
              } else {
                echoResponseMessage(result);
              }
            });
          }
        }, {
          text: 'Отмена',
          scope: this,
          handler: function() {
            Ext.getCmp(winId).close();
          }
        }]
      });
    }
    
    function rendererActual(v) {
      var result = 'включено';
      if (!v) {
        result = 'выключено';
      }
      return result;
    }

    function rendererAccessPolicy(v) {
      var result = 'не установлено';
      if (v == 3) {
        result = 'доступ операторам';
      } else if (v == 2) {
        result = 'доступ аффилированным заказчикам';
      } else if (v == 1) {
        result = 'доступ для всех';
      }
      return result;
    }

    Ext.apply(this,
    {
      height: 500,
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: "Название документа", dataIndex: 'name',  tooltip: "Название документа", sortable: true, width: 150},
          {header: "Описание", dataIndex: 'descr',  tooltip: "Описание", sortable: true, width: 300},
          {header: "Актуальность", dataIndex: 'actual',  tooltip: "Актуальность", sortable: true, width: 60, renderer: rendererActual},
          {header: "Политика доступа", dataIndex: 'access_policy',  tooltip: "Политика доступа", sortable: true, width: 60, renderer: rendererAccessPolicy},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 50, items: [
            {
              tooltip: 'Редактировать',
              icon: '/ico/edit.png',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                  performRPCCall(RPC.Admin.loadProfileDoc, [{ id: item.data.id, type: component.profile_type }], {wait_text: 'Загрузка документа...'}, function(response) {
                    var win = getWindow('update', response);
                    win.show();
                  });
                }
              }
            }, {
              tooltip: 'Удалить',
              icon: '/ico/delete.png',
              handler: function(grid, rowIndex) {
                Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите удалить документ?', function(r) {
                  if ('yes' == r) {
                    var item = grid.getAt(rowIndex);
                    if (item) {
                      performRPCCall(RPC.Admin.deleteProfileDoc, [{ id: item.data.id, type: component.profile_type }], {wait_text: 'Удаление документа...'}, function(response) {
                        store.reload();
                      });
                    }
                  }
                });
              }
             }
            ]
          }
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      tbar: [{
        text: 'Добавить документ',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var win = getWindow('insert');
          win.show();
        }
      }],
      bbar: ['->', {
        text: 'Вернуться назад',
        handler: function() {
          history.back(1);
        }
      }],
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.AdminProfilesDocsGrid.superclass.initComponent.call(this);
  }
});
