/**
 * Грид намерений об участии в процедуре
 *
 * Параметры:
 * list_type - тип просмотра my (свои намерения) | procs (намерения на свои процедуры)
 *
 */
Ext.define('Application.components.IntentionGrid', {
  extend: 'Ext.grid.GridPanel',
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');
    var component = this;

    var store = createIntentionsStore(component.list_type);

    var tbar;
    tbar = {
      xtype: 'Application.components.searchToolbar',
      eventTarget: this,
      searchHelp: 'Быстрый поиск по номеру процедуры'
    };

    var cols = [];
    cols.push({header: 'Реестровый №', dataIndex: 'registry_number', width: 50});
    cols.push({header: 'Номер лота', dataIndex: 'lot_number', width: 50});
    if ('my' != component.list_type) {
      cols.push({header: 'Всего намерений', dataIndex: 'intentions_count', width: 30});
    } else {
      cols.push({header: 'Дата направления', dataIndex: 'date_added', renderer: Ext.util.Format.dateRenderer('d.m.Y'), width: 30});
    }
    cols.push({header: 'Название закупки', dataIndex: 'procedure_title'});
    if ('my' != component.list_type) {
      cols.push({header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 40, items: [{
          tooltip: 'Просмотреть',
          icon: '/ico/settings/browse.png',
          handler: redirectActionHandler('com/applic/viewintention/lot/{lot_id}'),
          isHidden: function(v, meta, rec) {
            return false;
          }
        }]
      });
    }

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
          displayMsg: 'Намерения {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: tbar,
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
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    Application.components.IntentionGrid.superclass.initComponent.call(this);
  }
});
