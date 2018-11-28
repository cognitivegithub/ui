/**
 * Параметры компоненты:
 * directFn - откуда будет подгружаться стора.
 * params - параметры поиска пользователей.
 * links - массив возможных действий над пользователями (view|edit|rights|block|delete|accept|decline)
 */
 Ext.define('Application.components.AdminUserGrid', {
  extend : 'Ext.grid.Panel',
  frame : true,
  border : false,
  id: 'userPanel',
  initComponent : function () {
    this.addEvents('search', 'changestatus', 'declineuser');
    var component = this;
    var store = createAdminUserStore(this.directFn, this.params);

    function renderUserFio(value, p, record) {
      var fio = [];
      if (record.get('last_name') !== null) fio.push(record.get('last_name'));
      if (record.get('first_name') !== null) fio.push(record.get('first_name'));
      if (record.get('middle_name') !== null) fio.push(record.get('middle_name'));
      return String.format('<a href="/#user/view/id/{0}">{1}</a>', record.get('id'), fio.join(' '));
    }

    var cols = [
      {id: 'id', header: 'ID', width: 15, dataIndex: 'id'},
      {header: 'Логин', dataIndex: 'username'},
      {header: 'Фамилия, имя и отчество', renderer: renderUserFio},
      {header: 'Должность', dataIndex: 'user_job'},
      {header: 'Email', dataIndex: 'user_email'},
      {header: 'Дата регистрации', dataIndex: 'date_created', renderer: Ext.util.Format.dateRenderer('d.m.Y')}
    ];
    if (component.links.indexOf('accept/decline') == -1) {
      cols.push({header: 'Статус', dataIndex: 'status_name'});
    }
    cols.push({header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: [
           {
             tooltip: 'Рассмотреть',
             text: 'Рассмотреть',
             href: function(value, p, record) {
               return String.format('#user/review/id/{0}/user_id/{1}/user_type/admin', record.get('accred_id'), record.get('id'));
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_NOT_AUTHORIZED && component.links.indexOf('accept/decline')!=-1);
             }
           }, {
             tooltip: 'Просмотреть',
             icon: '/ico/settings/browse.png',
             handler: redirectActionHandler('user/view/id/{id}'),
             isHidden: function(v, meta, rec) {
               return !(component.links.indexOf('view')!=-1);
             }
           }, {
             tooltip: 'Блокировать',
             icon: '/ico/light.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_BLOCKED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_AUTHORIZED && component.links.indexOf('block/unblock')!=-1 && rec.data.status!=USER_STATUS_NOT_AUTHORIZED);
             }
           }, {
             tooltip: 'Разблокировать',
             icon: '/ico/profile.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_AUTHORIZED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_BLOCKED && component.links.indexOf('block/unblock')!=-1 && rec.data.status!=USER_STATUS_NOT_AUTHORIZED);
             }
           }, {
             tooltip: 'Удалить',
             icon: '/ico/delete.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_DELETED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status!=USER_STATUS_DELETED && component.links.indexOf('delete/restore')!=-1 && rec.data.status!=USER_STATUS_NOT_AUTHORIZED);
             }
           }, {
             tooltip: 'Восстановить',
             icon: '/ico/add.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_AUTHORIZED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_DELETED && component.links.indexOf('delete/restore')!=-1 && rec.data.status!=USER_STATUS_NOT_AUTHORIZED);
             }
           }
          ]});

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: cols
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Пользователи {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по пользователю',
        advancedSearch: [{
          xtype: 'textfield',
          name: 'user_id',
          fieldLabel: 'ID пользователя'
        }, {
          xtype: 'textfield',
          name: 'user_login',
          fieldLabel: 'Логин пользователя'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (search_params) {
            var sp;
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query);
          //store.setBaseParam('status', 2);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        },
        changestatus: function(user, status) {
          Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите изменить статус пользователя?', function(r) {
            if ('yes'==r) {
              var store = component.getStore();
              component.el.mask('Подождите...', 'x-mask-loading');
              RPC.User.changestatus(user, status, function(result){
                component.el.unmask();
                if (result.success) {
                  Ext.Msg.alert('Успешно', result.message||'Статус пользователя сменен успешно');
                  store.load();
                } else {
                  Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                }
              });
            }
          });
        } /*,
        declineuser: function(user) {
          Ext.Msg.confirm('Подтверждение', 'Вы действительно хотите отклонить доверенность пользователя?', function(cbtn) {
              if ('yes' == cbtn) {
                Ext.Msg.prompt('Информация', 'Пожалуйста, укажите причину отклонения заявки', function(btn, text) {
                  if ('ok' == btn) {

                    var win = new Application.components.promptWindow({
                      title: 'Уведомление об отклонении регистрации',
                      cmpType: 'Application.components.PromptForm',
                      cmpParams: {
                        api: RPC.Admin.decline
                      },
                      listeners: {
                        afterrender : function() {
                          Ext.getCmp('signature_text').setValue('Ваша заявка на регистрацию администратора отклонена. \nПричина отказа: ' + text.trim());
                        }
                      }
                    });
                    win.show();
                  }
                });
              }
            });
        },
        approveuser: function(user) {
          Ext.Msg.alert('Успешно', 'Пользователь авторизован');
        } */
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.AdminUserGrid.superclass.initComponent.call(this);
  }
});
