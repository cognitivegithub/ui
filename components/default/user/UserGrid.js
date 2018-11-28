/**
 * Параметры компоненты:
 * directFn - откуда будет подгружаться стора.
 * params - параметры поиска пользователей.
 * links - массив возможных действий над пользователями (view|edit|rights|block/unblock|delete/restore|accept/decline|review)
 */
 Application.components.UserGrid = Ext.extend(Ext.grid.GridPanel, {
  id: 'UserGrid',
  frame : true,
  border : false,
  isBlockedDepartmant: false,
  initComponent : function () {
    this.addEvents('search');
    this.addEvents('changestatus');
    var component = this;
    var isFrGrid = component.params.act ? component.params.act == 'editFr' : false;
    var store = createUserStore(this.directFn, this.params);

    if(component.params.department_id && !isFrGrid) {
      RPC_po.Department.load(component.params.department_id, function(result) {
        if (result.success) {
          component.isBlockedDepartmant = result.data.is_deleted;
          var additionalTitle = component.params.department_id == DEPARTMENT_MANAGEMENT ?
            result.data.name :
            '№' + result.data.code;
          Ext.getCmp('UserGrid').ownerCt.setTitle('Пользователи подразделения ' + additionalTitle);
        }
      });
    }

    var user_roles_store = createUserRolesStore();
    if (component.params.is_admin) {
      user_roles_store.setBaseParam('is_admin', true);
    }

    function renderCompany(value, p, record) {
      return record.get('contragent_id') ? String.format('<a href="/#company/view/id/{0}">{1}</a>', record.get('contragent_id'), record.get('company')) : 'Не указано';
    }

    function renderUserFio(value, p, record) {
      return String.format('{0} {1} {2}', record.get('last_name'), record.get('first_name'), record.get('middle_name'));
    }
    var cols = [
          {id: 'id', header: 'ID', width: 15, dataIndex: 'id'},
          {header: 'Логин', dataIndex: 'username', width: 40},
          {header: 'Фамилия, имя и отчество', dataIndex: 'last_name', renderer: renderUserFio},
          {header: 'Должность', dataIndex: 'user_job', width: 50},
          {header: 'Роли', dataIndex: 'rolesNames', hidden: isFrGrid},
          {header: 'Телефон', dataIndex: 'user_phone', hidden: !isFrGrid},
          {header: 'Email', width: 50, dataIndex: 'user_email'},
          {header: 'Подразделение', dataIndex: 'department_name', hidden: isFrGrid},
          // На данный момент эти столбцы не нужны заказчику, но могут понадобиться позже.
          // {header: 'Дата регистрации', width: 40, dataIndex: 'date_added',
          //   renderer: Ext.util.Format.dateRenderer('d.m.Y')},
          // {header: 'Статус', width: 40, dataIndex: 'status_name'},
          // {header: 'Онлайн', width: 20, xtype: 'textactioncolumn', sortable: false,
          //   items: [
          //     {
          //       tooltip: 'Онлайн',
          //       icon: '/ico/accept.png',
          //         isHidden: function (v, meta, rec) {
          //           return !(rec.data.is_online == true);
          //         }
          //     },
          //     {
          //       tooltip: 'Оффлайн',
          //       icon: '/ico/light.png',
          //       isHidden: function(v, meta, rec) {
          //         return (rec.data.is_online == true);
          //       }
          //     }
          //   ]
          // },
          {header: 'Операции', width: 60, xtype: 'textactioncolumn', actionsSeparator: ' ', sortable: false,
           items: [
           /**
            * Просмотреть профиль пользователя.
            */
           {
             tooltip: 'Просмотреть',
             icon: '/ico/settings/browse.png',
             handler: redirectActionHandler('user/view/id/{id}' + (isFrGrid ? '/act/' + component.params.act : "")),
             isHidden: function(v, meta, rec) {
               return !(component.links.indexOf('view')!=-1 && rec.data.id != Main.user.id);
             }
           },
           /**
            * Просмотреть и изменить профиль пользователя.
            */
           {
             tooltip: 'Просмотреть и изменить',
             icon: '/ico/settings/change_data.png',
             handler: redirectActionHandler('user/view/id/{id}'),
             isHidden: function(v, meta, rec) {

               return !(component.links.indexOf('view')!=-1 && rec.data.id == Main.user.id);
             }
           },
           /**
            * Редактировать профиль пользователя.
            */
           {
             tooltip: 'Редактировать',
             icon: '/ico/edit.png',
             handler: redirectActionHandler('user/edit/id/{id}' + (isFrGrid ? '/act/' + component.params.act : "")),
             isHidden: function(v, meta, rec) {
               return !(isAdmin() || isGendir() && isFrGrid); //!(component.links.indexOf('edit')!=-1);
             }
           },
           /**
            * Просмотр подотчетных подразделений у ФРа.
            */
           {
             tooltip: 'Подотчетные подразделения',
             icon: '/ico/io_log.png',
             handler: redirectActionHandler('po/department/list/id/{id}'),
             isHidden: function(v, meta, rec) {
               return !((isGendir() || isUserAdmin()) && isFrGrid); // !(component.links.indexOf('edit')!=-1);
             }
           },
           /**
            * Права пользователя.
            */
           {
             tooltip: 'Права пользователя',
             icon: '/ico/status0.png',
             text: '',
             handler: function(grid, rowIndex) {
               var grid = grid.getStore();
               var item = grid.getAt(rowIndex);
               var roles_grid_id = Ext.id();
               var win = new Ext.Window({
                       title: 'Права пользователя ' + renderUserFio(null, null, item),
                       width: 700,
                       autoHeight: true,
                       layout: 'form',
                       modal: true,
                       items: [{
                         xtype: 'Application.components.UserRights',
                         user_id: item.data.id,
                         grid_only: true,
                         id: roles_grid_id
                       }],
                       buttons: [{
                         text: 'Сохранить',
                         handler: function() {
                           Ext.getCmp(roles_grid_id).getStore().save();
                         }
                       }, {
                         text: 'Закрыть',
                         handler: function() {
                           win.close();
                         }
                       }]
                     });
               win.show();
             },
             isHidden: function(v, meta, rec) {
               return true // !(component.links.indexOf('rights')!=-1) || rec.data.user_type == TYPE_EXPERT;
             }
           },
           /**
            * Отдел и роль в отделе пользователя
            */
           {
             tooltip: 'Отдел',
             icon: '/ico/roles.png',
             text: '',
             handler: function(grid, rowIndex) {
               var grid = grid.getStore();
               var item = grid.getAt(rowIndex);
               var user_department_id = Ext.id();
               var win = new Ext.Window({
                   title: 'Отдел пользователя и его роль в отделе',
                   width: 700,
                   autoHeight: true,
                   layout: 'form',
                   modal: true,
                   items: [{
                     xtype: 'Application.components.UserDepartment',
                     id: user_department_id,
                     user_id: item.data.id
                   }],
                   buttons: [{
                     text: 'Сохранить',
                     scope: this,
                     handler: function() {
                       var user_department = Ext.getCmp(user_department_id);
                       var cmp_values = {};
                       collectComponentValues(user_department, cmp_values);
                       cmp_values.user_id = item.data.id;
                       performRPCCall(RPC.User.departmentsave, [cmp_values], {wait_text: 'Сохраняем данные...', mask: true}, function(result){
                         if(result.success) {
                           Ext.Msg.alert('Успешно', 'Отдел сохранен успешно', function() {
                             win.close();
                           });
                         } else {
                           echoResponseMessage(result);
                         }
                       });
                     }
                   }, {
                     text: 'Закрыть',
                     handler: function() {
                       win.close();
                     }
                   }]
                 });
               win.show();
             },
             isHidden: function(v, meta, rec) {
               return !(component.links.indexOf('department')!=-1) || !Main.config.departments
                        || rec.data.user_type == TYPE_EXPERT;
             }
           },
           /**
            * Блокировать/разблокировать пользователя.
            */
           {
             tooltip: 'Блокировать',
             icon: '/ico/light.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_BLOCKED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_AUTHORIZED && component.links.indexOf('block/unblock')!=-1)
                 || rec.data.department_count > 0;
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
               return !(rec.data.status==USER_STATUS_BLOCKED && component.links.indexOf('block/unblock')!=-1);
             }
           },
           {
             tooltip: 'Сбросить сессию',
             icon: '/ico/exit.png',
             isHidden: function() {
               return isFrGrid;
             },
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('destroysession', {user_id: record.id});
             }
           },
           /**
            * Ссылки добавить удалить. Смотрит если статус пользователя USER_STATUS_DELETED, рисует
            * ссылку восстановить, иначе рисует удалить.
            */
           {
             tooltip: 'Удалить',
             icon: '/ico/delete.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.id, USER_STATUS_DELETED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status!=USER_STATUS_DELETED && component.links.indexOf('delete/restore')!=-1)
                        || rec.data.user_type == TYPE_EXPERT;
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
               return !(rec.data.status==USER_STATUS_DELETED && component.links.indexOf('delete/restore')!=-1);
             }
           }, {
             tooltip: 'Изменить кодовую фразу',
             icon: '/ico/script_key.png',

             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               Ext.Msg.prompt('', 'Введите новую кодовую фразу:', function(btn, text){
                 if (btn == 'ok') {
                    var params = {};
                    params.new_phrase = text;   
                    params.user_id = record.id;
                    performRPCCall(RPC.User.changesecret, [params], {wait_text: 'Сохраняем данные...', mask: true}, function(result){
                      if(result.success) {
                        Ext.Msg.alert('Успешно', 'Кодовая фраза изменена.', function() {
                          store.reload();
                        });
                      } else {
                        echoResponseMessage(result);
                      }
                    });
                 }
               });
             },
             isHidden: function(v, meta, rec) {
               return true
             }
           }, {
             tooltip: 'Разграничение прав',
             icon: '/ico/users_list.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var item = store.getAt(rowIndex);
               var grant_access_id = Ext.id();
               var win = new Ext.Window({
                       title: 'Настройка доступа пользователя ' + renderUserFio(null, null, item),
                       width: 700,
                       autoHeight: true,
                       layout: 'form',
                       modal: true,
                       items: [{
                         xtype: 'Application.components.UserGrantAccess',
                         user_id: item.data.id,
                         grid_only: true,
                         id: grant_access_id
                       }],
                       buttons: [
//                           {
//                         text: 'Применить к другим пользователям',
//                         handler: function() {
//                           Ext.getCmp(grant_access_id).getStore().save();
//                         }
//                       }, 
                               {
                         text: 'Сохранить',
                         handler: function() {
                           var tmp_arr = new Array();
                           var arr = new Object();
                           var i;
                           var grant_access = Ext.getCmp(grant_access_id);
                           var ga_grid_store = grant_access.grid.getStore();
                           for(i=0; i<ga_grid_store.data.length; i++){
                               arr = {};
                               arr.id = ga_grid_store.data.itemAt(i).data.id
                               arr.choose = ga_grid_store.data.itemAt(i).data.choose;
                               tmp_arr.push(arr);
                           }

                           var cmp_values = {};
                           collectComponentValues(grant_access, cmp_values);
                           cmp_values.user_id = item.data.id;
                           cmp_values.grid_array = tmp_arr;
                           performRPCCall(RPC.User.updateorguserslist, [cmp_values], {wait_text: 'Сохраняем данные...', mask: true}, function(result){
                             if(result.success) {
                               Ext.Msg.alert('Успешно', 'Права доступа успешно сохранены', function() {
                                 win.close();
                               });
                             } else {
                               echoResponseMessage(result);
                             }
                           });
                         }
                       }, {
                         text: 'Отмена',
                         handler: function() {
                           win.close();
                         }
                       }]
                     });
               win.show();
             },
             isHidden: function(v, meta, rec) {
               if (!isCustomerAdmin()){
                   return true;
               }
               else{
                   return false;
               }
             }
           }
         ]
        }]

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
        getRowClass : function(record){
          return 'x-color-' + (record.data.status === 3 ? '1' : '0');
        },
        forceFit: true
      },
      bbar: [
        new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Пользователи {0} - {1} из {2}',
          emptyMsg: "Список пуст"
        }),
        '-',
        renderStoreDownloadButton(store, 'user/list', 65500)
      ],
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по пользователю',
        hidden: isFrGrid,
        advancedSearch: [{
          xtype: 'numberfield',
          name: 'user_id',
          fieldLabel: 'ID пользователя'
        }, {
          xtype: 'textfield',
          name: 'user_login',
          fieldLabel: 'Логин пользователя'
        }, {
          xtype: 'textfield',
          name: 'user_email',
          fieldLabel: 'E-mail'
        }, {
          xtype: 'textfield',
          name: 'user_fio',
          fieldLabel: 'ФИО пользователя'
        }, {
          xtype: 'textfield',
          name: 'department_name',
          fieldLabel: 'Подразделение'
        }, {
          xtype: 'combo',
          name: 'user_role_id',
          valueField: 'id',
          displayField: 'name',
          fieldLabel: 'Роль пользователя',
          mode: 'local',
          store: user_roles_store,
          editable: false,
          triggerAction: 'all'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
          user_roles_store.load();
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (search_params) {
            var sp;
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        },
        changestatus: function(user, status) {
          Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите изменить статус пользователя?', function(r) {
            if ('yes'==r) {
              var store = component.getStore();
              component.el.mask('Подождите...', 'x-mask-loading');
              var rpcFn = RPC.User.changestatus;
              if (status == USER_STATUS_DELETED) {
                rpcFn = RPC.User.deletestatus;
              }
              performRPCCall(rpcFn, [user, status], null, function (result) {
                component.el.unmask();
                if (result.success) {
                  Ext.Msg.alert('Успешно', result.message || 'Статус пользователя сменен успешно');
                  store.load();
                } else {
                  Ext.Msg.alert('Ошибка', result.message || 'Ошибка связи с сервером');
                }
              });
            }
          });
        },
        destroysession: function(user) {
          Ext.Msg.confirm('Подтверждение', 'Вы уверены что сбросить сессию пользователя?', function(r) {
            if ('yes'==r) {
              var store = component.getStore();
              component.el.mask('Подождите...', 'x-mask-loading');
              RPC.User.endsession(user, function(result){
                component.el.unmask();
                if (result.success) {
                  Ext.Msg.alert('Успешно', result.message||'Сессия пользователя сброшена успешно');
                  store.load();
                } else {
                  Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                }
              });
            }
          });
        },
        /*rowcontextmenu: function(grid, index, ev) {
          if (!grid.ctxMenu) {
            grid.ctxMenu = new Ext.menu.Menu({
              items: [{
                text: 'Просмотреть',
                handler: function() {
                  redirect_to('user/view/'+grid.currentRow['id']);
                }
              }, {
                text: 'Одобрить',
                handler: function() {
                  grid.fireEvent('accept_user', grid.currentRow['id'], 1);
                }
              }, {
                text: 'Отклонить',
                handler: function() {
                  grid.fireEvent('accept_user', grid.currentRow['id'], 0);
                }
              }]
            });
          }
          grid.currentRow = grid.getStore().getAt(index);
          grid.ctxMenu.showAt(ev.getXY());
        },*/
        destroy: function() {
          if (this.ctxMenu) {
            Ext.destroy(this.ctxMenu);
            this.ctxMenu = undefined;
          }
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    Application.components.UserGrid.superclass.initComponent.call(this);
  }
});
