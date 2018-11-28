
Ext.define('Application.components.AdminProfilesGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var property_form = Ext.id();

    var store = new Ext.data.DirectStore({
      directFn: RPC.Admin.listProfiles,
      paramsAsHash: true,
      idProperty: 'id',
      root: 'rows',
      autoLoad: true,
      autoDestroy: true,
      fields: ['id', 'name', 'required_kpp', 'required_ogrn', 'accreditation_text', 'deposit_application'],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: {
        type: component.optype
      }
    });

    var getWindow = function(action, params) {
      var winId = Ext.id();

      var win_title = 'Редактирование профиля';
      if (action == 'insert') {
        win_title = 'Добавление профиля';
      }
      if (component.optype == 'customer') {
        win_title += ' заказчика';
      } else {
        win_title += ' заявителя';
      }

      var param_id, param_name, param_accreditation_text, param_deposit_application, param_required_kpp, param_required_ogrn;
      if (params) {
        param_id  = params.id;
        param_name  = params.name;
        param_accreditation_text  = params.accreditation_text;
        param_deposit_application  = params.deposit_application;
        param_required_kpp = params.required_kpp;
        param_required_ogrn  = params.required_ogrn;
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
            name: 'type',
            value: component.optype
          }, {
            xtype: 'hidden',
            name: 'id',
            value: param_id
          }, {
            xtype: 'textfield',
            fieldLabel: 'Название профиля'+REQUIRED_FIELD,
            allowBlank: false,
            name: 'name',
            value: param_name
          }, {
            xtype: 'checkbox',
            boxLabel: 'КПП обязателен',
            name: 'required_kpp',
            checked: param_required_kpp
          }, {
            xtype: 'checkbox',
            fieldLabel: '',
            boxLabel: 'ОГРН обязателен',
            name: 'required_ogrn',
            checked: param_required_ogrn
          }, {
            xtype: 'textarea',
            fieldLabel: 'Текст аккредитации',
            name: 'accreditation_text',
            height: 150,
            value: param_accreditation_text
          }, {
            xtype: 'textarea',
            fieldLabel: 'Заявка на открытие счета',
            name: 'deposit_application',
            height: 150,
            value: param_deposit_application
          }]
        }),
        buttons: [{
          text: 'Сохранить',
          scope: this,
          handler: function() {
            performRPCCall(RPC.Admin.updateProfiles, [Ext.getCmp(property_form).getForm().getValues()], {wait_text: 'Идет сохранение...'}, function(result) {
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

    function requiredRenderer(v) {
      var result = 'обязателен';
      if (!v) {
        result = 'не обязателен';
      }
      return result;
    }

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: "Название профиля", dataIndex: 'name',  tooltip: "Название профиля", sortable: true},
          {header: "КПП", dataIndex: 'required_kpp',  tooltip: "КПП", sortable: true, width: 50, renderer: requiredRenderer},
          {header: "ОГРН", dataIndex: 'required_ogrn',  tooltip: "ОГРН", sortable: true, width: 50, renderer: requiredRenderer},
          {header: "Текст аккредитации", dataIndex: 'accreditation_text',  tooltip: "Текст аккредитации", width: 180},
          {header: "Заявка на открытие счета", dataIndex: 'deposit_application',  tooltip: "Заявка на открытие счета", width: 180},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 50, items: [
             {
              tooltip: 'Редактировать',
              icon: '/ico/edit.png',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                  performRPCCall(RPC.Admin.loadProfile, [{ id: item.data.id, type: component.optype }], {wait_text: 'Загрузка профиля...'}, function(response) {
                    var win = getWindow('update', response);
                    win.show();
                  });
                }
              }
             }, {
              tooltip: 'Обязательные документы',
              icon: '/ico/document.png',
              handler: redirectActionHandler('admin/profileDocs/type/' + component.optype + '/profile_id/{id}')
             }, {
              tooltip: 'Удалить',
              icon: '/ico/delete.png',
              handler: function(grid, rowIndex) {
                Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите удалить профиль?', function(r) {
                  if ('yes' == r) {
                    var item = grid.getAt(rowIndex);
                    if (item) {
                      performRPCCall(RPC.Admin.deleteProfiles, [{ id: item.data.id, type: component.optype }], {wait_text: 'Удаление профиля...'}, function(response) {
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
        text: 'Добавить профиль',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var win = getWindow('insert');
          win.show();
        }
      }],
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.AdminProfilesGrid.superclass.initComponent.call(this);
  }
});
