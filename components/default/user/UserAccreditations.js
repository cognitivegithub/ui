/**
 * Грида выводит список заявок на регистрацию доверок.
 */
 Application.components.UserAccreditations = Ext.extend(Ext.grid.GridPanel, {
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');
    this.addEvents('changestatus');
    var component = this;
    var store = new Ext.data.DirectStore({
      directFn: RPC.User.listAccreditations,
      paramsAsHash: true,
      autoSave: true,
      root: 'rows',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id', 'user_id', 'status', {name: 'date', type: 'date', dateFormat: 'c'}, 'first_name', 'last_name', 'middle_name', 'user_email', 'user_job', 'contragent_id'
      ],
      sortInfo: {
        field: 'date',
        direction: 'ASC'
      },
      baseParams: merge_options(this.params, {limit: 25}),
      remoteSort: true
    });

    function renderUserFio(value, p, record) {
      return String.format('{0} {1} {2}', record.get('last_name'), record.get('first_name'), record.get('middle_name'));
    }

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {id: 'id', header: 'ID', width: 15, dataIndex: 'id'},
          {header: 'Фамилия, имя и отчество', renderer: renderUserFio},
          {header: 'Должность', dataIndex: 'user_job'},
          {header: 'Email', dataIndex: 'user_email'},
          {header: 'Дата регистрации', dataIndex: 'date', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s')},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ',
           items: [
           /**
            * Просмотреть профиль пользователя.
            */
           {
             tooltip: 'Просмотреть',
             icon: '/ico/settings/browse.png',
             handler: redirectActionHandler('user/view/id/{user_id}/draft/1')
           },
           /**
            * Рассмотреть заявку на регистрацию доверенности.
            */
           {
            tooltip: 'Рассмотреть заявку',
            icon: '/ico/settings/change_data.png',
            handler: function(grid, rowIndex) {
              var item = grid.getAt(rowIndex);
              if (item) {
                var location = 'user/review/id/{id}/user_id/{user_id}';
                if (item.data.contragent_id === null) {
                  location += '/user_type/admin';
                }
                var template = new Ext.Template(location);
                var location = template.apply(item.data);
              }
              redirect_to(location);
            }
           }
         ]
        }
        ]
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
          name: 'company_name',
          fieldLabel: 'Наименование организации'
        }, {
          xtype: 'numberfield',
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
          store.setBaseParam('status', 2);
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
        },
        rowcontextmenu: function(grid, index, ev) {
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
        },
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
    Application.components.UserAccreditations.superclass.initComponent.call(this);
  }
});
