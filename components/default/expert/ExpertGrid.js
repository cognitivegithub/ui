Ext.define('Application.components.ExpertGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search', 'changestatus');

    var component = this;
    var store = createExpertsStore();

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {id: 'id', header: 'ID', width: 15, dataIndex: 'id'},
          {header: 'Название организации', dataIndex: 'company', width: 40},
          {header: 'ИНН', dataIndex: 'inn', width: 40},
          {header: 'Операции', width: 40, xtype: 'textactioncolumn', actionsSeparator: ' ',
           items: [{
            tooltip: 'Просмотреть',
            icon: '/ico/settings/browse.png',
            text: '',
            href: hrefAction('user/expertview/id/{id}')
           }, {
             tooltip: 'Авторизовать',
             icon: '/ico/profile.png',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               grid.fireEvent('changestatus', record.data.user_id, USER_STATUS_AUTHORIZED);
             },
             isHidden: function(v, meta, rec) {
               return !(rec.data.status==USER_STATUS_BLOCKED || rec.data.status==USER_STATUS_NOT_AUTHORIZED);
             }
           }]
          }
        ]
      }),
      viewConfig: {
        getRowClass : function(record){
          return 'x-color-' + (record.data.status === 3 ? '1' : '0');
        },
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Эксперты {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по экспертам',
        advancedSearch: [{
          xtype: 'textfield',
          name: 'company_name',
          fieldLabel: 'Наименование организации'
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
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        },
        changestatus: function(user, status) {
          Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите авторизовать экспертную организацию?', function(r) {
            if ('yes'==r) {
              var store = component.getStore();
              component.el.mask('Подождите...', 'x-mask-loading');
              RPC.User.changestatus(user, status, function(result){
                component.el.unmask();
                if (result.success) {
                  Ext.Msg.alert('Успешно', result.message||'Экспертная организация авторизована');
                  store.load();
                } else {
                  Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                }
              });
            }
          });
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    Application.components.ExpertGrid.superclass.initComponent.call(this);
  }
});
