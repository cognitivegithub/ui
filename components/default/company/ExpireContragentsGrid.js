Ext.define('Application.components.ExpireContragentsGrid', {
  extend : 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');
    var store = createExpireContragentsStore();
    
    Ext.apply(this,
    {
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: [
        {id: 'id', header: 'ИД', width: 40, dataIndex: 'id'},
        {header: 'Название организации', dataIndex: 'full_name', width: 150},
        {header: 'ИНН', dataIndex: 'inn', width: 60},
        {header: 'КПП', dataIndex: 'kpp', width: 60},
        {header: 'Аккредитация истекает', dataIndex: 'valid_for', width: 95, renderer: Ext.util.Format.dateRenderer('d.m.Y')},
        {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: [
           {
            tooltip: 'Просмотреть',
            icon: '/ico/settings/browse.png',
            handler: redirectActionHandler('company/profile/id/{id}')
           }
        ]}
      ],
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Организации {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по названию организации',
        advancedSearchActive: true,
        advancedSearchOnly: true,
        advancedSearch: [
          {
            xtype: 'textfield',
            fieldLabel: 'Название',
            name: 'query'
          }, {
            xtype: 'combo',
            name: 'type',
            fieldLabel: 'Тип организации',
            mode: 'local',
            store : new Ext.data.ArrayStore({
                id: 0,
                fields: [
                    'id',
                    'name'
                ],
                data: [
                  ['customer', 'Заказчик'],
                  ['supplier', 'Заявитель']
                ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            hiddenName : 'name',
            triggerAction: 'all'
          }
        ]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        search: function(query, search_params) {
          var store = this.getStore();
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.ExpireContragentsGrid.superclass.initComponent.call(this);
  }
});
